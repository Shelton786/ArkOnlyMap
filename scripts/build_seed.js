/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * 导出种子数据：从本地 better-sqlite3 库（data/app.db）读取全部活动，
 * 生成 data/seed.sql（保留真实 QQ / 群号等联系方式，供网站公开展示），
 * 供 `wrangler d1 execute DB --remote --file=data/seed.sql` 导入 D1。
 *
 * 仅本地使用，依赖 better-sqlite3（devDependency）。
 */
'use strict';
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db');
const OUT = path.join(__dirname, '..', 'data', 'seed.sql');

if (!fs.existsSync(DB_PATH)) {
  console.error('未找到本地数据库，请先确认 data/app.db 存在（本地开发库）。');
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });

function sqlStr(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const rows = db.prepare('SELECT * FROM conventions ORDER BY id').all();
console.log(`读取 ${rows.length} 条活动，生成种子 SQL...`);

const cols = [
  'id', 'title', 'start_date', 'end_date', 'province', 'city', 'venue', 'address',
  'longitude', 'latitude', 'description', 'organizer', 'source_url', 'poster_url',
  'verified', 'tags', 'submitted_by',
];

const lines = ['-- 舟友同好集会地图 种子数据（含真实联系方式，供公开展示）', '-- 用途：wrangler d1 execute DB --remote --file=data/seed.sql', ''];
let n = 0;
for (const r of rows) {
  const vals = cols.map((c) => {
    if (c === 'submitted_by') return 'NULL'; // 不携带本地用户引用
    if (c === 'description' || c === 'organizer') return sqlStr(r[c]);
    if (c === 'longitude' || c === 'latitude') return r[c] == null ? 'NULL' : String(Number(r[c]));
    if (c === 'verified') return r[c] ? 1 : 0;
    return sqlStr(r[c]);
  });
  lines.push(`INSERT OR REPLACE INTO conventions (${cols.join(', ')}) VALUES (${vals.join(', ')});`);
  n++;
}
lines.push('');
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`✅ 已写入 ${n} 条到 ${OUT}`);
db.close();
