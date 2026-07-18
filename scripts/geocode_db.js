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
'use strict';
/**
 * 批量地理编码：扫描数据库中所有缺坐标(longitude/latitude 为空)的活动，
 * 用高德「Web 服务」Key 批量解析地址并写回数据库。
 * 使用批量接口（每请求最多 10 个地址），最大限度降低 QPS 压力。
 *
 * 前置：在 .env 中配置 AMAP_WEB_KEY（Web 服务 Key）。
 *      若为该 Key 开启了「数字签名」，还需配置 AMAP_WEB_SECRET。
 *
 * 用法：
 *   node scripts/geocode_db.js                 # 解析所有缺坐标的活动
 *   node scripts/geocode_db.js --force         # 重新解析全部活动（覆盖已有坐标）
 *   node scripts/geocode_db.js --limit 20      # 仅处理前 N 条（测试用）
 */
const fs = require('fs');
const path = require('path');

// 加载 .env（在加载依赖前）
(function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
})();

const { db } = require('../server/db');
const { geocodeBatch, hasKey } = require('../server/geocode');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const limIdx = args.indexOf('--limit');
  const limit = limIdx >= 0 ? parseInt(args[limIdx + 1], 10) : 0;

  if (!hasKey()) {
    console.error('❌ 未检测到 Web 服务 Key。请在 .env 中配置 AMAP_WEB_KEY 后重试。');
    console.error('   （AMAP_KEY 是 JS API Key，不能用于服务端地理编码。）');
    process.exit(1);
  }

  const whereCoords = force ? '' : 'WHERE (longitude IS NULL OR latitude IS NULL)';
  let rows = db.prepare(
    `SELECT id, title, province, city, address, venue FROM conventions ${whereCoords} ORDER BY id`
  ).all();
  if (limit > 0) rows = rows.slice(0, limit);

  if (!rows.length) {
    console.log('✅ 没有需要解析的活动（坐标均已存在）。');
    process.exit(0);
  }

  console.log(`开始批量解析 ${rows.length} 条活动的坐标（每批最多 10 个）…\n`);
  const update = db.prepare('UPDATE conventions SET longitude=?, latitude=?, updated_at=datetime(\'now\') WHERE id=?');

  // 构造批量输入：地址里带上省市，提高精度；无地址则退化到城市名
  const items = rows.map((r) => {
    const addr = [r.province, r.city, r.address, r.venue].filter(Boolean).join(' ').trim();
    const fallback = r.city || r.province || '';
    return { id: r.id, title: r.title, address: addr || fallback };
  });

  const results = await geocodeBatch(items, { maxBatch: 10, retries: 4 });

  let ok = 0;
  const failed = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const g = results[i];
    if (g) {
      update.run(g.longitude, g.latitude, r.id);
      ok++;
      if (limit > 0 || rows.length <= 30) {
        console.log(`  ✓ [${r.id}] ${r.title}  ->  ${g.longitude.toFixed(5)}, ${g.latitude.toFixed(5)}`);
      }
    } else {
      failed.push(r);
    }
  }

  console.log(`\n✅ 完成：成功 ${ok} 条，失败 ${failed.length} 条。`);
  if (failed.length) {
    console.log('\n失败明细（可在地图上手动选点补全，或检查地址是否过简）:');
    failed.slice(0, 40).forEach((f) => console.log(`  - [${f.id}] ${f.title}  (地址: ${[f.province, f.city, f.address, f.venue].filter(Boolean).join(' ') || '无'})`));
    if (failed.length > 40) console.log(`  … 其余 ${failed.length - 40} 条`);
  }
  process.exit(0);
}

main();
