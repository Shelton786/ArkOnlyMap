// 归一化：把各来源的“原始活动对象”映射为 conventions 表 canonical 记录。
// 统一做行政编码解析（resolveCode）与编码反查城市名（codeToNames）。
import { resolveCode, codeToNames } from './geo.mjs';

/**
 * @param {object} raw 原始字段（至少含 title、startDate；可选 province/city/district/source/source_id/source_url/venue/address/organizer/description）
 * @param {string} source 来源标识：'bilibili' | 'cpp' | 'qianyu' | 'qiandao'
 * @returns {object} canonical 记录（可直接 upsert 进 conventions）
 */
export function normalize(raw, source) {
  const loc = {
    country: raw.country || '中国',
    province: raw.province || null,
    city: raw.city || null,
    district: raw.district || null,
  };
  const code = resolveCode(loc);

  // 若给了区县编码但缺城市文字，反查补全
  let cityName = raw.city || null;
  let provinceName = raw.province || null;
  if (code.district_code && !cityName) {
    const names = codeToNames(code.district_code);
    if (names) {
      cityName = names.city_name;
      if (!provinceName) provinceName = names.province_name;
    }
  }

  const start = raw.startDate || null;
  const end = raw.endDate && raw.endDate !== start ? raw.endDate : null;

  return {
    title: (raw.title || '').trim(),
    start_date: start,
    end_date: end,
    province: provinceName,
    city: cityName,
    district: raw.district || null,
    venue: raw.venue || null,
    address: raw.address || null,
    longitude: raw.longitude != null ? Number(raw.longitude) : null,
    latitude: raw.latitude != null ? Number(raw.latitude) : null,
    description: raw.description || null,
    organizer: raw.organizer || null,
    source_url: raw.source_url || null,
    poster_url: raw.poster_url || null,
    verified: 0,
    tags: raw.tags || null,
    country: loc.country,
    country_code: code.country_code,
    province_code: code.province_code,
    city_code: code.city_code,
    district_code: code.district_code,
    source,
    source_id: raw.source_id ? String(raw.source_id) : null,
    imported_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    review_status: 'approved', // 可信源自动过审
  };
}

export default { normalize };
