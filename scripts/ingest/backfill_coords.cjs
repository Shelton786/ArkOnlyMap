'use strict';
/**
 * 服务端批量补坐标：把 D1 中「缺经纬度但有地址」的活动，通过高德 Web 服务
 * 地理编码算出不偏精度坐标并 UPDATE 回 D1。
 *
 * 背景：CPP 列表接口不返回坐标，导致 180 条 cpp 活动入库时 longitude/latitude 为 NULL；
 * 前端被迫在浏览器端逐个调高德 JS 编码，且 geocodeClient 无超时保护，回调挂起时
 * 「正在定位活动坐标…」遮罩永久转圈。本脚本在服务端一次性算好坐标入库，
 * 前端不再需要编码，转圈问题根治，活动也能正常上图。
 *
 * 用法：
 *   1) 先从 D1 导出缺坐标活动（id/address/city）到 <root>/missing_raw.json：
 *      wrangler d1 execute arknights-only-map --remote \
 *        --command="SELECT id,address,city FROM conventions WHERE (longitude IS NULL OR latitude IS NULL) AND address IS NOT NULL AND address!='' ORDER BY id;" > missing_raw.json
 *   2) node scripts/ingest/backfill_coords.cjs
 *   3) wrangler d1 execute arknights-only-map --remote --file=scripts/ingest/data/backfill_coords.sql
 */
const fs = require('fs');
const path = require('path');

// 加载 .env（与 server/index.js 相同逻辑），必须在 require geocode.js 之前设置 AMAP_WEB_KEY
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const { geocodeBatch, hasKey } = require('../../server/geocode.js');

const IN = path.join(__dirname, '..', '..', 'missing_raw.json');
const OUT = path.join(__dirname, 'data', 'backfill_coords.sql');

function parseWrangler(raw) {
  const i = raw.indexOf('[');
  const d = JSON.parse(raw.slice(i));
  // 结构: [ { "results": [ {id,address,city,source}, ... ], "success", "meta" } ]
  return d[0].results;
}

(async () => {
  if (!hasKey()) {
    console.error('✗ AMAP_WEB_KEY 未配置，无法服务端地理编码。请在 .env 配置 AMAP_WEB_KEY（高德 Web 服务 Key）。');
    process.exit(1);
  }
  if (!fs.existsSync(IN)) {
    console.error(`✗ 找不到 ${IN}，请先按脚本顶部说明导出 missing_raw.json`);
    process.exit(1);
  }
  const rows = parseWrangler(fs.readFileSync(IN, 'utf8'));
  const items = rows.map((r) => ({ address: r.address, city: r.city }));
  console.log(`待补坐标: ${items.length} 条，开始批量地理编码（高德 Web 服务）...`);

  const results = await geocodeBatch(items, { maxBatch: 10, retries: 4 });

  let ok = 0;
  const lines = [];
  rows.forEach((r, idx) => {
    const pos = results[idx];
    if (pos && Number.isFinite(pos.longitude) && Number.isFinite(pos.latitude)) {
      ok++;
      // longitude/latitude/id 均为数字，无需字符串转义
      lines.push(`UPDATE conventions SET longitude=${pos.longitude}, latitude=${pos.latitude} WHERE id=${r.id};`);
    }
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`✓ 成功解析 ${ok}/${items.length} 条，已写入 ${OUT}`);
  console.log(`  跳过 ${items.length - ok} 条（地址过简/场馆名无法解析，可后续人工补全坐标）`);
})();
