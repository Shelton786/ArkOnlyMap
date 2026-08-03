// 生成：① 全量行政编码回填 SQL（113 条需要更正的记录）② 2 组重复合并 SQL
import fs from 'node:fs';
import { loadGeo, resolveCode, codeToNames } from './scripts/ingest/geo.mjs';

const GEO = JSON.parse(fs.readFileSync('./public/data/geo_codes.json', 'utf8'));
loadGeo(GEO);
const data = JSON.parse(fs.readFileSync('./conv_full.tmp.json', 'utf8'));

const has = (idx, n) => !!(n && (idx[n] || idx[String(n).replace(/(省|市|自治区|特别行政区|地区|自治州|盟|县|区|市辖区)$/, '')]));
const isProv = (n) => has(GEO.provinceIndex, n);
const isCity = (n) => has(GEO.cityIndex, n);
const isArea = (n) => has(GEO.areaIndex, n) || Object.keys(GEO.areaByCity || {}).some((k) => k.endsWith('|' + String(n).replace(/(区|县|市辖区)$/, '')));

function normalizeLoc(rec) {
  let { province, city, district } = rec;
  if (city && isArea(city) && !isCity(city)) { district = district || city; city = null; }
  if (province && isCity(province) && !isProv(province)) { city = city || province; province = null; }
  let codes = resolveCode({ province, city, district });
  if (!codes.province_code && (codes.city_code || codes.district_code)) {
    const c = codes.district_code || (codes.city_code + '00');
    codes.province_code = String(c).slice(0, 2);
  }
  if (!codes.city_code && codes.district_code) codes.city_code = String(codes.district_code).slice(0, 4);
  let np = province, nc = city, nd = district;
  if (codes.district_code) {
    const nm = codeToNames(codes.district_code);
    if (nm) { np = nm.province_name; nc = nm.city_name; nd = nm.district_name; }
  } else if (codes.city_code) {
    const ct = GEO.cities.find((c) => c.code === codes.city_code);
    np = GEO.provinces.find((p) => p.code === codes.province_code)?.name || np;
    nc = ct ? ct.name : nc;
    nd = null;
  }
  return { province: np, city: nc, district: nd, ...codes };
}

// SQL 转义
const q = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

// ① 全量回填
let backfill = '-- ① 行政编码回填 + 地点字段规范化（仅 UPDATE 需更正的记录）\n';
let nBack = 0;
for (const r of data) {
  const n = normalizeLoc(r);
  const changed =
    (n.province_code && !r.province_code) || (n.city_code && !r.city_code) || (n.district_code && !r.district_code) ||
    (n.city && r.city && n.city !== r.city) || (n.province && r.province && n.province !== r.province) ||
    (n.district && !r.district && r.city && isArea(r.city));
  if (!changed) continue;
  nBack++;
  backfill += `UPDATE conventions SET province=${q(n.province)}, city=${q(n.city)}, district=${q(n.district)}, country_code=${q('CN')}, province_code=${q(n.province_code)}, city_code=${q(n.city_code)}, district_code=${q(n.district_code)}, updated_at=datetime('now') WHERE id=${r.id};\n`;
}
fs.writeFileSync('backfill.sql', backfill);
console.log('backfill.sql 生成，需更正的记录数:', nBack);

// ② 合并 2 组重复：保留手动版(有坐标)，吸收B站版 district/district_code/venue/source/source_id/source_url/imported_at，删除B站版
// 从 bilibili 版读取待吸收字段
const bili = {};
for (const r of data) if (r.source === 'bilibili') bili[r.id] = r;
const pairs = [
  [80, 113],  // 杭州 企鹅物流
  [82, 110],  // 无锡 临界寻遗
];
let merge = '-- ② 合并 2 组重复：先删B站版，再 UPDATE 手动版吸收字段（防唯一索引冲突）\n';
for (const [manId, biliId] of pairs) {
  const b = bili[biliId];
  merge += `DELETE FROM conventions WHERE id=${biliId};\n`;
  merge += `UPDATE conventions SET district=${q(b.district)}, district_code=${q(b.district_code)}, venue=${q(b.venue)}, source=${q(b.source)}, source_id=${q(b.source_id)}, source_url=${q(b.source_url)}, imported_at=${q(b.imported_at || new Date().toISOString())}, updated_at=datetime('now') WHERE id=${manId};\n`;
}
fs.writeFileSync('merge2.sql', merge);
console.log('merge2.sql 生成，合并组数:', pairs.length);
