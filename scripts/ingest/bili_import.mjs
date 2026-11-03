// B站会员购活动导入：把 bili_fresh.json / bili_now.json / bili_scan.json 里的命中记录写库。
// 与 import_batch.mjs（CPP）同构的两阶段模式，但更简单：坐标由详情接口直接给出（GCJ-02，
// 与前端高德地图同坐标系），无需高德补坐标阶段。
//
// ⚠️ 两阶段（node 无法派生 node，wrangler 必须由 PowerShell 执行）：
//   1) node bili_import.mjs [source_id...]   → 生成 data/bili_import.sql（待执行）
//      PowerShell: wrangler d1 execute --remote --file data/bili_import.sql
//   2) 验证：wrangler d1 execute --remote --command "SELECT ..."（或用 verify_import 思路）
//
// 数据来源优先级：命令行 id > data/ids_bili.txt > bili_fresh.json 全部。
// 记录合并：bili_scan.json（枚举，字段最全）+ bili_now.json（信息流）按 source_id 合并，枚举优先。
// 约定（与库内既有 14 条 bilibili 行一致）：单日活动 end_date 置 NULL；verified=1；
//   review_status 默认 approved（列表已经用户确认），--pending 可改。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const SQL_PATH = path.join(DATA, 'bili_import.sql');

const reviewStatus = process.argv.includes('--pending') ? 'pending' : 'approved';

const COLS = ['title','start_date','end_date','province','city','district','venue','address',
  'longitude','latitude','description','organizer','source_url','poster_url','verified','tags',
  'country','country_code','province_code','city_code','district_code','source','source_id','imported_at','review_status','submitted_by'];

// ---- 合并三个来源的命中记录 ----
const byId = new Map();
function mergeFile(file, prefer) {
  if (!fs.existsSync(file)) return 0;
  let arr = [];
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    arr = Array.isArray(j) ? j : (j.records || []);
  } catch (e) { console.error(`（跳过 ${path.basename(file)}：${e.message}）`); return 0; }
  let n = 0;
  for (const r of arr) {
    const id = String(r.source_id);
    if (!byId.has(id)) { byId.set(id, r); n++; }
    else if (prefer && !byId.get(id).description && r.description) byId.get(id).description = r.description;
  }
  return n;
}
mergeFile(path.join(DATA, 'bili_scan.json'), true);
mergeFile(path.join(DATA, 'bili_now.json'), true);
console.error(`可用记录池：${byId.size} 条（scan + feed）`);

// ---- id 解析 ----
const argv = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
let ids = argv;
if (!ids.length) {
  const idsFile = path.join(DATA, 'ids_bili.txt');
  if (fs.existsSync(idsFile)) {
    ids = fs.readFileSync(idsFile, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
  }
}
if (!ids.length) {
  const freshFile = path.join(DATA, 'bili_fresh.json');
  if (fs.existsSync(freshFile)) {
    ids = JSON.parse(fs.readFileSync(freshFile, 'utf8')).map((r) => String(r.source_id));
    console.error(`（未指定 id，默认导入 bili_fresh.json 全部 ${ids.length} 条）`);
  }
}
if (!ids.length) { console.error('✗ 未指定 id（命令行 / data/ids_bili.txt / data/bili_fresh.json 均为空）'); process.exit(1); }

const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
const rows = [];
for (const id of ids) {
  const r = byId.get(String(id));
  if (!r) { console.error(`✗ [${id}] 不在记录池中，跳过`); continue; }
  if (!r.title) { console.error(`✗ [${id}] 无标题，跳过`); continue; }
  // 单日活动 end_date 置 NULL（与库内既有 bilibili 行风格一致）
  const singleDay = !r.endDate || r.endDate === r.startDate;
  rows.push({
    title: r.title,
    start_date: r.startDate || null,
    end_date: singleDay ? null : r.endDate,
    province: r.province || null,
    city: r.city || null,
    district: r.district || null,
    venue: r.venue || null,
    address: r.address || null,
    longitude: r.longitude != null ? Number(r.longitude) : null,
    latitude: r.latitude != null ? Number(r.latitude) : null,
    description: r.description || null,
    organizer: r.organizer || null,
    source_url: r.url || null,
    poster_url: r.poster_url || null,
    verified: 1,
    tags: r.tags && r.tags.length ? JSON.stringify(r.tags) : null,
    country: '中国',
    country_code: 'CN',
    province_code: null,
    city_code: null,
    district_code: null,
    source: 'bilibili',
    source_id: String(r.source_id),
    imported_at: now,
    review_status: reviewStatus,
    submitted_by: null,
  });
}

if (!rows.length) { console.error('✗ 无有效记录，终止'); process.exit(1); }

function sqlLit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

const stmts = rows.map((r) => {
  const vals = COLS.map((c) => sqlLit(r[c]));
  const update = COLS.filter((c) => !['source', 'source_id', 'submitted_by'].includes(c))
    .map((c) => `${c}=excluded.${c}`).join(', ');
  return `INSERT INTO conventions (${COLS.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT(source, source_id) DO UPDATE SET ${update};`;
});

fs.writeFileSync(SQL_PATH, stmts.join('\n'), 'utf8');
console.error(`\n待导入 ${rows.length} 条（review_status=${reviewStatus}）：`);
for (const r of rows) {
  console.error(`  [${r.source_id}] ${r.title} ｜ ${r.province}/${r.city} ｜ ${r.start_date}${r.end_date ? '~' + r.end_date : ''} ｜ 坐标 ${r.longitude != null ? '有' : '无'}`);
}
console.error(`\n生成 SQL -> ${SQL_PATH}`);
console.error('下一步（PowerShell）：& node_modules/.bin/wrangler.cmd d1 execute arknights-only-map --remote --file scripts/ingest/data/bili_import.sql');
process.exit(0);
