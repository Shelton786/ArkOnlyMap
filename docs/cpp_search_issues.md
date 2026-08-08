# 给 CPP_Search 提的 GitHub Issues（已对照源码核实）

> 以下 5 个 Issue 均基于 `main` 分支的 `CPP_Search.php` 实际代码核对，可直接复制粘贴到
> https://github.com/WindowsNoEditor/CPP_Search/issues 新建。
> 标题行就是 Issue 标题，下面正文直接贴即可。

---

## Issue 1（正确性）：`parseType()` 是死代码，且依赖一个不存在的字段

**标题建议：** `parseType()` 未被调用，且依赖接口并不返回的 `evmtype` 字段

**正文：**

项目里有个 `parseType($item)` 函数（约第 200 行），它先读 `$item['evmtype']` 来做类型映射：

```php
function parseType($item) {
    if (isset($item['evmtype'])) {
        $typeMap = [0 => '综合展', 1 => 'ONLY', 2 => '茶会', 3 => '漫展'];
        return isset($typeMap[$item['evmtype']]) ? $typeMap[$item['evmtype']] : '其他';
    }
    // 下面是从 tag 猜类型的兜底……
    return '综合展';
}
```

但有两个问题：

1. **真实接口数据里根本没有 `evmtype` 这个字段**（实测返回的字段是 `id/type/tag/enabled/...`，活动类型在 `type` 字段，值是中文如 `"ONLY"`、`"综合同人展"`）。所以上面那个 `$typeMap` 分支永远走不到，是死代码。
2. **更关键的是，这个函数从头到尾没有被调用过。** 真正产出数据时，`parseEvents()` 里写死用的是：
   ```php
   'type' => isset($item['type']) ? $item['type'] : '综合展',
   ```
   也就是说 `parseType()` 完全是摆设，新接手的人却会误以为有 `evmtype` 这个映射可用。

**建议：** 直接删掉 `parseType()`。如果确实想做类型归一化，改成基于真实存在的 `type` 字段：

```php
function normalizeType($item) {
    $t = isset($item['type']) ? $item['type'] : '';
    if (strpos($t, 'ONLY') !== false) return 'ONLY';
    if (strpos($t, '茶会') !== false) return '茶会';
    if (strpos($t, '综合') !== false) return '综合展';
    return $t ?: '其他';
}
```

---

## Issue 2（数据完整性）：翻页抓取失败会"偷偷丢"一整页数据

**标题建议：** 某一页抓取失败时整页被静默丢弃，建议加重试

**正文：**

抓取活动列表是一页一页抓的（每页 10 条）。主流程里第 2 页起的循环是这样的：

```php
for ($page = 2; $page <= $totalPages; $page++) {
    $pageResponse = fetchPage($msg, $page);
    if ($pageResponse !== false) {          // ← 抓失败就直接跳过
        $pageData = json_decode($pageResponse, true);
        if ($pageData !== null && isset($pageData['result']['list'])) {
            $events = parseEvents($pageData['result']['list']);
            $allEvents = array_merge($allEvents, $events);
        }
    }
    usleep(300000);
}
```

如果某一页因为网络抖动、`fetchPage` 返回了 `false`，这一页的 10 条活动就**直接被跳过**，既不报错、也不做任何提示。结果就是下游拿到的列表悄悄少了一页，还完全发现不了。

**建议：** 给 `fetchPage` 加 2~3 次重试 + 退避；如果反复失败还是抓不到，至少在最终输出里标记一下（比如 `partial: true`），让人知道数据不全：

```php
function fetchPage($search, $page, $retries = 3) {
    for ($i = 1; $i <= $retries; $i++) {
        $resp = _doCurl($search, $page);   // 原来的 curl 逻辑搬进来
        if ($resp !== false) return $resp;
        usleep(200000 * $i);               // 越等越久
    }
    return false;
}
```

---

## Issue 3（可维护性）：`enabled` 状态判断散在两处，建议统一

**标题建议：** `enabled` 状态解释分散在 `parseEvents` 和 `parseEnded`，建议抽成统一函数

**正文：**

活动状态靠 `enabled` 字段判断，但目前逻辑**写在两个地方、各判各的**：

- `parseEvents()` 里只判断了一件事：
  ```php
  if (isset($item['enabled']) && $item['enabled'] == 5) { $isCancelled = true; }
  ```
  即只把 `enabled == 5` 当成"已取消"。
- `parseEnded()` 里又是另一套：
  ```php
  if ($item['enabled'] == 1) return '已结束';
  else if ($item['enabled'] == 2) return '筹备中';
  else if ($item['enabled'] == 5) return '已取消';
  ```

两者没有真正"矛盾"（都认 `5` 是取消），但**同一个字段的解释散在两处、没有单一来源**，以后想调整状态含义很容易改了这边漏了那边。另外很多下游只想看"有效的"活动，目前"已取消"的展会只是被打了个 `(已取消)` 标签、仍然返回，没法整体过滤掉。

**建议：**
1. 抽一个统一的 `interpretEnabled($item)` 函数集中解释状态，两处都调用它；
2. 加个 `includeCancelled`（默认 `false`）开关，默认就把已取消的过滤掉，下游想要全量再打开。

---

## Issue 4（安全）：关掉了 HTTPS 证书校验

**标题建议：** `CURLOPT_SSL_VERIFYPEER/VERIFYHOST` 设为 false，建议开启

**正文：**

`fetchPage()` 里这两行把证书校验关掉了：

```php
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
```

对于访问公网站点（`www.allcpp.cn`）来说，关掉校验意味着理论上存在被中间人攻击、返回数据被篡改的风险。

**建议：** 直接删掉这两行（PHP 的 cURL 默认就是开启校验的）。如果只是本地调试临时需要，用环境变量控制开关，别写死关闭。

---

## Issue 5（健壮性 / 代码整洁）：几个小问题打包

**标题建议：** 健壮性改进：连接超时、时区设置位置、pageSize 硬编码、tag 未拆分、time 时区缺失

**正文：**

以下 5 点都是小改进，合一个 Issue 提：

1. **缺少"连接超时"。** 目前只设了 `CURLOPT_TIMEOUT = 30`（总超时）。建议补一个 `CURLOPT_CONNECTTIMEOUT = 10`，连不上的时候能更快失败、更快重试。

2. **`date_default_timezone_set('Asia/Shanghai')` 写在循环里。** 它在 `getEventStatusTag()` 和 `parseEnded()` 里**每个活动都调一次**（这两个函数都在 `parseEvents` 的循环里被调用）。时区设一次就够了，建议挪到脚本顶部设一次。

3. **顺带一个真实的时区 bug：** `parseTime()` 用 `date('Y-m-d H:i:s', $timestamp)` 输出开始时间，但它**没有**调 `date_default_timezone_set`，只能依赖服务器默认时区。如果服务器不是 `Asia/Shanghai`，这里吐出来的时间就会差 8 小时。建议 `parseTime()` 里也显式设一次时区（或在顶部统一设好）。

4. **每页条数硬编码。** 请求里写 `'pageSize' => 10`，而算总页数用 `ceil($total / 10)`，两处都写死 10。想改每页数量得改两处、容易漏。建议抽成变量：
   ```php
   $pageSize = 10;
   $params['pageSize'] = $pageSize;
   $totalPages = ceil($total / $pageSize);
   ```

5. **`tag` 字段是竖线连起来的多值，没拆开。** 真实 `tag` 形如 `"明日方舟|明日方舟only"`。现在 `parseEvents` 里是 `'tag' => $item['tag']` 原样返回，下游想按标签筛选很麻烦。建议拆成数组：
   ```php
   'tags' => isset($item['tag']) ? explode('|', $item['tag']) : [],
   ```

---
