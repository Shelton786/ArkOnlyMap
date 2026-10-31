// 导入结果验证：把 wrangler 查询输出（data/verify_query.txt）格式化成 data/verify_import.txt
// ⚠️ node 已无法派生 node 子进程（EBUSY），wrangler 查询须由 PowerShell 侧执行后落盘到 verify_query.txt。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const raw = fs.readFileSync(path.join(DATA, 'verify_query.txt'), 'utf8');
const rows = extractJsonArray(raw)[0].results;

const out = [`共 ${rows.length} 条`];
for (const x of rows) {
  out.push(`[id=${x.id} source_id=${x.source_id}] ${x.title}`);
  out.push(`  定位: ${x.province}/${x.city}/${x.district ?? 'NULL'}`);
  out.push(`  日期: ${x.start_date} ~ ${x.end_date ?? 'NULL'}`);
  out.push(`  场馆: ${x.venue ?? 'NULL'}`);
  out.push(`  坐标: ${x.longitude != null ? x.longitude.toFixed(4) + ', ' + x.latitude.toFixed(4) : 'NULL'}`);
  out.push(`  状态: ${x.review_status}`);
  out.push(`  海报: ${x.poster_url ?? 'NULL'}`);
  out.push(`  链接: ${x.source_url ?? 'NULL'}`);
  out.push(`  简介: ${x.description ?? 'NULL'}`);
  out.push('');
}
fs.writeFileSync(path.join(DATA, 'verify_import.txt'), out.join('\n'), 'utf8');
