// 千羽腾讯文档（docs.qq.com/sheet/DTE93aFpaS3dIb1RE）采集适配器。
// 用法：把该在线表格「导出为 CSV」保存为 scripts/ingest/data/qianyu.csv，
// 再运行 run.mjs（或 node qianyu.mjs <path.csv>）即可解析。
// 同时导出纯函数 parseQianyuCsv(text)，供 Cloudflare Pages Functions（无 fs）的定时采集复用。
// CSV 表头支持别名映射（见 ALIASES），列顺序随意。
import { normalize } from './normalize.mjs';

// 仅用于 Node 下「node qianyu.mjs <path>」/ run.mjs 的默认路径（相对 cwd）
const DEFAULT_CSV = 'scripts/ingest/data/qianyu.csv';

// 列名别名 -> 标准字段
const ALIASES = {
  title: ['标题', '名称', '活动名称', '活动', 'name', 'title'],
  startDate: ['日期', '举办日期', '开始日期', '时间', 'date', 'start'],
  province: ['省份', '省', 'province'],
  city: ['城市', 'city'],
  district: ['区县', '区', '区/县', 'district'],
  venue: ['场馆', '场地', 'venue', 'address'],
  address: ['地址', '详细地址', 'addr'],
  source_url: ['链接', '原链接', 'url', 'link'],
  organizer: ['主办', '主办方', 'organizer'],
  source_id: ['id', '编号', '序号'],
};

function headerMap(headers) {
  const map = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const idx = headers.findIndex((h) => aliases.includes((h || '').trim()));
    if (idx >= 0) map[field] = idx;
  }
  return map;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); rows.push(row); row = []; cur = '';
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/**
 * 纯函数：解析 CSV 文本为 canonical 记录（不依赖 fs，供 Worker 复用）。
 * @param {string} text CSV 全文
 * @returns {Array<object>}
 */
export function parseQianyuCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const map = headerMap(headers);
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (f) => (map[f] != null ? (r[map[f]] || '').trim() : null);
    const title = get('title');
    if (!title) continue;
    out.push(normalize({
      title,
      startDate: (get('startDate') || '').slice(0, 10) || null,
      province: get('province'),
      city: get('city'),
      district: get('district'),
      venue: get('venue'),
      address: get('address'),
      source_url: get('source_url'),
      source_id: get('source_id'),
      organizer: get('organizer'),
    }, 'qianyu'));
  }
  return out;
}

/**
 * Node 下从文件解析（fs 为动态导入，避免污染 Worker 构建）。
 * @param {string} [csvPath]
 * @returns {Promise<Array<object>>} canonical 记录
 */
export async function parseQianyu(csvPath = DEFAULT_CSV) {
  const fs = await import('node:fs');
  if (!fs.existsSync(csvPath)) {
    console.warn(`[qianyu] 未找到 CSV：${csvPath}（请先从腾讯文档导出 CSV）`);
    return [];
  }
  return parseQianyuCsv(fs.readFileSync(csvPath, 'utf8'));
}

// 直接运行：node qianyu.mjs [path]
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const p = process.argv[2] || DEFAULT_CSV;
  parseQianyu(p).then((recs) => console.log(JSON.stringify(recs, null, 1)));
}

export default { parseQianyu, parseQianyuCsv };
