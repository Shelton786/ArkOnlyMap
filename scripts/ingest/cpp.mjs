// cpp (allcpp.cn / 无差别同人站) 采集适配器 —— HTML 抓取器（重写版，2026-08-04）
//
// 实测架构（详见 docs/cpp-ingest-redesign.md）：
//   - 列表/搜索结果在 App 原生桥（cp.allcpp.cn SPA，AllcppJSBridge）之后，纯 Web 不可达；
//   - 详情页 https://www.allcpp.cn/allcpp/event/event.do?event=<EID>
//     是服务端渲染页面，无需登录，数据以 eventParam JS 对象内联在 HTML 中，Web 可解析。
// 因此本脚本「只抓详情页」，活动 ID 列表这一步由用户手动提供：
//   A) App 内搜索页「另存为」HTML —— 每个 .event-box 带 event.do?event=<ID> 与「地点：」文本；
//   B) ID / URL 清单文件（.txt 每行一个 ID 或链接；.json 为数字数组或 {id,url,...} 对象数组）。
//
// 输出：canonical 原始记录数组（经 normalize 后由 run.mjs 幂等 upsert 写入 D1）。
//
// 关键规则：打着明日方舟标签、但「综合展」等与 ONLY 关系不大的展会【不录入】。
//   判定：标题含 EXCLUDE_NAME_KEYWORDS 任一关键词即跳过（默认 ['综合']，用户明确要求）。

import fs from 'node:fs';
import { findCityInText } from './geo.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const DETAIL_BASE = 'https://www.allcpp.cn/allcpp/event/event.do?event=';

// 综合展等「挂着标签但非 ONLY」的展会排除关键词（标题命中即跳过）
const EXCLUDE_NAME_KEYWORDS = ['综合'];

// 抓取限速与重试
const FETCH_DELAY_MS = 350;
const MAX_RETRY = 3;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// 列表解析：从用户提供的 ID 来源抽取 { eid, locationText?, name? }
// ---------------------------------------------------------------------------

/**
 * 模式 A：从 App 保存的搜索 HTML 提取每个活动卡片的 ID 与地点文本。
 * 每个 event.do?event=<ID> 出现后的一段内通常含 event-name 与「地点：…」文本。
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
    // 向前看窗口（同 </a> 块内），抓取该活动自己的名称与地点
    const block = html.slice(m.index, m.index + 2600);
    const nameM = block.match(/event-name[^>]*>([^<]+)</);
    const locM = block.match(/地点[:：][\s]*([^<｜|]+)/);
    items.push({
      eid,
      name: nameM ? nameM[1].trim() : null,
      locationText: locM ? locM[1].trim() : null,
    });
  }
  return items;
}

/**
 * 模式 B（文本）：解析 .txt 每行（每行一个 ID 或 event.do?event=<ID> 链接）。
 */
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

/**
 * 模式 B（JSON）：支持数字数组、字符串数组、或带 id/url/eid 的对象数组。
 */
function parseListFromJson(arr) {
  const items = [];
  const seen = new Set();
  for (const it of arr) {
    let id = null;
    let locationText = null;
    let name = null;
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

/**
 * 读取列表文件（按扩展名分流 .json / .txt）。
 */
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

// ---------------------------------------------------------------------------
// 详情页解析
// ---------------------------------------------------------------------------

/**
 * 提取 eventParam.<field>="value" 字符串赋值（处理 \" 转义）。
 */
export function parseEventParam(html) {
  const p = {};
  const strRe = /eventParam\.([A-Za-z0-9_]+)\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = strRe.exec(html)) !== null) {
    p[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  // 数字型元数据赋值（可能带 eventParam. 前缀或不带）：EID / eventCityId / eventType / isOnly / eventProvinceId
  const numRe = /(?:eventParam\.)?(EID|eventCityId|eventType|isOnly|eventProvinceId)\s*=\s*(-?\d+)/g;
  while ((m = numRe.exec(html)) !== null) {
    p[m[1]] = m[2];
  }
  return p;
}

/**
 * 提取主办方：u/<id>.do" ... title="<名>"
 */
export function parseOrganizer(html) {
  const m = html.match(/u\/(\d+)\.do"[^>]*title="([^"]+)"/);
  if (m) return { id: m[1], name: m[2].trim() };
  return null;
}

/**
 * 综合展等排除判定（标题命中关键词即跳过）。
 */
export function isExcluded(title, keywords = EXCLUDE_NAME_KEYWORDS) {
  if (!title) return false;
  return keywords.some((kw) => title.includes(kw));
}

/**
 * 把详情页 HTML 转为 canonical 原始记录。
 * @returns {object|null} 记录；返回 {__excluded:true,title,eid} 表示被排除；null 表示无效。
 */
export function toRawRecord(eid, html, listItem = {}) {
  const p = parseEventParam(html);
  const title = (p.eventName || '').trim() || listItem.name || null;
  if (!title) return null;

  if (isExcluded(title)) {
    return { __excluded: true, title, eid };
  }

  // 标签：eventTag 用 | 或 ，等分隔
  const tagsRaw = p.eventTag || '';
  const tags = tagsRaw.split(/[|｜,，;；]+/).map((s) => s.trim()).filter(Boolean);

  // 城市：优先 eventParam.eventCity（非空）→ 列表 locationText → 文本兜底匹配
  let city = (p.eventCity && p.eventCity.trim()) ? p.eventCity.trim() : null;
  let cityCode = (p.eventCityId && Number(p.eventCityId) > 0) ? Number(p.eventCityId) : null;
  const locationText = listItem.locationText || null;
  if (!city && locationText) {
    city = locationText.split(/[|｜]/)[0].trim(); // "无锡市新吴 | 场馆" → "无锡市新吴"
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

  const source_url = `${DETAIL_BASE}${eid}`;

  return {
    title,
    startDate: (p.sDate || '').slice(0, 10) || null,
    endDate: (p.eDate || '').slice(0, 10) || null,
    city,
    city_code: cityCode,
    venue: (p.enterAddress || '').trim() || null,
    address: (p.enterAddress || '').trim() || null,
    poster_url: pic || null,
    tags: tags.length ? JSON.stringify(tags) : null, // DB 以 JSON 字符串存储
    description: description || null,
    organizer: org ? org.name : null,
    source_url,
    source: 'cpp',
    source_id: eid,
    review_status: 'pending', // 首跑待人工核对映射后再放行；可用 --approve 覆盖
  };
}

/**
 * 抓取单个详情页（带重试）。
 */
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

// ---------------------------------------------------------------------------
// 编排：fetchCpp
// ---------------------------------------------------------------------------

/**
 * 采集入口。
 * @param {object} opts
 * @param {'html'|'list'} [opts.mode] 输入模式
 * @param {string} [opts.inputFile] 列表文件路径（html/list）
 * @param {string[]} [opts.eids] 直接给 ID 数组（不读文件）
 * @param {string} [opts.reviewStatus='pending'] 审核状态
 * @param {string[]} [opts.excludeKeywords] 覆盖排除关键词
 * @returns {Promise<Array<object>>} canonical 原始记录（已过滤被排除项）
 */
export async function fetchCpp(opts = {}) {
  const {
    mode, inputFile, eids,
    reviewStatus = 'pending',
    excludeKeywords = EXCLUDE_NAME_KEYWORDS,
  } = opts;

  let items = [];
  if (mode === 'html' && inputFile) {
    items = parseListFromHtml(fs.readFileSync(inputFile, 'utf8'));
  } else if (mode === 'list' && inputFile) {
    items = parseListFile(inputFile);
  } else if (Array.isArray(eids)) {
    const seen = new Set();
    items = eids.map(String).filter((e) => { if (seen.has(e)) return false; seen.add(e); return true; })
      .map((e) => ({ eid: e, locationText: null, name: null }));
  } else {
    console.warn('[cpp] 未指定输入：请用 --from-html <file> / --from-list <file> / { eids:[...] }');
    return [];
  }
  if (!items.length) { console.warn('[cpp] 未解析到任何活动 ID。'); return []; }

  const records = [];
  let fetched = 0, excluded = 0, failed = 0;
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

  console.log(`[cpp] 完成：成功 ${fetched}，跳过综合展 ${excluded}，失败 ${failed}。`);
  return records;
}

export default { fetchCpp, parseListFromHtml, parseListFromText, parseListFile, parseEventParam, parseOrganizer, toRawRecord, isExcluded };
