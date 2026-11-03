// B站会员购巡检：listV2 信息流深翻（全国在售项目）→ 关键词过滤 → 详情补全 → data/bili_now.json
//
// 背景（2026-11-03 重新探明，无需登录）：
//   发现通道：GET https://show.bilibili.com/api/ticket/project/listV2?platform=h5&area=0&page=N&pagesize=20
//     - area=0 为全国信息流（area 用行政区划代码，如 310000=上海，但 0 即全国无需按城市翻）
//     - 单条含 project_id/project_name/city/cityId/venue_name/district_name/start_time/end_time/
//       cover/coordinate/jump_url，字段足够完整
//     - keyword/p_type/sort 参数均被服务端忽略 → 只能全量翻 + 本地关键词过滤
//   ⚠️ 实测结论（2026-11-03）：**信息流只是「热榜轮播」不是全量目录**——page 参数基本被忽略，
//      每页返回的都几乎是同一份约 40 条的热榜（total 每请求 +20 只是计数器，pagesize 上限 20，
//      pagesize=50 直接返空；isLastBrush 恒 false）。曾偶然放出过一次 601 条的深刷会话，不可复现。
//      → 本脚本只能当「热榜补充」，**全量发现请用 bili_scan.mjs 的 ID 枚举**。
//   详情接口：GET https://show.bilibili.com/api/ticket/project/get?version=134&id=<id>
//     - 新旧两套 ID 空间通吃（商城 neul-next ID 1007371 与平台 ID 115034 都返回完整数据）
//     - 补出 description/keywords/merchant(主办方)/venue_info 等信息流没有的字段
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchDetail, toRawRecordFromDetail, parseCoord, normalizeRegion } from './bili_api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const LIST_V2 = 'https://show.bilibili.com/api/ticket/project/listV2';
const SHOW_DETAIL_PAGE = 'https://show.bilibili.com/platform/detail.html?id=';

// 命中关键词：强相关（明日方舟/arknights/音律联觉/终末地）+ 宽松（方舟，含诺亚方舟等误报，人工复核）
const KW_RE = /明日方舟|方舟|arknights|音律联觉|终末地/i;

const PAGE_SIZE = 20;
const MAX_PAGES = 600;            // 硬上限 600 页（12000 槽位）
const STALE_PAGES = 10;           // 连续 10 页无新增即停
const PAGE_DELAY_MS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchFeedPage(page, retry = 3) {
  for (let i = 1; i <= retry; i++) {
    try {
      const res = await fetch(`${LIST_V2}?platform=h5&area=0&page=${page}&pagesize=${PAGE_SIZE}`, {
        headers: { 'User-Agent': UA, Referer: 'https://show.bilibili.com/' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      if (j.errno !== 0 && j.code !== 0) throw new Error(`errno ${j.errno}/${j.code}: ${j.msg || j.message}`);
      return j.data || {};
    } catch (e) {
      if (i === retry) throw e;
      await sleep(800 * i);
    }
  }
}

/** 信息流单条 → 精简记录（详情失败时的兜底源）。 */
function recordFromFeed(it) {
  let coordinate = null;
  try { coordinate = it.coordinate ? JSON.parse(it.coordinate) : null; } catch (e) { /* 忽略 */ }
  const { longitude, latitude } = parseCoord(coordinate && coordinate.coor);
  let cover = it.cover || null;
  if (cover && cover.startsWith('//')) cover = 'https:' + cover;
  return {
    title: (it.project_name || '').trim(),
    city: normalizeRegion(it.city),
    district: normalizeRegion(it.district_name),
    startDate: it.start_time || null,
    endDate: it.end_time && it.end_time !== it.start_time ? it.end_time : null,
    venue: (it.venue_name || '').trim() || null,
    address: null,
    longitude,
    latitude,
    description: null,
    organizer: null,
    poster_url: cover,
    sale_flag: it.sale_flag || null,
    source_url: it.jump_url || `${SHOW_DETAIL_PAGE}${it.project_id}`,
  };
}

(async () => {
  console.error('[bili] 开始深翻 listV2 信息流（全国）…');
  const feed = new Map(); // project_id → item
  let stale = 0;
  let pages = 0;
  let lastBrush = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const d = await fetchFeedPage(page);
    const list = Array.isArray(d.result) ? d.result : [];
    let added = 0;
    for (const it of list) {
      const id = it && (it.project_id || it.id);
      if (id && !feed.has(String(id))) { feed.set(String(id), it); added++; }
    }
    pages = page;
    lastBrush = !!d.isLastBrush;
    if (page % 20 === 0 || added === 0) {
      console.error(`  · 第 ${page} 页：本页 ${list.length} 条，新增 ${added}，累计 ${feed.size}${lastBrush ? '（已到底）' : ''}`);
    }
    if (!list.length) { stale++; if (stale >= 3) break; }
    else if (added === 0) { stale++; if (stale >= STALE_PAGES) break; }
    else stale = 0;
    if (lastBrush) break;
    await sleep(PAGE_DELAY_MS);
  }

  console.error(`[bili] 信息流翻完：${pages} 页 / ${feed.size} 个不重复项目`);

  // 关键词过滤（先按标题粗筛）
  const candidates = [...feed.entries()]
    .filter(([id, it]) => KW_RE.test(it.project_name || ''))
    .map(([id, it]) => ({ id: String(id), it }));
  console.error(`[bili] 标题命中关键词 ${candidates.length} 个，开始补详情…`);

  const recs = [];
  let detailFail = 0;
  for (let i = 0; i < candidates.length; i++) {
    const { id, it } = candidates[i];
    let rec = null;
    try {
      const data = await fetchDetail(id);
      if (data) {
        const r = toRawRecordFromDetail(data, { keyword: null, reviewStatus: 'pending' });
        if (r && !r.__excluded) {
          rec = {
            source_id: r.source_id,
            title: r.title,
            province: r.province,
            city: r.city,
            district: r.district,
            startDate: r.startDate,
            endDate: r.endDate,
            venue: r.venue,
            address: r.address,
            longitude: r.longitude,
            latitude: r.latitude,
            description: r.description ? r.description.slice(0, 300) : null,
            organizer: r.organizer,
            poster_url: r.poster_url,
            tags: r.tags ? JSON.parse(r.tags) : [],
            url: r.source_url,
          };
        }
      }
    } catch (e) {
      detailFail++;
      console.error(`  ✗ [${id}] 详情失败：${e.message}`);
    }
    if (!rec) {
      // 详情拿不到时用信息流字段兜底（保证巡检不丢条目）
      const f = recordFromFeed(it);
      rec = { source_id: id, ...f, tags: [] };
    }
    recs.push(rec);
    if ((i + 1) % 10 === 0) console.error(`  · 详情进度 ${i + 1}/${candidates.length}`);
    await sleep(PAGE_DELAY_MS);
  }

  // 按开始日期排序，未来/进行中的排前面
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
  recs.sort((a, b) => (a.startDate || '9999').localeCompare(b.startDate || '9999'));

  const json = JSON.stringify(recs, null, 2);
  fs.writeFileSync(path.join(DATA, 'bili_now.json'), json, 'utf8');
  console.error(`[bili] 完成：命中 ${recs.length} 条（详情失败兜底 ${detailFail}），其中 ${recs.filter((r) => (r.startDate || '9999') >= today).length} 条未结束 → data/bili_now.json`);
  process.stdout.write(json);
})().catch((e) => {
  console.error('[bili] 致命错误：', e);
  process.exit(1);
});
