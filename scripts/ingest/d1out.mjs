// wrangler 输出解析工具：剥 ANSI 转义码 + 从混杂日志里抠出 JSON 数组。
// 注意：日志里可能出现 `[cpp] xxx` 这类方括号，因此必须要求 `[` 后面紧跟 `{`，否则会误判起点。
export function extractJsonArray(raw) {
  const clean = String(raw).replace(/\u001b\[[0-9;]*m/g, '');
  const m = clean.match(/\n\s*\[\s*\{/);
  if (!m) throw new Error('未找到 JSON 数组（wrangler 输出异常或查询报错）');
  const start = clean.indexOf('[', m.index);
  const end = clean.lastIndexOf(']');
  return JSON.parse(clean.slice(start, end + 1));
}

/** 取 d1 execute 返回的第一段 results。 */
export function firstResults(raw) {
  const arr = extractJsonArray(raw);
  return arr[0] && arr[0].results ? arr[0].results : [];
}
