// cpp (allcpp.cn) 采集适配器。
// 说明：cp.allcpp.cn 是托管在阿里 OSS 的 SPA，数据走独立 API（CDN 网关后，静态包内无域名）。
// 因此真实接口路径需你确认——这里用环境变量 CPP_API_BASE（默认 https://cp.allcpp.cn/api）
// 与路径 /event/search?keyword=明日方舟 调用，并对返回做“宽容字段映射”。
// 若某天接口变动，只需改这里，不影响整体管道。
import { normalize } from './normalize.mjs';

// process.env 在 Worker 中不存在，用 typeof 守卫，避免模块加载时崩溃
const API_BASE = (typeof process !== 'undefined' && process.env && process.env.CPP_API_BASE) || 'https://cp.allcpp.cn/api';
const KEYWORD = (typeof process !== 'undefined' && process.env && process.env.CPP_KEYWORD) || '明日方舟';

/**
 * 抓取并归一化为 canonical 记录数组。
 * @param {{apiBase?:string, keyword?:string}} [opts] 可覆盖默认接口地址与关键词（Worker 下由 env 注入）
 * @returns {Promise<Array<object>>}
 */
export async function fetchCpp(opts = {}) {
  const apiBase = opts.apiBase || API_BASE;
  const keyword = opts.keyword || KEYWORD;
  const url = `${apiBase}/event/search?keyword=${encodeURIComponent(keyword)}`;
  let data;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'arkonlymap-ingest/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.warn(`[cpp] 抓取失败（${url}）：${e.message}；跳过该源。`);
    return [];
  }
  // 兼容多种包裹：data.list / data.data / data.data.list / data.items
  const list = data?.list || data?.data?.list || data?.data || data?.items || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) {
    console.warn('[cpp] 返回结构无法识别，跳过。');
    return [];
  }
  const out = [];
  for (const it of list) {
    // 宽容字段映射（不同接口命名不一）
    const title = it.title || it.name || it.eventName;
    if (!title) continue;
    const startDate = it.startDate || it.start_date || it.time || it.beginTime || null;
    const addr = it.address || it.venue || it.location || '';
    out.push(normalize({
      title,
      startDate: String(startDate || '').slice(0, 10) || null,
      province: it.province || it.provinceName || null,
      city: it.city || it.cityName || null,
      district: it.district || it.districtName || null,
      venue: addr,
      address: addr,
      source_url: it.url || it.link || it.detailUrl || null,
      source_id: it.id ?? it.eventId ?? null,
      organizer: it.organizer || it.sponsor || null,
      description: it.desc || it.description || null,
    }, 'cpp'));
  }
  return out;
}

export default { fetchCpp };
