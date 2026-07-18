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
// 重新地理编码：单条 + 城市约束，修正跨省错配 + 提升精度
// 用法：
//   node scripts/regeocode.mjs --test   # 仅测试几条已知错误，不写库
//   node scripts/regeocode.mjs          # 全量重解析，写回 app.db 并生成 data/fix_coords.sql
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// 载入 .env
(function loadEnv() {
  const p = path.join(process.cwd(), '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();

const KEY = process.env.AMAP_WEB_KEY || '';
if (!KEY) { console.error('缺少 AMAP_WEB_KEY'); process.exit(1); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 单条地理编码，带城市约束；返回 {lng,lat,province,city,level,formatted}
async function geo(address, city) {
  const params = new URLSearchParams({ key: KEY, address, output: 'JSON' });
  if (city) params.set('city', city);
  let attempt = 0;
  while (attempt <= 4) {
    try {
      const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params}`);
      const d = await resp.json();
      if (d.status === '1' && d.geocodes && d.geocodes.length) {
        const g = d.geocodes[0];
        const [lng, lat] = (g.location || '').split(',').map(Number);
        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          return { lng, lat, province: g.province, city: g.city, level: g.level, formatted: g.formatted_address };
        }
        return null;
      }
      if (d.infocode === '10044' || /CUQPS/.test(d.info || '')) { attempt++; await sleep(1500 * attempt); continue; }
      return null;
    } catch (e) { attempt++; await sleep(1500 * attempt); }
  }
  return null;
}

// 构造查询串与城市约束
function buildQuery(r) {
  const hasAddr = r.address && r.address.trim();
  // 城市约束：优先 city，其次 province（去掉可能造成歧义的空白）
  const cityHint = (r.city || r.province || '').trim();
  if (hasAddr) {
    // 有详细地址：省+市+地址，能定位到具体场馆
    const q = [r.province, r.city, r.address].filter(Boolean).join('').trim();
    return { q, city: cityHint };
  }
  // 只有城市：用 省+市 作为查询，落到正确城市中心
  const q = [r.province, r.city].filter(Boolean).join('').trim() || cityHint;
  return { q, city: cityHint };
}

async function main() {
  const testMode = process.argv.includes('--test');
  const db = new Database('data/app.db');
  const rows = db.prepare('SELECT id,title,province,city,venue,address,longitude,latitude FROM conventions ORDER BY id').all();

  if (testMode) {
    const ids = [58, 68, 84, 92, 7, 8, 19, 22, 87];
    console.log('=== 测试已知错误/样本（不写库）===');
    for (const id of ids) {
      const r = rows.find(x => x.id === id);
      if (!r) continue;
      const { q, city } = buildQuery(r);
      const g = await geo(q, city);
      console.log(`[${id}] ${r.title}`);
      console.log(`    查询="${q}" city="${city}"`);
      console.log(`    旧坐标=(${r.longitude},${r.latitude})`);
      console.log(`    新结果=${g ? `(${g.lng},${g.lat}) ${g.province}${g.city} level=${g.level}` : '失败'}`);
      await sleep(400);
    }
    process.exit(0);
  }

  // 全量
  const update = db.prepare("UPDATE conventions SET longitude=?, latitude=?, updated_at=datetime('now') WHERE id=?");
  const sqlLines = ['-- 坐标修正（重新地理编码，单条+城市约束）', '-- 应用: wrangler d1 execute DB --remote --file=data/fix_coords.sql', ''];
  let ok = 0, failed = [], changed = 0;
  console.log(`重新解析 ${rows.length} 条…\n`);
  for (const r of rows) {
    const { q, city } = buildQuery(r);
    const g = await geo(q, city);
    if (g) {
      const moved = Math.abs(g.lng - r.longitude) > 0.001 || Math.abs(g.lat - r.latitude) > 0.001;
      update.run(g.lng, g.lat, r.id);
      sqlLines.push(`UPDATE conventions SET longitude=${g.lng}, latitude=${g.lat} WHERE id=${r.id};`);
      ok++;
      if (moved) changed++;
      const flag = moved ? '  ~移动' : '';
      console.log(`  ✓ [${r.id}] ${g.province||''}${g.city||''} level=${g.level||'?'} (${g.lng},${g.lat})${flag}`);
    } else {
      failed.push(r);
      console.log(`  ✗ [${r.id}] ${r.title} 解析失败 (查询="${q}")`);
    }
    await sleep(380);
  }
  fs.writeFileSync('data/fix_coords.sql', sqlLines.join('\n') + '\n', 'utf8');
  console.log(`\n完成：成功 ${ok} / 失败 ${failed.length}，其中坐标变化 ${changed} 条。`);
  console.log('已生成 data/fix_coords.sql');
  process.exit(0);
}
main();
