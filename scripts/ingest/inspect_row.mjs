// 按标题精确定位疑似重复行，输出完整字段。
// 用法：先用 wrangler 查库输出到 data/row_query.txt，再 node inspect_row.mjs
// （node 目前无法派生 node 子进程，故 wrangler 由 PowerShell 侧执行）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const raw = fs.readFileSync(path.join(DATA, 'row_query.txt'), 'utf8');
const rows = extractJsonArray(raw)[0].results;

const out = [`匹配 ${rows.length} 条`];
for (const x of rows) {
  out.push(`--- id=${x.id} | source=${x.source} | source_id=${x.source_id} ---`);
  out.push(`  标题: ${x.title}`);
  out.push(`  定位: ${x.province}/${x.city}/${x.district}`);
  out.push(`  日期: ${x.start_date} ~ ${x.end_date ?? 'NULL'}`);
  out.push(`  场馆: ${x.venue ?? 'NULL'}`);
  out.push(`  地址: ${x.address ?? 'NULL'}`);
  out.push(`  坐标: ${x.longitude != null ? x.longitude.toFixed(4) + ', ' + x.latitude.toFixed(4) : 'NULL'}`);
  out.push(`  状态: ${x.review_status}`);
  out.push(`  海报: ${x.poster_url ?? 'NULL'}`);
  out.push(`  链接: ${x.source_url ?? 'NULL'}`);
  out.push(`  简介: ${x.description ?? 'NULL'}`);
  out.push(`  主办: ${x.organizer ?? 'NULL'}`);
  out.push('');
}
fs.writeFileSync(path.join(DATA, 'inspect_row.txt'), out.join('\n'), 'utf8');
