// CPP 巡检比对：cpp_now.json（源站当前未来活动） vs db_cpp.txt（D1 已有 cpp 记录）
// 输出：控制台报告 + data/cpp_fresh.json（未入库的活动）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');

const rawDb = fs.readFileSync(path.join(DATA, 'db_cpp.txt'), 'utf8');
const db = extractJsonArray(rawDb)[0].results;
const now = JSON.parse(fs.readFileSync(path.join(DATA, 'cpp_now.json'), 'utf8'));

const dbIds = new Set(db.map((r) => String(r.source_id)));
const dbById = Object.fromEntries(db.map((r) => [String(r.source_id), r]));

const already = now.filter((r) => dbIds.has(r.source_id));
const fresh = now.filter((r) => !dbIds.has(r.source_id));

console.log(`DB cpp 总记录: ${db.length} | CPP 当前未来活动: ${now.length}`);

console.log(`\n=== 已在数据库（${already.length}）===`);
for (const r of already) {
  const d = dbById[r.source_id];
  const titleChanged = d.title !== r.title ? `  ← 标题有变（库内: ${d.title}）` : '';
  console.log(`  [${r.source_id}] ${r.title} ｜ ${r.city} ｜ ${r.startDate} ｜ ${d.review_status}${titleChanged}`);
}

console.log(`\n=== 全新未录入（${fresh.length}）===`);
for (const r of fresh) {
  console.log(`  [${r.source_id}] ${r.title}`);
  console.log(`         城市:${r.province}/${r.city}/${r.district} 日期:${r.startDate}~${r.endDate} 场馆:${r.venue}`);
  console.log(`         ${r.url}`);
}

fs.writeFileSync(path.join(DATA, 'cpp_fresh.json'), JSON.stringify(fresh, null, 2));
console.log(`\n-> 已写入 data/cpp_fresh.json（${fresh.length} 条）`);
