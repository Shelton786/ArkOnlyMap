// 一次性：把所有 cpp 记录的 poster_url 替换为手机端海报（/m/e/<id>.do 的大图）。
// 不改动其他字段。未来抓取已由 cpp.mjs 默认走手机端海报，本脚本仅修历史数据。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchMobilePoster } from './cpp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DB = 'arknights-only-map';
const SQL_PATH = path.join(__dirname, 'data', 'rescrape_posters.sql');
const wrangler = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const node = process.execPath;
const { execFileSync } = await import('node:child_process');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1) 取出所有 cpp 记录
const q = `SELECT id, source_id, poster_url FROM conventions WHERE source='cpp' AND source_id IS NOT NULL;`;
const raw = execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--command', q], { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
const rows = (() => { const i = raw.indexOf('['); if (i < 0) return []; const d = JSON.parse(raw.slice(i)); let a = d[0] && d[0].results; if (Array.isArray(a)) { if (a.length && Array.isArray(a[0] && a[0].results)) return a[0].results; return a; } return []; })();
console.error(`DB 中 cpp 记录共 ${rows.length} 条，开始逐条抓手机端海报...`);

// 2) 抓手机端海报，比对
const updates = [];
let ok = 0, same = 0, fail = 0;
for (const r of rows) {
  let mp = null;
  try { mp = await fetchMobilePoster(r.source_id); } catch (e) { fail++; console.error(`  ✗ [${r.source_id}] 抓取失败：${e.message}`); }
  if (!mp) { if (!r.poster_url) fail++; await sleep(120); continue; }
  if (r.poster_url === mp) { same++; }
  else {
    const u = mp.replace(/'/g, "''");
    updates.push(`UPDATE conventions SET poster_url='${u}' WHERE id=${r.id};`);
    ok++;
  }
  await sleep(120);
}
console.error(`手机端海报：需更新 ${ok} 条，已是最新 ${same} 条，失败 ${fail} 条`);

// 3) 写库
if (updates.length) {
  fs.writeFileSync(SQL_PATH, updates.join('\n'));
  const out = execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--file=' + SQL_PATH], { encoding: 'utf8' });
  const changes = (out.match(/"changes":\s*(\d+)/) || [])[1];
  console.error(`✅ 已写入 ${updates.length} 条 UPDATE（changes=${changes}）-> ${SQL_PATH}`);
} else {
  console.error('（无需要更新的记录）');
}
