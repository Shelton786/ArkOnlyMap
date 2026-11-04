// B站巡检比对：bili_scan.json（ID 枚举命中）+ bili_now.json（信息流命中） vs db_all_bili.txt（D1 全库）
// 输出：控制台报告 + data/bili_fresh.json（未入库活动）、data/bili_dupes.json（他源已收录的重复）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');

const rawDb = fs.readFileSync(path.join(DATA, 'db_all_bili.txt'), 'utf8');
const db = extractJsonArray(rawDb)[0].results;

// 合并两个来源的命中（按 source_id 去重，枚举结果优先，信息流补 description 更全的）
const scan = JSON.parse(fs.readFileSync(path.join(DATA, 'bili_scan.json'), 'utf8'));
const feed = fs.existsSync(path.join(DATA, 'bili_now.json'))
  ? JSON.parse(fs.readFileSync(path.join(DATA, 'bili_now.json'), 'utf8'))
  : [];
const byId = new Map();
for (const r of scan.records || []) byId.set(String(r.source_id), r);
for (const r of feed) {
  const id = String(r.source_id);
  if (!byId.has(id)) byId.set(id, r);
  // 信息流命中若枚举没扫到（极端情况），用信息流的 description 补枚举记录
  else if (!byId.get(id).description && r.description) byId.get(id).description = r.description;
}
const now = [...byId.values()];

// ============ 查重：① source_id 精确 ② 标题归一+城市+日期≤3天 ③ 二元相似度兜底 ============
function normTitle(t) {
  return (t || '')
    .toLowerCase()
    .replace(/[\s\-_—－·・.。,，!！?？:：;；'"“”‘’()（）\[\]【】]/g, '')
    .replace(/only|同人|展|only1|第一届|第1届/g, '')
    .replace(/\d+(\.\d+)?/g, '');
}
function normCity(c) { return (c || '').replace(/(特别行政区|壮族回族自治区|维吾尔自治区|自治区|省|市)$/, ''); }
function daysDiff(a, b) {
  if (!a || !b) return 999;
  return Math.abs((new Date(a) - new Date(b)) / 86400000);
}
// 字符二元组集合（兜底识别「鸢尾新枝第五届」这类夹带词造成的标题不一致）
// 先过 normTitle 归一，避免标点二元组（海·/乱-）稀释相似度
function bigrams(s) {
  const t = normTitle(s);
  const set = new Set();
  for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
  return set;
}
function bigramSim(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / Math.min(A.size, B.size); // 用较小集合做分母，容忍一方夹带额外词
}

const dbById = new Map(db.map((r) => [String(r.source_id), r]));
const dupes = [];
const suspected = [];
const fresh = [];

for (const r of now) {
  // ① 同源同 ID
  const same = dbById.get(String(r.source_id));
  if (same) {
    const titleChanged = same.title !== r.title ? `  ← 标题有变（库内: ${same.title}）` : '';
    dupes.push({ ...r, match: 'same-source', dbId: same.id, dbTitle: same.title, titleChanged });
    continue;
  }
  // ② 跨源模糊（标题归一后相同 + 同城 + 日期差≤3天）
  const nt = normTitle(r.title);
  const hit = db.find((d) => {
    if (d.review_status === 'rejected' || d.review_status === 'merged') return false;
    if (normTitle(d.title) !== nt) return false;
    if (normCity(d.city) !== normCity(r.city)) return false;
    return daysDiff(d.start_date, r.startDate) <= 3;
  });
  if (hit) {
    dupes.push({ ...r, match: 'cross-source', dbId: hit.id, dbTitle: hit.title, dbSource: hit.source });
    continue;
  }
  // ③ 相似度兜底（同城 + 日期差≤3天 + 二元相似度≥0.55）→ 疑似重复，需人工确认
  const sus = db.find((d) => {
    if (d.review_status === 'rejected' || d.review_status === 'merged') return false;
    if (normCity(d.city) !== normCity(r.city)) return false;
    if (daysDiff(d.start_date, r.startDate) > 3) return false;
    return bigramSim(d.title, r.title) >= 0.55;
  });
  if (sus) {
    suspected.push({ ...r, dbId: sus.id, dbTitle: sus.title, dbSource: sus.source, dbDate: sus.start_date });
    continue;
  }
  fresh.push(r);
}

const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
fresh.sort((a, b) => (a.startDate || '9999').localeCompare(b.startDate || '9999'));
const future = fresh.filter((r) => (r.startDate || '9999') >= today);
const past = fresh.filter((r) => (r.startDate || '9999') < today);

console.log(`B站命中合计 ${now.length}（枚举 ${(scan.records || []).length} + 信息流补 ${feed.length}）｜ 库内总数 ${db.length}`);
console.log(`\n=== 重复/已收录（${dupes.length}）===`);
for (const r of dupes) {
  const tag = r.match === 'same-source' ? '同源已入库' : `跨源重复（库内 ${r.dbSource}）`;
  console.log(`  [${r.source_id}] ${r.title} ｜ ${r.city} ｜ ${r.startDate} ｜ ${tag} → 库内 id=${r.dbId}《${r.dbTitle}》${r.titleChanged || ''}`);
}

console.log(`\n=== 疑似重复·待人工确认（${suspected.length}）===`);
for (const r of suspected) {
  console.log(`  [${r.source_id}] ${r.title} ｜ ${r.city} ｜ ${r.startDate}`);
  console.log(`         ≈ 库内 id=${r.dbId}《${r.dbTitle}》（${r.dbSource}，${r.dbDate}）`);
}

console.log(`\n=== 全新未录入 · 未来/进行中（${future.length}）===`);
for (const r of future) {
  console.log(`  [${r.source_id}] ${r.title}`);
  console.log(`         ${r.province}/${r.city}/${r.district || '-'} ｜ ${r.startDate}${r.endDate && r.endDate !== r.startDate ? '~' + r.endDate : ''} ｜ ${r.venue || '场馆未知'}`);
  console.log(`         ${r.url}`);
}

console.log(`\n=== 全新未录入 · 往期（${past.length}）===`);
for (const r of past) {
  console.log(`  [${r.source_id}] ${r.title} ｜ ${r.city} ｜ ${r.startDate}`);
}

fs.writeFileSync(path.join(DATA, 'bili_fresh.json'), JSON.stringify(fresh, null, 2));
fs.writeFileSync(path.join(DATA, 'bili_dupes.json'), JSON.stringify(dupes, null, 2));
fs.writeFileSync(path.join(DATA, 'bili_suspected.json'), JSON.stringify(suspected, null, 2));
console.log(`\n-> data/bili_fresh.json（${fresh.length} 条，其中未来 ${future.length}）`);
console.log(`-> data/bili_dupes.json（${dupes.length} 条）`);
console.log(`-> data/bili_suspected.json（${suspected.length} 条）`);
