// cpp (allcpp.cn / 无差别同人站) 采集适配器（重写版，2026-08-04 ~ 08-05）
//
// 数据链路（实测，详见 docs/cpp-ingest-redesign.md）：
//   1) 列表/搜索：真实后端 servlet（无需 App 原生桥、无需鉴权）：
//        GET https://www.allcpp.cn/allcpp/event/eventMainListV2.do
//            ?time=8&sort=1&keyword=<词>&pageNo=<页>&pageSize=10   （默认：仅未来活动）
//            ?day=0 &sort=1&keyword=<词>&pageNo=<页>&pageSize=50   （全部时间，含往期，最早见 2019 年）
//        必须带请求头：Referer/Origin: https://cp.allcpp.cn/ 、errorWrap: json
//        逆向来源：https://github.com/WindowsNoEditor/CPP_Search （已在 README 致谢）
//        注：time 是「未来时间窗」过滤器（只返未来）；day=0 才是网页搜索页真实参数，返回全量含往期。
//        返回 result.list，每条自带 id(EID)/name/type(ONLY|综合同人展)/tag/
//        provName/cityName/areaName/enterAddress/enterTime/endTime(ms)/logoPicUrl/ended。
//   2) 详情页（可选补全）：https://www.allcpp.cn/allcpp/event/event.do?event=<id>
//        服务端渲染、无需登录，eventParam 内联；含 description / 主办方（列表无）。
//
// 输入模式（run.mjs 切换）：
//   --keyword <词>     自动搜索模式（推荐）：分页拉列表，直接用列表字段填表。
//   --all-time          配合 --keyword：用 day=0 抓全量含往期（默认 time=8 仅未来）。往期存同表，靠日期区分。
//   --from-html <file> 解析 App 另存为的搜索页（抠 event.do?event=ID + 地点文本）。
//   --from-list <file> ID/URL 清单（.txt/.json）。
//   --detail           仅自动搜索模式：额外抓详情页补全 description/organizer（更慢）。
//
// 关键规则：打着明日方舟标签、但「综合同人展」等与 ONLY 关系不大的展会【不录入】。
//   判定：type === '综合同人展'（精准）或 标题含 EXCLUDE_NAME_KEYWORDS（兜底）。

import fs from 'node:fs';
import { findCityInText } from './geo.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const DETAIL_BASE = 'https://www.allcpp.cn/allcpp/event/event.do?event=';
const LIST_BASE = 'https://www.allcpp.cn/allcpp/event/eventMainListV2.do';
const IMG_HOST = 'https://imagecdn3.allcpp.cn/upload'; // 列表 relative 海报前缀

// 列表请求头（缺任何一项后端会拒，返回非 JSON）
const LIST_HEADERS = {
  'User-Agent': UA,
  'Referer': 'https://cp.allcpp.cn/',
  'Origin': 'https://cp.allcpp.cn',
  'errorWrap': 'json',
  'Accept': 'application/json',
};

// 综合展等「挂着标签但非 ONLY」的展会排除
const EXCLUDE_NAME_KEYWORDS = ['综合'];          // 标题兜底（如未来 type 字段改名）
const EXCLUDE_TYPE_NAMES = ['综合同人展'];        // 列表 type 精准排除

// 已取消的展会（enabled===5，语义取自 CPP_Search 的解析逻辑）不录入
const CANCELLED_ENABLED = 5;

const FETCH_DELAY_MS = 350;
const MAX_RETRY = 3;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ===========================================================================
// 工具
// ===========================================================================

/** 毫秒时间戳 → YYYY-MM-DD（列表 enterTime/endTime 为 ms）。 */
function msToDate(ms) {
  if (ms === undefined || ms === null || ms === '') return null;
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** 拆分标签（| 、，;； 等分隔）。 */
function parseTags(tag) {
  if (!tag) return [];
  return tag.split(/[|｜,，;；]+/).map((s) => s.trim()).filter(Boolean);
}

/** 海报相对路径 → 完整 URL。 */
function buildPoster(rel) {
  if (!rel) return null;
  if (/^https?:/i.test(rel)) return rel;
  return IMG_HOST + rel; // 形如 /2026/7/xxx.jpg
}

// ===========================================================================
// 列表解析（模式 A/B：用户手动提供的 ID 来源）
// ===========================================================================

/**
 * 模式 A：从 App 保存的搜索 HTML 提取每个活动卡片的 ID 与地点文本。
 */
export function parseListFromHtml(html) {
  const items = [];
  const seen = new Set();
  const idRe = /event\.do\?event=(\d+)/g;
  let m;
  while ((m = idRe.exec(html)) !== null) {
    const eid = m[1];
    if (seen.has(eid)) continue;
    seen.add(eid);
    const block = html.slice(m.index, m.index + 2600);
    const nameM = block.match(/event-name[^>]*>([^<]+)</);
    const locM = block.match(/地点[:：][\s]*([^｜|]+)/);
    items.push({
      eid,
      name: nameM ? nameM[1].trim() : null,
      locationText: locM ? locM[1].trim() : null,
    });
  }
  return items;
}

/** 模式 B（文本）：每行一个 ID 或 event.do?event=<ID> 链接。 */
export function parseListFromText(text) {
  const items = [];
  const seen = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    let id = null;
    const urlM = line.match(/event\.do\?event=(\d+)/);
    if (urlM) id = urlM[1];
    else {
      const numM = line.match(/\b(\d{3,8})\b/);
      if (numM) id = numM[1];
    }
    if (id && !seen.has(id)) { seen.add(id); items.push({ eid: id, locationText: null, name: null }); }
  }
  return items;
}

/** 模式 B（JSON）：数字数组 / 字符串数组 / {id,url,eid,...} 对象数组。 */
function parseListFromJson(arr) {
  const items = [];
  const seen = new Set();
  for (const it of arr) {
    let id = null, locationText = null, name = null;
    if (typeof it === 'number') id = String(it);
    else if (typeof it === 'string') {
      const mm = it.match(/event\.do\?event=(\d+)/) || it.match(/\b(\d{3,8})\b/);
      id = mm && mm[1];
    } else if (it && typeof it === 'object') {
      id = String(it.eid || it.id || it.event || '');
      if ((!id || id === 'undefined') && it.url) {
        const um = String(it.url).match(/event\.do\?event=(\d+)/);
        id = um && um[1];
      }
      locationText = it.locationText || null;
      name = it.name || null;
    }
    if (id && id !== 'undefined' && !seen.has(id)) {
      seen.add(id);
      items.push({ eid: id, locationText: locationText || null, name: name || null });
    }
  }
  return items;
}

/** 读取列表文件（按扩展名分流 .json / .txt）。 */
export function parseListFile(path) {
  const text = fs.readFileSync(path, 'utf8');
  if (path.toLowerCase().endsWith('.json')) {
    let arr;
    try { arr = JSON.parse(text); } catch { console.warn(`[cpp] JSON 解析失败：${path}`); return []; }
    if (!Array.isArray(arr)) arr = [arr];
    return parseListFromJson(arr);
  }
  return parseListFromText(text);
}

// ===========================================================================
// 详情页解析
// ===========================================================================

/** 提取 eventParam.<field>="value" 字符串赋值（处理 \" 转义）。 */
export function parseEventParam(html) {
  const p = {};
  const strRe = /eventParam\.([A-Za-z0-9_]+)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = strRe.exec(html)) !== null) {
    p[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  const numRe = /(?:eventParam\.)?(EID|eventCityId|eventType|isOnly|eventProvinceId)\s*=\s*(-?\d+)/g;
  while ((m = numRe.exec(html)) !== null) {
    p[m[1]] = m[2];
  }
  return p;
}

/** 提取主办方：u/<id>.do" ... title="<名>" */
export function parseOrganizer(html) {
  const m = html.match(/u\/(\d+)\.do"[^>]*title="([^"]+)"/);
  if (m) return { id: m[1], name: m[2].trim() };
  return null;
}

/** 综合展等排除判定（标题命中关键词即跳过）。 */
export function isExcluded(title, keywords = EXCLUDE_NAME_KEYWORDS) {
  if (!title) return false;
  return keywords.some((kw) => title.includes(kw));
}

/** 类型精准排除（列表 type 字段）。 */
export function isExcludedByType(type, names = EXCLUDE_TYPE_NAMES) {
  return !!type && names.includes(type.trim());
}

/**
 * 把详情页 HTML 转为 canonical 原始记录（用于 --from-html / --from-list / --detail 补全）。
 * @returns {object|null} 记录；{__excluded:true,...} 表示被排除；null 表示无效。
 */
export function toRawRecord(eid, html, listItem = {}) {
  const p = parseEventParam(html);
  const title = (p.eventName || '').trim() || listItem.name || null;
  if (!title) return null;

  if (isExcluded(title)) {
    return { __excluded: true, title, eid };
  }

  const tagsRaw = p.eventTag || '';
  const tags = tagsRaw.split(/[|｜,，;；]+/).map((s) => s.trim()).filter(Boolean);

  let city = (p.eventCity && p.eventCity.trim()) ? p.eventCity.trim() : null;
  let cityCode = (p.eventCityId && Number(p.eventCityId) > 0) ? Number(p.eventCityId) : null;
  const locationText = listItem.locationText || null;
  if (!city && locationText) {
    city = locationText.split(/[|｜]/)[0].trim();
  }
  if (!cityCode) {
    const texts = [city, locationText, p.enterAddress, p.desContent].filter(Boolean);
    for (const t of texts) {
      const found = findCityInText(t);
      if (found) { city = found.city_name; cityCode = found.city_code; break; }
    }
  }

  const org = parseOrganizer(html);
  const pic = (p.picUrl || '').replace(/^\/\//, 'https://');
  let description = (p.desContent || '').trim();
  if (p.tbLink) description += (description ? '\n' : '') + `购票：${p.tbLink}`;

  return {
    title,
    startDate: (p.sDate || '').slice(0, 10) || null,
    endDate: (p.eDate || '').slice(0, 10) || null,
    city,
    city_code: cityCode,
    venue: (p.enterAddress || '').trim() || null,
    address: (p.enterAddress || '').trim() || null,
    poster_url: pic || null,
    tags: tags.length ? JSON.stringify(tags) : null,
    description: description || null,
    organizer: org ? org.name : null,
    source_url: `${DETAIL_BASE}${eid}`,
    source: 'cpp',
    source_id: eid,
    review_status: 'pending',
  };
}

/** 仅从详情页抽取「列表没有」的字段（description / organizer），用于 --detail 补全。 */
export function enrichFromDetail(html) {
  const p = parseEventParam(html);
  const org = parseOrganizer(html);
  let description = (p.desContent || '').trim();
  if (p.tbLink) description += (description ? '\n' : '') + `购票：${p.tbLink}`;
  return {
    description: description || null,
    organizer: org ? org.name : null,
  };
}

/** 抓取单个详情页（带重试）。 */
export async function fetchDetail(eid) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(`${DETAIL_BASE}${eid}`, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (!html.includes('eventParam')) throw new Error('详情页未含 eventParam（可能改版或被拦截）');
      return html;
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRY) await sleep(FETCH_DELAY_MS);
    }
  }
  throw lastErr;
}

// ===========================================================================
// 自动搜索模式（真实列表接口）
// ===========================================================================

/**
 * 分页拉取事件列表（eventMainListV2.do）。
 * @param {string} keyword
 * @param {{pageSize?:number, maxPages?:number, onPage?:function}} [opts]
 * @returns {Promise<Array<object>>} 原始列表项（含 id/name/type/tag/省市区/时间/海报）
 */
export async function fetchSearchList(keyword, opts = {}) {
  const { pageSize = 10, maxPages = 50, onPage, allTime = false } = opts;
  // allTime=true → 用 day=0（网页搜索页真实参数，返回全量含往期）；默认 time=8（仅未来）。
  // 往期量大（如「明日方舟」261 条），allTime 时把分页拉大减少请求数。
  const timeParam = allTime ? 'day=0' : 'time=8';
  const ps = allTime ? Math.max(pageSize, 50) : pageSize;
  const all = [];
  let total = Infinity;
  for (let page = 1; page <= maxPages; page++) {
    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        const url = `${LIST_BASE}?${timeParam}&sort=1&keyword=${encodeURIComponent(keyword)}&pageNo=${page}&pageSize=${ps}`;
        const res = await fetch(url, { headers: LIST_HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        if (!j || j.isSuccess === false) throw new Error(`接口返回失败：${j && j.message || '未知'}`);
        const result = j.result || {};
        const list = Array.isArray(result.list) ? result.list : [];
        if (typeof result.total === 'number') total = result.total;
        if (onPage) onPage(page, list.length, total);
        for (const it of list) all.push(it);
        if (list.length < pageSize || all.length >= total) return all;
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        if (attempt < MAX_RETRY) await sleep(FETCH_DELAY_MS);
      }
    }
    if (lastErr) throw lastErr;
    await sleep(FETCH_DELAY_MS);
  }
  return all;
}

/**
 * 把列表项直接映射为 canonical 原始记录（无需抓详情页）。
 * @returns {object} 记录；{__excluded:true,...} 表示被排除。
 */
export function toRawRecordFromList(item, reviewStatus = 'pending') {
  const eid = String(item.id);
  const title = (item.name || '').trim();

  // 已取消的展会（enabled===5）不录入（借鉴 CPP_Search 的 enabled 语义）
  if (item.enabled === CANCELLED_ENABLED) {
    return { __excluded: true, title, eid, type: item.type, reason: 'cancelled' };
  }
  if (isExcludedByType(item.type) || isExcluded(title)) {
    return { __excluded: true, title, eid, type: item.type };
  }
  if (!title) return { __excluded: true, title: '(无标题)', eid };

  const tags = parseTags(item.tag);
  const provName = item.provName || null;
  const cityName = item.cityName || null;
  const areaName = item.areaName || null;

  return {
    title,
    startDate: msToDate(item.enterTime),
    endDate: msToDate(item.endTime),
    province: provName,
    city: cityName,
    district: areaName,
    venue: (item.enterAddress || '').trim() || null,
    address: (item.enterAddress || '').trim() || null,
    poster_url: buildPoster(item.logoPicUrl || item.appLogoPicUrl),
    tags: tags.length ? JSON.stringify(tags) : null,
    description: null,      // 列表无简介；--detail 时补全
    organizer: null,        // 列表无主办方；--detail 时补全
    source_url: `${DETAIL_BASE}${eid}`,
    source: 'cpp',
    source_id: eid,
    review_status: reviewStatus,
  };
}

// ===========================================================================
// 编排：fetchCpp
// ===========================================================================

/**
 * 采集入口。
 * @param {object} opts
 * @param {'search'|'html'|'list'} [opts.mode]
 * @param {string} [opts.keyword] 自动搜索关键词（mode='search'）
 * @param {string} [opts.inputFile] 列表文件路径（html/list）
 * @param {string[]} [opts.eids] 直接给 ID 数组
 * @param {string} [opts.reviewStatus='pending']
 * @param {boolean} [opts.fetchDetails=false] 自动搜索模式额外抓详情页补全
 * @param {string[]} [opts.excludeKeywords]
 * @returns {Promise<Array<object>>} canonical 原始记录（已过滤被排除项）
 */
export async function fetchCpp(opts = {}) {
  const {
    mode, inputFile, eids, keyword,
    reviewStatus = 'pending',
    fetchDetails = false,
    excludeKeywords = EXCLUDE_NAME_KEYWORDS,
    allTime = false,
  } = opts;

  let items = [];
  if (mode === 'search' && keyword) {
    console.log(`[cpp] 自动搜索「${keyword}」：${allTime ? '全部时间（含往期 day=0）' : '仅未来（time=8）'}，分页拉取列表接口 ...`);
    items = await fetchSearchList(keyword, {
      allTime,
      onPage: (p, n, total) => console.log(`  · 第 ${p} 页 ${n} 条（累计 ${total}）`),
    });
  } else if (mode === 'html' && inputFile) {
    items = parseListFromHtml(fs.readFileSync(inputFile, 'utf8'));
  } else if (mode === 'list' && inputFile) {
    items = parseListFile(inputFile);
  } else if (Array.isArray(eids)) {
    const seen = new Set();
    items = eids.map(String).filter((e) => { if (seen.has(e)) return false; seen.add(e); return true; })
      .map((e) => ({ eid: e, locationText: null, name: null }));
  } else {
    console.warn('[cpp] 未指定输入：请用 --keyword <词> / --from-html <file> / --from-list <file> / { eids:[...] }');
    return [];
  }
  if (!items.length) { console.warn('[cpp] 未解析到任何活动。'); return []; }

  const records = [];
  let fetched = 0, excluded = 0, failed = 0;

  if (mode === 'search') {
    console.log(`[cpp] 列表接口返回 ${items.length} 个活动，开始映射（综合展自动排除）...`);
    for (const it of items) {
      const rec = toRawRecordFromList(it, reviewStatus);
      if (rec && rec.__excluded) {
        excluded++;
        const why = rec.reason === 'cancelled' ? '已取消' : (rec.type || '综合展');
        console.log(`  ⊘ 跳过（${why}）: [${rec.eid}] ${rec.title}`);
        continue;
      }
      if (fetchDetails) {
        try {
          const html = await fetchDetail(rec.source_id);
          Object.assign(rec, enrichFromDetail(html));
        } catch (e) {
          console.warn(`  ⚠ [${rec.source_id}] 详情补全失败：${e.message}`);
        }
        await sleep(FETCH_DELAY_MS);
      }
      records.push(rec);
      fetched++;
      console.log(`  ✓ [${rec.source_id}] ${rec.title} ｜ ${rec.city || rec.province || '城市未知'} ｜ ${rec.startDate}`);
    }
  } else {
    console.log(`[cpp] 解析到 ${items.length} 个活动 ID，开始抓取详情页（间隔 ${FETCH_DELAY_MS}ms）...`);
    for (const it of items) {
      try {
        const html = await fetchDetail(it.eid);
        const rec = toRawRecord(it.eid, html, it);
        if (rec && rec.__excluded) {
          excluded++;
          console.log(`  ⊘ 跳过（综合展等非ONLY）: [${it.eid}] ${rec.title}`);
          continue;
        }
        if (!rec) { failed++; console.warn(`  ✗ 无标题，跳过: [${it.eid}]`); continue; }
        rec.review_status = reviewStatus;
        records.push(rec);
        fetched++;
        console.log(`  ✓ [${it.eid}] ${rec.title} ｜ ${rec.city || '城市未知'} ｜ ${rec.startDate}`);
      } catch (e) {
        failed++;
        console.warn(`  ✗ [${it.eid}] 抓取失败：${e.message}`);
      }
      await sleep(FETCH_DELAY_MS);
    }
  }

  console.log(`[cpp] 完成：成功 ${fetched}，跳过综合展 ${excluded}，失败 ${failed}。`);
  return records;
}

export default {
  fetchCpp, fetchSearchList, toRawRecordFromList, enrichFromDetail,
  parseListFromHtml, parseListFromText, parseListFile, parseEventParam, parseOrganizer,
  toRawRecord, isExcluded, isExcludedByType,
};
