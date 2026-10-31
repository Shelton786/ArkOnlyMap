// bili (show.bilibili.com 会员购/票务平台) 采集适配器
//
// 数据链路（2026-08-14 实测，无需登录）：
//   详情接口（已验证可用）：
//     GET https://show.bilibili.com/api/ticket/project/get?version=134&id=<项目ID>
//     返回 data 含：name / type / project_type / start_time / end_time(均为【秒】级时间戳)
//       / cover(海报，//i?.hdslb.com 相对协议) / keywords(逗号分隔) / tags / description
//       / venue_info{ name, province_name, city_name, district_name, address_detail,
//                      coordinate.coor:"经度,纬度"(GCJ-02 高德坐标！) }
//       / place_info{ name(展厅) } / merchant{ company(主办方) } / screen_list[]{ start_time_str }
//
// 关键差异（vs cpp.mjs）：
//   1) 时间戳是【秒】不是毫秒 → secToDate() 用 Intl Asia/Shanghai 取日期（同 cpp 思路）。
//   2) 坐标已是 GCJ-02（高德），与本项目前端高德地图坐标系一致，无需转换，直接拆 "lng,lat"。
//   3) 城市/省份在 venue_info 里已是干净中文（广西/南宁），无需像 cpp 那样反向地理编码；
//      仅做「市/省/自治区」后缀归一（与项目 P1 规则一致）。
//   4) 一个项目 = 一场活动（同 ID）。关键词命中 name/keywords 即视为目标（如 明日方舟）。
//
// 发现活动 ID 的两种方式（FIXME: 搜索接口待接）：
//   - mode:'range'  给定 ID 区间枚举 + 按关键词过滤（已验证可行，但区间大时请求多）。
//   - mode:'search' 调用站方搜索接口（接口藏在 H5 module-federation 分包里，待逆向接入）。
//
// 输出：与 cpp.mjs 完全同构的 canonical 记录，可直接交给 run.mjs 的 upsertEvents（EVENT_COLS）。

import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const DETAIL_BASE = 'https://show.bilibili.com/api/ticket/project/get';
const DETAIL_PAGE = 'https://show.bilibili.com/platform/detail.html?id='; // 活动落地页（source_url）
const IMG_HOST = 'https:' ; // cover 是 //i?.hdslb.com，补 https: 即可

const FETCH_DELAY_MS = 350;
const MAX_RETRY = 3;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ===========================================================================
// 工具
// ===========================================================================

/**
 * 秒级时间戳 → YYYY-MM-DD（北京时间，Asia/Shanghai）。
 * bilibili 的 start_time/end_time 是【秒】，与 cpp（毫秒）不同。
 */
export function secToDate(sec) {
  if (sec === undefined || sec === null || sec === '') return null;
  const n = Number(sec);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n * 1000); // 秒 → 毫秒
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

/** "108.379656,22.808627" → { longitude, latitude }（GCJ-02 高德坐标）。 */
export function parseCoord(coor) {
  if (!coor || typeof coor !== 'string') return { longitude: null, latitude: null };
  const [lng, lat] = coor.split(',').map((s) => parseFloat(s.trim()));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return { longitude: null, latitude: null };
  return { longitude: lng, latitude: lat };
}

/** 省/市/自治区后缀归一（去「省」「市」「自治区」「壮族自治区」「回族自治区」「维吾尔自治区」）。 */
export function normalizeRegion(name) {
  if (!name) return null;
  return name
    .replace(/(维吾尔)?(壮族)?(回族)?自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
    .trim() || null;
}

/** 逗号/空格分隔的关键词 → 数组。 */
function parseKeywords(kw) {
  if (!kw) return [];
  return kw.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean);
}

// ===========================================================================
// 详情解析 → canonical 记录
// ===========================================================================

/**
 * 把 project/get 的 data 映射为 canonical 原始记录（字段对齐 EVENT_COLS / UPSERT_COLS）。
 * @returns {object} 记录；命中排除条件时返回 {__excluded:true,...}。
 */
export function toRawRecordFromDetail(data, { keyword, reviewStatus = 'pending' } = {}) {
  const id = String(data.id);
  const title = (data.name || '').trim();
  if (!title) return { __excluded: true, title: '(无标题)', id };

  // 关键词过滤（如仅要 明日方舟 相关）
  if (keyword) {
    const hay = `${title} ${(data.keywords || '')} ${(data.tags || '')}`.toLowerCase();
    if (!hay.includes(keyword.toLowerCase())) {
      return { __excluded: true, title, id, reason: 'keyword-mismatch' };
    }
  }

  const venue = data.venue_info || {};
  const place = data.place_info || {};
  const merchant = data.merchant || {};
  const { longitude, latitude } = parseCoord(venue.coordinate && venue.coordinate.coor);

  // 日期：优先用 screen_list 首日/末日字符串（已是 YYYY-MM-DD），否则用秒级时间戳
  const screens = Array.isArray(data.screen_list) ? data.screen_list : [];
  const screenDates = screens.map((s) => s.start_time_str).filter(Boolean).sort();
  const startDate = screenDates[0] || secToDate(data.start_time);
  const endDate = screenDates[screenDates.length - 1] || secToDate(data.end_time);

  const province = normalizeRegion(venue.province_name);
  const city = normalizeRegion(venue.city_name);
  const district = normalizeRegion(venue.district_name);

  let poster = data.cover || data.banner || null;
  if (poster && poster.startsWith('//')) poster = IMG_HOST + poster;

  const address = [venue.address_detail, place.name].filter(Boolean).join(' ').trim() || null;

  const kwTags = parseKeywords(data.keywords);
  const tagsRaw = data.tags ? parseKeywords(data.tags) : [];
  const tags = [...new Set([...kwTags, ...tagsRaw])];

  let description = (data.description || '').trim();
  if (data.performance_desc) description += (description ? '\n' : '') + data.performance_desc;

  return {
    title,
    startDate,
    endDate,
    province,
    city,
    district,
    country: '中国',
    venue: (venue.name || '').trim() || null,
    address,
    longitude,
    latitude,
    description: description || null,
    organizer: (merchant.company || '').trim() || null,
    source_url: `${DETAIL_PAGE}${id}`,
    poster_url: poster,
    verified: 1,                                   // B 站官方票务，信息可信
    tags: tags.length ? JSON.stringify(tags) : null,
    submitted_by: null,
    review_status: reviewStatus,
    submission_type: 'imported',
    parent_event_id: null,
    organizer_user_id: null,
    organizer_claim_status: 'none',
    country_code: 'CN',
    province_code: null,
    city_code: null,                               // venue_info 无数字编码，留空（地图按城市名聚簇）
    district_code: null,
    source: 'bilibili',
    source_id: id,
    imported_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
}

/** 抓取单个详情（带重试）。 */
export async function fetchDetail(id) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const url = `${DETAIL_BASE}?version=134&id=${encodeURIComponent(id)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Referer': 'https://show.bilibili.com/' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      if (j.code && j.code !== 0) {
        // code=100011 项目不存在 → 视为无效 ID，不重试
        if (j.code === 100011) return null;
        throw new Error(`code ${j.code}: ${j.msg}`);
      }
      // 「项目不存在」时响应为 {code:undefined, msg:"项目不存在", data:{}}（空对象），
      // 必须校验 data.name 才视为有效活动，否则空对象会被误判为有效。
      if (!j.data || !j.data.name) return null;
      return j.data;
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRY) await sleep(FETCH_DELAY_MS);
    }
  }
  throw lastErr;
}

// ===========================================================================
// 编排：fetchBili
// ===========================================================================

/**
 * 采集入口。
 * @param {object} opts
 * @param {'range'|'ids'|'search'} [opts.mode='range']
 * @param {number} [opts.startId]   range 起点
 * @param {number} [opts.endId]     range 终点
 * @param {string[]} [opts.ids]     给定 ID 列表
 * @param {string} [opts.keyword]   关键词过滤（如 '明日方舟'）
 * @param {string} [opts.reviewStatus='pending']
 * @param {(i:number,total:number,found:number)=>void} [opts.onProgress]
 * @returns {Promise<Array<object>>} canonical 记录（已过滤非命中）
 */
export async function fetchBili(opts = {}) {
  const {
    mode = 'range', startId = 1, endId = 60000,
    ids, keyword, reviewStatus = 'pending', onProgress,
  } = opts;

  let idList = [];
  if (mode === 'ids' && Array.isArray(ids)) {
    idList = [...new Set(ids.map(String))];
  } else if (mode === 'range') {
    for (let i = startId; i <= endId; i++) idList.push(String(i));
  } else {
    console.warn('[bili] 暂未接入 search 模式（站方搜索接口待逆向）。请用 mode=range / ids。');
    return [];
  }

  const records = [];
  let found = 0, missing = 0, failed = 0;
  const total = idList.length;

  for (let idx = 0; idx < idList.length; idx++) {
    const id = idList[idx];
    try {
      const data = await fetchDetail(id);
      if (!data) { missing++; }
      else {
        const rec = toRawRecordFromDetail(data, { keyword, reviewStatus });
        if (rec && rec.__excluded) {
          if (rec.reason !== 'keyword-mismatch') {
            // 非关键词排除（理论上不会到这里）；跳过
          }
          // keyword-mismatch 属正常过滤，不计入 found
        } else {
          records.push(rec);
          found++;
          console.log(`  ✓ [${id}] ${rec.title} ｜ ${rec.city || rec.province || '城市未知'} ｜ ${rec.startDate}`);
        }
      }
    } catch (e) {
      failed++;
      if (failed <= 5) console.warn(`  ✗ [${id}] 抓取失败：${e.message}`);
    }
    if (onProgress && (idx % 500 === 0)) onProgress(idx, total, found);
    if (idx < idList.length - 1) await sleep(FETCH_DELAY_MS);
  }

  console.log(`[bili] 完成：命中 ${found}，无效ID ${missing}，失败 ${failed}（共扫 ${total}）。`);
  return records;
}

export default {
  fetchBili, fetchDetail, toRawRecordFromDetail, secToDate, parseCoord, normalizeRegion,
};
