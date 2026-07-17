'use strict';
/**
 * 取消脱敏：仅把 app.db 中真实的 description / organizer 写回线上 D1，
 * 不动坐标、城市等其他字段，避免影响已修正的定位。
 * 仅本地使用，依赖 better-sqlite3（devDependency）。
 */
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'app.db');
const OUT = path.join(process.cwd(), 'data', 'unredact.sql');

const db = new Database(DB_PATH, { readonly: true });

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const rows = db.prepare('SELECT id, description, organizer FROM conventions ORDER BY id').all();
const lines = [
  '-- 取消脱敏：仅恢复 description / organizer 真实值（不动坐标等其他字段）',
  '-- 用途：wrangler d1 execute DB --remote --file=data/unredact.sql',
  '',
];
for (const r of rows) {
  lines.push(`UPDATE conventions SET description = ${sqlStr(r.description)}, organizer = ${sqlStr(r.organizer)} WHERE id = ${r.id};`);
}
lines.push('');
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`✅ 已写入 ${rows.length} 条 UPDATE 到 ${OUT}`);
db.close();
