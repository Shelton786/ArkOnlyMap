# CPP 集会数据采集 · 重设计方案

> 状态：**已实现**（2026-08-04 编码完成，见 `scripts/ingest/cpp.mjs`）
> 背景：原 `scripts/ingest/cpp.mjs` 假设 JSON API（`https://cp.allcpp.cn/api/event/search`），实测双重错误（多 `/api` 前缀 + 指向阿里云 OSS 静态桶），完全无效，已重写为 HTML 抓取器。

## 1. 实测结论（CPP 数据架构分层）

| 层 | 端点 | 可达性 | 说明 |
|---|---|---|---|
| 移动端列表 / 搜索结果 | `cp.allcpp.cn/event/search?keyword=&pageCurrent=` | ❌ Web 不可达 | React SPA，取数全部走 `window.AllcppJSBridge.call()`。**`call` 函数无 Web 兜底**：有原生 `request` 走原生，否则走 iOS `webkit.messageHandlers`。纯桌面浏览器两类皆无，列表接口被原生桥卡死。你看到的 `.event-box` 是 App/WebView 内桥返回数据后渲染的 DOM。 |
| 详情页 | `https://www.allcpp.cn/allcpp/event/event.do?event=<EID>` | ✅ Web 直连可用 | 传统服务端渲染页面。**无需登录**，数据以 `eventParam` JS 对象形式直接内联在 HTML 中（非 SPA 客户端拉取）。 |
| 标签页 | `cp.allcpp.cn/tag/pic?tag=...` | ❌ 404 | 不可作为列表源。 |

**核心判断**：详情页是金矿（自动抓），活动 ID 列表这一步需手动提供（见 §4）。

## 2. 目标

把 `scripts/ingest/cpp.mjs` 重写为 **HTML 抓取器**：

1. 输入：活动 ID 列表（两种来源，见 §4）；
2. 对每个 EID 自动抓取并解析详情页；
3. 归一化后，经 `run.mjs` 的 `ON CONFLICT(source, source_id)` 幂等 upsert 写入 D1（`arknights-only-map`）。

## 3. 数据源

- **列表来源（手动一步）**：
  - A. App 内打开搜索页，把渲染好的页面「另存为」HTML（每个 `.event-box` 都带 `event.do?event=<ID>` 链接）；
  - B. 手动提供一串活动 ID 或详情页 URL（txt / json）。
- **详情来源（全自动）**：`GET https://www.allcpp.cn/allcpp/event/event.do?event=<EID>`，`User-Agent: Mozilla/5.0`，无需 Cookie。

## 4. 输入模式（两种都支持）

- **模式 A（解析 App 保存的搜索 HTML）**
  正则提取每个活动卡片里的详情链接：
  ```regex
  /event\.do\?event=(\d+)/g
  ```
  从 HTML 中收集所有 EID，去重。
- **模式 B（ID / URL 清单文件）**
  支持 `.txt`（每行一个 EID 或完整 URL）或 `.json`（数组）。统一抽取数字 ID：
  ```regex
  /(\d+)/  或  /event\.do\?event=(\d+)/
  ```
- 脚本通过参数切换：`--from-html <file>` 或 `--from-list <file>`。

## 5. 字段映射（eventParam → conventions.EVENT_COLS）

已对照 `src/db-d1.js` 的 `EVENT_COLS` / `UPSERT_COLS` 核对，**无需新增列**。

| CPP 字段（eventParam / 页面节点） | conventions 列 | 处理 |
|---|---|---|
| `eventName` | `title` | 直取 |
| `sDate` / `eDate` | `start_date` / `end_date` | `YYYY-MM-DD` 直取；同日则两值相等 |
| `eventCity` | `city` | 直取（如「无锡市新吴」） |
| `eventCityId` | `city_code` | 直取数字编码 |
| `enterAddress` | `venue`(+`address`) | 场馆名；可整体存入 `address` |
| `picUrl` | `poster_url` | 协议相对 `//imagecdn3.allcpp.cn/...` → 补 `https:` |
| `eventTag` | `tags` | 逗号/分号分隔 → 数组 |
| `desContent` | `description` | 简介；`tbLink` 购票链接可并入此处或 `source_url` |
| `EID` | `source_id` | 配合 `source='cpp'` 做幂等键 |
| 主办方 `<a href="u/<id>.do" title="<名>">` | `organizer` / `organizer_user_id` | 名 + 数字 ID |
| （固定值） | `source` / `country` / `country_code` | `'cpp'` / `'中国'` / `'CN'` |
| （固定值） | `review_status` | 建议首跑用 `'pending'`（管理员核对映射无误后再改 `'approved'`，避免脏数据直接上图） |
| `isOnly` / `lastDays` / `eventType` | （可选） | 可并入 `tags` 或忽略 |

> 落地/经纬度：`eventParam` 不含 `latitude`/`longitude`，留 `null`（可由城市名后续地理编码补全，不在本方案范围）。

## 6. 解析方法

- 拉取详情页 HTML（含限速与重试，见 §8）。
- 提取 `eventParam` 赋值块：
  ```regex
  /eventParam\.(\w+)\s*=\s*"((?:[^"\\]|\\.)*)"/g
  ```
  注意处理 JS 字符串转义（`\"`、换行）。
- 标签：`<a [^>]*tag=([^"&]+)[^>]*>([^<]+)</a>`。
- 主办方：`/u\/(\d+)\.do"[^>]*title="([^"]+)"/`。

## 7. 归一化与写入（复用现有模块）

- `scripts/ingest/normalize.mjs`：城市名清洗、`tags` 字符串→数组、日期格式化、`country`/`country_code` 赋值。
- `scripts/ingest/run.mjs`：复用其 `UPSERT_COLS` 与 `ON CONFLICT(source, source_id) DO UPDATE` 逻辑（幂等；重复跑只更新不新增）。
- 单条记录形如：
  ```js
  { source:'cpp', source_id: EID, title, start_date, end_date, city, city_code,
    venue, address, poster_url, tags:[...], description, organizer,
    organizer_user_id, country:'中国', country_code:'CN', review_status:'pending',
    imported_at: <now> }
  ```

## 8. 限制与风险

1. **列表需手动**：ID 列表这一环绕不开原生桥，必须由用户在 App 端存 HTML 或给 ID 清单。详情抓取本身全自动。
2. **登录字段缺失**：你提到「有的数据登录后才显示」（如联系方式、精确票价）。公开展情页拿不到这些，核心字段（名称/日期/城市/场馆/海报/标签/主办方）都有。
3. **请求频率**：逐条 GET 详情页，建议限速（如间隔 200–500ms）+ 简单重试（2–3 次），避免被拦。
4. **海报协议相对**：`picUrl` 为 `//imagecdn3...`，必须补 `https:`。
5. **站点改版风险**：`eventParam` 字段名若变动需同步调整正则；建议保留 fixtures 做回归。

## 9. 实施步骤（确认后编码）

1. 重写 `scripts/ingest/cpp.mjs`：`fetchDetail(eid)` + `parseEventParam(html)` + `parseListFromHtml(file)` + `parseListFromText(file)`。
2. HTML 解析优先用正则（零依赖）；如需更稳可引入 `cheerio`（先确认 `node_modules` 是否已装）。
3. 接入 `run.mjs` 的 upsert 导出（或复用其 SQL 生成）。
4. 加：限速、重试、进度日志、`--dry-run`（只输出待写入记录供核对，不落库）。
5. 缓存 EID=7057 的真实详情 HTML 作为 fixture，供解析单测。

## 10. 验证方案

- **单元**：用 fixture（EID=7057）验证 `parseEventParam` 各字段提取正确。
- **Dry-run**：`--from-list` 少量 ID + `--dry-run`，人工核对映射与字段完整性。
- **正式 upsert**：确认无误后去掉 `--dry-run`，经 `wrangler d1 execute --remote` 写入线上 D1；随后在地图/管理台核对 `source='cpp'` 记录。
- **部署注意**：写入走 `wrangler d1 execute`，不涉及 Functions 包；但若同步改了 `src`，记得清 `node_modules/.cache/wrangler` 缓存再部署（见 MEMORY.md 部署铁律）。

## 11. 实现后的用法（cpp.mjs 已落地）

```bash
# 模式 A：解析你在 App 内「另存为」的搜索结果 HTML（推荐，地点文本可兜底城市）
node scripts/ingest/run.mjs --from-html "<path>/搜索结果.html" --dry-run
node scripts/ingest/run.mjs --from-html "<path>/搜索结果.html"            # 正式写入

# 模式 B：ID / URL 清单（.txt 每行一个 ID 或链接；.json 数字/对象数组）
node scripts/ingest/run.mjs --from-list "<path>/ids.txt" --dry-run
node scripts/ingest/run.mjs --from-list "<path>/ids.json"

# 通用选项
#   --dry-run            只生成 scripts/ingest/data/ingest.sql，不写远程 D1（先核对）
#   --review-status approved   覆盖默认审核态（cpp 默认 pending，待人工核对映射）
#   --approve            等价于 --review-status approved（直接上图）
```

要点：
- **综合展自动排除**：标题含 `综合` 的展会（如「综合同人展 · Together Workshop 35SP」）直接跳过、不入库——用户明确要求。判定逻辑在 `isExcluded()`，关键词列表 `EXCLUDE_NAME_KEYWORDS` 可改。
- 清单（模式 B）无地点文本时城市可能为空（CPP 详情页 `eventCity` 常为 `""`/`eventCityId=-1`）；用模式 A 的 App 搜索 HTML 可借「地点：」文本补全城市。
- 验证用 fixture 已留在 `scripts/ingest/fixtures/`：`event-7057.html`（真实详情页）、`sample-search.html`（合成搜索卡片）、`event-comprehensive.html`（综合展样例）、`test-ids.txt`（ID 清单样例）。
