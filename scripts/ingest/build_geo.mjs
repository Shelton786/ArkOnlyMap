// 生成 public/data/geo_codes.json
// 数据源：province-city-china（GB/T 2260）。运行：
//   NODE_PATH=<managed workspace node_modules> node scripts/ingest/build_geo.mjs
// 该脚本为一次性构建工具，产物 geo_codes.json 已提交，无需在部署时运行。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'data', 'geo_codes.json');

// 海外国家（ISO 3166-1 alpha-2）——只列与明日方舟线下活动相关的
const COUNTRIES = {
  CN: '中国', JP: '日本', KR: '韩国', US: '美国', TH: '泰国',
  SG: '新加坡', MY: '马来西亚', TW: '中国台湾', HK: '中国香港', MO: '中国澳门',
};

// 去除常见行政区划后缀，生成归一化匹配键
function norm(name) {
  return name
    .replace(/(省|市|自治区|特别行政区|地区|自治州|盟|自治县|县|区|市辖区)$/g, '')
    .trim();
}
function keys(name) {
  const set = new Set([name, norm(name)]);
  return [...set].filter(Boolean);
}

// 读取数据集（CommonJS）
const req = createRequire(import.meta.url);
const d = req('province-city-china/data.js');

const provinces = d.province.map((p) => ({
  code: p.province,              // 2 位
  name: p.name,
  full: p.code,                  // 6 位全称
}));
const cities = d.city.map((c) => ({
  code: c.province + c.city,     // 4 位 = 省(2)+市(2)
  name: c.name,
  province: c.province,
  full: c.code,
}));

// 直辖市（北京/上海/天津/重庆）在数据集中没有"市"一级，合成一条城市，
// 使城市下拉在选中直辖市时仍有一个选项，城市码 = 省码 + '01'。
const MUNICIPAL = { '11': '北京', '31': '上海', '12': '天津', '50': '重庆' };
for (const [pc, short] of Object.entries(MUNICIPAL)) {
  const pv = d.province.find((p) => p.province === pc);
  if (!pv) continue;
  cities.push({ code: pc + '01', name: short, province: pc, full: pc + '0100', isMunicipality: true });
}
const areas = d.area.map((a) => ({
  code: a.code,                  // 6 位
  name: a.name,
  province: a.province,
  city: a.city,
}));

const provinceIndex = {};
const cityIndex = {};
const areaIndex = {};
const areaByCity = {}; // "4位cityCode|区名" -> 6位区编码，用于跨市重名消歧
for (const p of provinces) for (const k of keys(p.name)) provinceIndex[k] = p.code;
for (const c of cities) for (const k of keys(c.name)) cityIndex[k] = c.code;
for (const a of areas) {
  for (const k of keys(a.name)) areaIndex[k] = a.code; // 重名时后者覆盖，仅兜底
  areaByCity[a.province + a.city + '|' + a.name] = a.code;
}
// 兼容「上海市」这类带市后缀的直辖市输入
for (const [pc, short] of Object.entries(MUNICIPAL)) cityIndex[short + '市'] = pc + '01';

const out = {
  meta: 'GB/T 2260 行政区划编码 + ISO 3166-1 国家码。province_code=2位, city_code=4位, district_code=6位。',
  countries: COUNTRIES,
  provinces,
  cities,
  areas,
  provinceIndex,
  cityIndex,
  areaIndex,
  areaByCity,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
console.log(`wrote ${OUT}`);
console.log(`provinces=${provinces.length} cities=${cities.length} areas=${areas.length} countries=${Object.keys(COUNTRIES).length}`);
