# 反哺 CPP_Search 项目的改进提案

> 用途：本项目（舟友同好集会地图）基于 [WindowsNoEditor/CPP_Search](https://github.com/WindowsNoEditor/CPP_Search)
> 逆向出的 `eventMainListV2.do` 接口实现了 CPP 自动同步，已在 README 鸣谢。
> 作为回馈，这里整理了对 `CPP_Search.php` 的代码评审与改进建议，方便直接提 Issue / PR。
> （本机无 `gh`、GitHub 连接器未登录，无法直接推送，故以文档形式交付，请作者或本仓库维护者代提交。）

---

## 先说优点（已借鉴到本项目）

- 用 `errorWrap: json` 请求头让后端返回 JSON 而非 HTML 错误页——关键技巧，我们照搬了。
- 自动处理 `gzip` 解压（`CURLOPT_ENCODING => ''`）、`usleep(300000)` 限速，避免被拦。
- 识别 `enabled == 5` 为「已取消」并打标，识别进行中 / 倒计时状态——我们也据此实现了"跳过已取消展会"。
- 海报相对路径自动拼 `https://imagecdn3.allcpp.cn/upload` 前缀——一致。

---

## 改进点（按优先级）

### 1. `parseType()` 是死代码，且基于不存在的字段（建议删除或改写）

`parseType()` 里读的是 `$item['evmtype']`，但**真实接口并不返回 `evmtype`**（实测响应顶层键只有 `id/type/tag/enabled/...`，无 `evmtype`；`type` 才是 `"ONLY"/"综合同人展"` 这类中文标签）。因此：

- 那个 `$typeMap`（`evmtype`→类型）分支**永远走不到**，是死代码（函数随后会落到"从 tag 猜类型"的兜底，而非直接 `return '综合展'`）；
- 更关键的是它**从未被调用**——`parseEvents()` 直接用 `$item['type']` 赋值 `type`。

这会让后来者误以为有 `evmtype` 映射可用。建议：直接删除 `parseType()`，或若想做类型归一化，改为基于 `type` 字符串：

```php
// 若需要类型归一化，建议基于真实存在的 type 字段
function normalizeType($item) {
    $t = isset($item['type']) ? $item['type'] : '';
    if (strpos($t, 'ONLY') !== false) return 'ONLY';
    if (strpos($t, '茶会') !== false) return '茶会';
    if (strpos($t, '综合') !== false) return '综合展';
    return $t ?: '其他';
}
```

### 2. 分页抓取失败会静默丢数据（建议加重试）

```php
for ($page = 2; $page <= $totalPages; $page++) {
    $pageResponse = fetchPage($msg, $page);
    if ($pageResponse !== false) {        // ← 失败页直接跳过，无声无息
        ...
    }
    usleep(300000);
}
```

某一页因瞬时网络抖动失败时，那一页的活动会被**整页丢弃且不报错**，下游拿到的数据不完整。建议 `fetchPage` 内置 2–3 次重试 + 退避，并在最终仍失败时给输出打一个 `partial: true` 标记：

```php
function fetchPage($search, $page, $retries = 3) {
    for ($i = 1; $i <= $retries; $i++) {
        $resp = _curlGet($search, $page);
        if ($resp !== false) return $resp;
        usleep(200000 * $i); // 退避
    }
    return false;
}
```

（本项目 `cpp.mjs` 已用 `MAX_RETRY=3` 对列表与详情页都做了重试，可作为参考。）

### 3. `enabled` 状态语义在两处自相矛盾（建议统一）

- `parseEvents()` 里：`enabled == 5` → 取消（追加 `(已取消)`）。
- `parseEnded()` 里：`enabled == 1` → `'已结束'`、`== 2` → `'筹备中'`、`== 5` → `'已取消'`。

两处对 `enabled` 的解释**分散、未统一**（并非真正矛盾：两边都认 `5` 为取消），维护时容易改了这边漏那边。建议：

1. 统一一个 `interpretEnabled($item)` 函数，集中解释 `enabled`；
2. 取消的展会（`enabled == 5`）默认**过滤掉**而非仅打标——加一个 `includeCancelled`（默认 0）参数，方便只想要有效活动的下游；本项目即采用"跳过已取消"策略。

### 4. 关闭了 TLS 校验（建议开启）

```php
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
```

对公网 HTTPS 站点关闭校验会引入中间人风险。建议删除这两行（默认开启校验）；若仅本地调试需要，可用环境变量开关控制。

### 5. 缺少连接超时（建议补充）

只设了 `CURLOPT_TIMEOUT = 30`（总超时），建议额外设 `CURLOPT_CONNECTTIMEOUT = 10`，连接阶段卡死时能更快失败、更快重试。

### 6. `date_default_timezone_set('Asia/Shanghai')` 在循环内重复调用（建议提到顶部）

`getEventStatusTag()` 与 `parseEnded()` 每个条目都调一次时区设置。在函数外（脚本顶部）设置一次即可：

```php
date_default_timezone_set('Asia/Shanghai');
```

### 7. 分页总数与 pageSize 硬编码耦合（建议用变量）

`ceil($total / 10)` 与请求的 `pageSize => 10` 写死一致。若要调整每页条数，两处需同步改。建议抽取为常量：

```php
$pageSize = 10;
$totalPages = ceil($total / $pageSize);
```

### 8. `tag` 字段是竖线分隔的多值（建议拆分）

真实 `tag` 形如 `"明日方舟|明日方舟only"`。下游若想按标签筛选，建议返回数组而非原串：

```php
'tags' => isset($item['tag']) ? explode('|', $item['tag']) : [],
```

---

## 附：如何提交

- 可以直接把上面的「改进点」作为 **Issue** 贴到仓库；
- 或基于上述代码片段整理成 **PR**（作者似乎单文件维护，改起来很快）；
- 若作者有意，欢迎把本项目的 `cpp.mjs`（TypeScript/Node 版、含重试/取消过滤/类型精准排除/行政区划映射）作为跨语言参考实现。
