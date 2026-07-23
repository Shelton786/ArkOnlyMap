// 行政编码解析：把来源文字（省份/城市/区县/国家）解析为 GB/T 2260 + ISO 3166 编码。
// 供 cpp / 千羽 等采集适配器复用。产物 geo_codes.json 由 build_geo.mjs 生成。
// 运行时不依赖 fs：用 loadGeo() 注入数据（Node 从文件读，Worker 从部署站点 fetch）。
let GEO = null;
export function loadGeo(geoObj) { GEO = geoObj; }
function getGeo() {
  if (!GEO) throw new Error('geo_codes 未加载，请先调用 loadGeo()');
  return GEO;
}

const COUNTRIES = {
  中国: 'CN', 中国大陆: 'CN', 内地: 'CN',
  日本: 'JP', 韩国: 'KR', 美国: 'US', 泰国: 'TH',
  新加坡: 'SG', 马来西亚: 'MY',
  台湾: 'TW', 中国台湾: 'TW', 台北: 'TW',
  香港: 'HK', 中国香港: 'HK', 澳门: 'MO', 中国澳门: 'MO',
};

// 规范化：去空格、去常见后缀
function norm(s) {
  if (!s) return '';
  return String(s).trim().replace(/\s+/g, '')
    .replace(/[（(].*?[)）]/g, '') // 去掉括号及内文
    .replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔|地区|自治州|盟|县|区|市辖区)$/g, '');
}

function lookup(index, raw) {
  if (!raw) return null;
  const keys = [raw, norm(raw), raw.replace(/(省|市|自治区|特别行政区|地区|自治州|盟|县|区|市辖区)$/, '')];
  for (const k of keys) {
    if (k && index[k]) return index[k];
  }
  return null;
}

/**
 * 解析行政编码。
 * @param {{province?:string, city?:string, district?:string, country?:string}} loc
 * @returns {{country_code, province_code, city_code, district_code} | {country_code, province_code, city_code, district_code:null}}
 */
export function resolveCode(loc = {}) {
  const out = { country_code: null, province_code: null, city_code: null, district_code: null };

  // 国家
  const cc = loc.country ? (COUNTRIES[loc.country] || COUNTRIES[norm(loc.country)] || null) : 'CN';
  out.country_code = cc || 'CN';

  // 海外：只给国家码，省市区不解析
  if (out.country_code !== 'CN') {
    return out;
  }

  const G = getGeo();
  const pv = lookup(G.provinceIndex, loc.province);
  if (pv) out.province_code = pv;

  const ct = lookup(G.cityIndex, loc.city) || (loc.city && pv ? lookup(G.cityIndex, loc.city) : null);
  if (ct) out.city_code = ct;

  // 直辖市兜底：城市名缺失但 province 是直辖市时，city_code 用 province+01
  if (!out.city_code && out.province_code) {
    const muniCodes = ['11', '31', '12', '50']; // 北京/上海/天津/重庆
    if (muniCodes.includes(out.province_code)) out.city_code = out.province_code + '01';
  }

  // 区县：优先用「城市+区名」消歧（解决跨市重名，如杭州/南昌 西湖区）
  if (loc.district && out.city_code) {
    const key = out.city_code + '|' + String(loc.district).trim().replace(/(区|县|市辖区)$/, '');
    const keyFull = out.city_code + '|' + String(loc.district).trim();
    out.district_code = G.areaByCity[key] || G.areaByCity[keyFull] || lookup(G.areaIndex, loc.district);
  } else if (loc.district) {
    out.district_code = lookup(G.areaIndex, loc.district);
  }

  return out;
}

export default { resolveCode, COUNTRIES, codeToNames };

/**
 * 反向：6 位区编码 -> 省/市/区名称（用于从区县反推城市文字）。
 * @returns {{province_name, city_name, district_name} | null}
 */
export function codeToNames(districtCode) {
  if (!districtCode) return null;
  const code = String(districtCode);
  if (code.length < 4) return null;
  const provinceCode = code.slice(0, 2);
  const cityCode = code.slice(0, 4);
  const pv = getGeo().provinces.find((p) => p.code === provinceCode);
  const ct = getGeo().cities.find((c) => c.code === cityCode);
  const ar = getGeo().areas.find((a) => a.code === code);
  if (!pv) return null;
  return {
    province_name: pv.name,
    city_name: ct ? ct.name : (pv.isMunicipality ? pv.name : null),
    district_name: ar ? ar.name : null,
  };
}
