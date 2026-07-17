# 舟友同好集会地图

> 明日方舟 ONLY 漫展分布地图 —— 让大家一起标记各地举办过 / 即将举办的舟游集会。

一个**全栈可协作**的地图网站：进入即是地图，标点即看详情；左侧列表可筛选搜索；注册账户后可提交 / 编辑漫展；数据可从 Excel / 腾讯文档批量导入。

参考站点：[kigmap.com](https://kigmap.com) ｜ 地图：高德地图 JS API ｜ 风格：明日方舟（主色 `#4AABEA`）

---

## ✨ 功能特性

- 🗺️ **地图首页**：进入即见高德地图与漫展标记，按状态着色（即将举办·蓝 / 进行中·黄 / 已结束·灰）
- 📍 **点击查看详情**：标记或列表项点击后右侧滑出详情卡（日期、城市、场馆、地址、主办、来源、介绍、提交者）
- 📋 **侧边列表 + 筛选**：按「即将举办 / 进行中 / 已结束」切换，按城市筛选，关键词搜索
- 👤 **轻量账户**：昵称 + 密码注册登录，确定提交者身份；首位注册者自动成为管理员
- ➕ **提交 / 编辑**：登录后提交新漫展，支持「在地图上选点」或填地址自动解析坐标
- 📥 **数据导入**：Excel(.xlsx) / CSV 一键导入，也支持腾讯文档导出的 CSV 链接
- 🎨 **明日方舟风格**：深蓝主题、`#4AABEA` 主色、衬线标题、斜切角按钮

---

## 🛠 技术栈

- **部署形态（推荐）**：Cloudflare Pages + D1（serverless SQLite）+ Pages Functions
- 后端：Hono 框架（运行于 Cloudflare Pages Functions），数据层为 D1 异步 API
- 前端：原生 HTML/CSS/JS（无构建步骤）+ 高德地图 JS API 2.0
- 认证：node:crypto scrypt 加盐哈希 + HMAC-SHA256 签名 Cookie（首位注册者自动为管理员）
- 导入：SheetJS(xlsx) 读表 + 高德 Web 服务地理编码补全坐标
- *兼容遗留*：`server/`（Express + better-sqlite3）仍可本地或自托管 VPS 运行，详见部署章节

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制示例并填写：
```bash
cp .env.example .env
```
至少填写 `AMAP_KEY` 与 `AMAP_SECURITY_CODE`（前端地图，见下方申请步骤）。若想让坐标在服务器端批量预解析（首屏秒出标记），还需申请一个「Web 服务」类型的 Key 填入 `AMAP_WEB_KEY`（见下方）。`SESSION_SECRET` 建议改成随机长串。

### 3. 启动（两种形态）

**A. Cloudflare 形态（推荐，与线上一致）**
```bash
npm install
npm run d1:init        # 初始化本地 D1（首次）
npm run seed:local     # 生成并导入种子数据（可选，让本地也有标记）
npm run dev            # 启动 wrangler pages dev，浏览器打开 http://localhost:8788
```

**B. Node 自托管形态（legacy，可选）**
```bash
npm start              # Express + better-sqlite3，浏览器打开 http://localhost:3000
```

---

## 🔑 申请高德地图 Key（Web 端）

1. 注册 / 登录 [高德开放平台](https://console.amap.com/)
2. 进入「应用管理 → 我的应用 → 创建新应用」
3. 添加 Key：**服务平台 选「Web端 (JS API)」**
4. 创建后会得到 `Key` 和 `安全密钥`（即 securityJsCode）
5. 把这两个值分别填入 `.env` 的 `AMAP_KEY` 与 `AMAP_SECURITY_CODE`
6. 重启服务即可看到地图

> 不使用 Key 时，地图区域显示占位提示，但列表 / 提交 / 导入功能均不受影响。

### 🔑 申请高德「Web 服务」Key（服务端批量解析坐标）

地图标记需要经纬度。本项目用「Web 服务」Key 在服务端批量把地址解析成坐标，写入数据库后所有人**首屏即可见标记**，无需浏览器逐个解析。

1. 在**同一个高德应用**下「添加」新 Key
2. **服务平台 选「Web 服务」**（注意：与上面的「Web端(JS API)」是两种类型，不能混用；用错会报 `USERKEY_PLAT_NOMATCH`）
3. 把生成的 Key 填入 `.env` 的 `AMAP_WEB_KEY`（若开启了「数字签名」，私钥填 `AMAP_WEB_SECRET`）
4. 运行批量解析（已导入的数据会自动补全缺坐标的活动）：
   ```bash
   npm run geocode
   ```
5. 极少数解析失败的活动，可在网站上以管理员身份点「📍 补全坐标」重试，或手动「在地图上选点」补全。

---

## 📥 导入数据（Excel / CSV / 腾讯文档）

把你的表格整理成下列列（中英文列名都可自动识别，缺列也无妨）：

| 列名 | 含义 | 必填 |
|------|------|------|
| 名称 / 标题 | 漫展名称 | ✅ |
| 城市 / 省份 | 所在地 | 建议 |
| 场馆 / 地址 | 定位用 | 建议 |
| 开始日期 / 结束日期 | 用于状态计算 | 建议（YYYY-MM-DD） |
| 经度 / 纬度 | 精确坐标；缺省可填地址自动解析 | 可选 |
| 主办 / 来源链接 / 海报链接 / 介绍 / 标签 / 核实 | 详情字段 | 可选 |

命令：
```bash
# 本地 Excel / CSV
node scripts/import_excel.js data/你的表格.xlsx
node scripts/import_excel.js data/你的表格.csv

# 腾讯文档：在腾讯文档里「下载 / 导出为 CSV」，把 CSV 链接（公开可访问）传给脚本
node scripts/import_excel.js "https://docs.qq.com/.../export.csv"

# 导入时同时用「Web 服务」Key 补全坐标（需已配置 AMAP_WEB_KEY）
node scripts/import_excel.js data/你的表格.csv --geocode

# 更常用的做法：导入后单独批量解析全部缺坐标活动
npm run geocode

# 先清空旧数据再导入
node scripts/import_excel.js data/你的表格.xlsx --clear
```

> **腾讯文档同步说明**：腾讯文档本身没有免鉴权的公开读取 API。最稳妥的做法是「导出为 CSV」后用上面的链接 / 文件导入；脚本也提供 `--geocode` 自动补坐标。若需要真正的实时同步，可后续接入腾讯文档开放 API（需 OAuth 授权）。

导入的示例数据见 `data/sample_conventions.csv`，可直接体验：
```bash
node scripts/import_excel.js data/sample_conventions.csv
```

---

## 👤 账户与权限

- 注册即获得身份；**首位注册的用户自动成为管理员**（可导入、可编辑 / 删除任意活动）
- 普通用户可提交新漫展，并编辑 / 删除自己提交的活动
- 会话用 HMAC 签名 Cookie 维持，密码以 scrypt 加盐哈希存储

---

## 📁 目录结构

```
webdemo/
├── functions/
│   └── api/[[route]].js  # Cloudflare Pages Functions 入口（Hono 挂载 /api/*）
├── src/
│   ├── app.js       # Hono 应用：全部 /api 路由
│   ├── db-d1.js     # D1(serverless SQLite) 数据层（users / conventions）
│   ├── auth.js      # 注册 / 登录 / 会话（Workers 适配）
│   └── geocode.js   # 高德 Web 服务地理编码
├── public/              # 前端静态资源（Pages 直接托管）
│   ├── index.html
│   ├── css/style.css   # 明日方舟风格主题
│   └── js/app.js       # 地图 / 列表 / 详情 / 账户 / 提交
├── migrations/
│   └── 0001_init.sql    # D1 建表
├── scripts/
│   ├── import_excel.js  # Excel/CSV 导入（Node 形态）
│   └── build_seed.js    # 从本地库导出脱敏种子 SQL（供 D1 导入）
├── server/              # 遗留：Express + better-sqlite3 形态（可选自托管）
├── data/                # 本地开发库 / 种子（见 .gitignore）
├── wrangler.toml        # Cloudflare Pages + D1 配置
├── .env.example
└── README.md
```

---

## 🌐 部署到公网

> ⚠️ **重要前提**：本项目是**全栈应用**（登录认证 + 数据库），不是纯静态页。
> 纯静态托管（GitHub Pages、Vercel 静态模式）**跑不了后端 API 与数据库**。本仓库已为 **Cloudflare Pages + D1** 适配，这是最省心、口碑最好的路线。

### 方案 A（推荐）：Cloudflare Pages + D1

免费额度大方、全球 CDN 快、自带 HTTPS，且 **D1 数据库天然持久**（重新部署不会丢数据），非常适合本项目的长期运营。

#### 1. 准备 Cloudflare 账户与 Wrangler
```bash
npm install            # 已包含 wrangler
npx wrangler login     # 浏览器授权登录 Cloudflare
```

#### 2. 创建 D1 数据库（只需一次）
```bash
npx wrangler d1 create arknights-only-map
# 终端会给出一个 database_id，把它填进 wrangler.toml 的 database_id
```
然后初始化表结构：
```bash
npm run d1:init:remote
```

#### 3. 配置环境变量与密钥
Cloudflare 里分两类（都在 Cloudflare 控制台 → Pages → 你的项目 → Settings → Environment variables 设置，或用 wrangler）：
- **普通变量（Variables）**：`AMAP_KEY`、`AMAP_SECURITY_CODE`、`AMAP_WEB_KEY`、`AMAP_WEB_SECRET`（可选）
- **密钥（Secrets，不会在控制台明文显示，更安全）**：`SESSION_SECRET`（务必用随机长串）

命令行设置示例：
```bash
npx wrangler pages secret put SESSION_SECRET          # 交互输入
npx wrangler pages secret put AMAP_WEB_KEY
# 普通变量用：npx wrangler pages project set-var ... 或在控制台填写
```

#### 4. 部署
```bash
npm run deploy         # 等同 wrangler pages deploy public
```
完成后 Cloudflare 给一个 `*.pages.dev` 公网地址。

#### 5. 导入活动数据（让地图有标记）
本地生成脱敏种子 SQL，再导入刚建的 D1：
```bash
npm run seed:build            # 从本地 data/app.db 生成 data/seed.sql（已脱敏联系方式）
npm run seed:remote           # 写入线上 D1
```
> 若你手上没有本地 `data/app.db`，可手动在网站上注册管理员后，用「📍 补全坐标」或「提交」功能录入，或自行整理 CSV 后用 `scripts/import_excel.js` 导入本地库后再走上面流程。

#### 6. 高德 Key 域名白名单（重要）
前端地图用的 **JS API Key** 在 AMap 控制台若设置了「域名白名单 /  referers 限制」，请加上你的 Cloudflare 域名（如 `xxx.pages.dev` 或你绑定的自定义域名），否则地图会报「INVALID_USER_SCODE / 域名校验失败」。若嫌麻烦，可把该 Key 的域名限制关掉（仅建议测试期）。

#### 本地预览（与线上一致）
```bash
npm run d1:init      # 初始化本地 D1（首次）
npm run seed:local   # 可选：生成并导入本地种子
npm run dev          # wrangler pages dev，打开 http://localhost:8788
```

### 方案 B：云服务器 / 轻量应用服务器（Docker，自托管 VPS）

数据库以单文件 `data/app.db` 形式存在，挂载卷后重启不丢，适合已有服务器的场景。`server/` 里是 Express + better-sqlite3 形态。

```bash
docker compose up -d --build   # 在同目录准备 .env（含 SESSION_SECRET / AMAP_*）
# 访问 http://服务器IP:3000
```

### 方案 C：Railway / Render 等 Git 部署平台

在平台连仓库，**Start command 填 `npm start`**（走 `server/` 的 Node 形态），环境变量设置：`SESSION_SECRET`、`AMAP_KEY`、`AMAP_SECURITY_CODE`、`AMAP_WEB_KEY`。

⚠️ SQLite 持久化注意：免费实例文件系统重启可能被清空。挂载持久化磁盘并把 `DB_PATH` 指向挂载目录（如 `/data/app.db`）。

### 方案 D：腾讯云 CloudStudio（开发容器）

CloudStudio 是带终端的真实容器，可跑 Node 形态：终端 `npm install` → 填 `.env` → `npm start`，再用端口转发暴露 3000。注意休眠 / 销毁会丢数据。

### 环境变量清单

Cloudflare Pages 通过 **绑定 + 变量 / 密钥** 注入（见 wrangler.toml 的 `[[d1_databases]]` 与控制台 Environment variables）：

| 名称 | 类型 | 说明 |
|------|------|------|
| `DB` | D1 绑定 | 数据库（由 wrangler.toml 绑定，代码里用 `c.env.DB`） |
| `SESSION_SECRET` | Secret | 会话签名密钥，**务必随机长串** |
| `AMAP_KEY` | Variable | 高德 Web 端(JS API) Key |
| `AMAP_SECURITY_CODE` | Variable | 高德安全密钥 |
| `AMAP_WEB_KEY` | Secret | 高德 Web 服务 Key（服务端批量解析坐标） |
| `AMAP_WEB_SECRET` | Secret | Web 服务数字签名私钥（仅开启数字签名才填） |

Node 自托管形态（`server/`）则用 `.env` 文件：`PORT`、`SESSION_SECRET`、`AMAP_KEY`、`AMAP_SECURITY_CODE`、`AMAP_WEB_KEY`、`AMAP_WEB_SECRET`、`DB_PATH`。

---

## 💡 可扩展方向

- 活动图片上传（当前用图片 URL，可加 OSS / 本地上传）
- 评论 / 打卡 / 收藏
- 管理员审核流（标记 `verified`）
- 真正的腾讯文档实时同步（开放 API + 定时任务）
- 移动端 PWA / 小程序
