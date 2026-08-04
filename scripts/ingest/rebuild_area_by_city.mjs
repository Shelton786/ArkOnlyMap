// 一次性修复脚本：重建 geo_codes.json 的 areaByCity（补上剥后缀键）。
// 背景：build_geo.mjs 原实现 areaByCity 只存带后缀名（"朝阳区"），但 geo.mjs 查询时
// 剥掉了后缀（"朝阳"），导致 areaByCity 永远对不上、回退到 areaIndex 跨市重名误判
// （北京朝阳 -> 长春朝阳 220104）。此处用已提交的 areas 数组重建，无需 province-city-china 包。
// 运行：node scripts/ingest/rebuild_area_by_city.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'data', 'geo_codes.json');

function norm(name) {
  return name
    .replace(/(省|市|自治区|特别行政区|地区|自治州|盟|自治县|县|区|市辖区)$/g, '')
    .trim();
}
function keys(name) {
  const set = new Set([name, norm(name)]);
  return [...set].filter(Boolean);
}

const geo = JSON.parse(fs.readFileSync(OUT, 'utf8'));
let added = 0;
const rebuilt = {};
for (const a of geo.areas || []) {
  for (const k of keys(a.name)) {
    const key = a.province + a.city + '|' + k;
    if (!(key in (geo.areaByCity || {}))) added++; // 仅统计新增（已有的保持一致）
    rebuilt[key] = a.code;
  }
}
geo.areaByCity = rebuilt;
fs.writeFileSync(OUT, JSON.stringify(geo, null, 0));
console.log(`rebuilt areaByCity entries=${Object.keys(rebuilt).length} (新增键 ${added}) -> ${OUT}`);
