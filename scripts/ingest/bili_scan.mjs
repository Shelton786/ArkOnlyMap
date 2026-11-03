// B站会员购全量 ID 扫描：枚举 show.bilibili.com 票务项目 ID，关键词过滤明日方舟活动。
//
// 背景（2026-11-03）：信息流 listV2 只是热榜轮播（约 40 条），无法当目录用；
// 详情接口 project/get 对全部 ID 空间（含商城 neul-next 新 ID）免登录可用 →
// 用 ID 枚举做全量发现。已探明：100000≈2025-04，当前最大有效 ID≈115034。
//
// 输出：data/bili_scan.json（命中记录 + 统计），每 1000 个 ID 增量落盘，中断可续看。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchDetail, toRawRecordFromDetail } from './bili_api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const OUT = path.join(DATA, 'bili_scan.json');

const START_ID = Number(process.argv[2] || 100000);
const END_ID = Number(process.argv[3] || 115200);
const WORKERS = Number(process.argv[4] || 5);

// 命中关键词：强相关 + 「方舟」宽松（含诺亚方舟等误报，导入前人工复核）
const KW_RE = /明日方舟|方舟|arknights|音律联觉|终末地/i;

const hits = [];
const seen = new Set();
let validCount = 0;
let invalidCount = 0;
let failCount = 0;
let doneCount = 0;
let nextId = START_ID;
const total = END_ID - START_ID + 1;
const failSamples = [];

function slim(r) {
  return {
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
    description: r.description,
    organizer: r.organizer,
    poster_url: r.poster_url,
    tags: r.tags ? JSON.parse(r.tags) : [],
    url: r.source_url,
  };
}

function save(tag) {
  const payload = {
    range: { start: START_ID, end: END_ID },
    scanned: doneCount,
    valid: validCount,
    invalid: invalidCount,
    failed: failCount,
    hits: hits.length,
    updatedAt: new Date().toISOString(),
    tag,
    records: hits,
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
}

async function worker(wid) {
  while (true) {
    const id = nextId++;
    if (id > END_ID) return;
    try {
      const data = await fetchDetail(id);
      doneCount++;
      if (!data) { invalidCount++; continue; }
      validCount++;
      const hay = `${data.name || ''} ${data.keywords || ''} ${data.tags || ''}`;
      if (KW_RE.test(hay)) {
        const r = toRawRecordFromDetail(data, { keyword: null, reviewStatus: 'pending' });
        if (r && !r.__excluded) {
          hits.push(slim(r));
          console.error(`  ✓ [${id}] ${r.title} ｜ ${r.city || r.province} ｜ ${r.startDate}`);
        }
      }
    } catch (e) {
      doneCount++;
      failCount++;
      if (failSamples.length < 20) failSamples.push({ id, err: String(e.message || e).slice(0, 120) });
    }
    if (doneCount % 2000 < WORKERS) {
      save('progress');
      console.error(`[bili-scan] 进度 ${doneCount}/${total}（有效 ${validCount}，无效 ${invalidCount}，失败 ${failCount}，命中 ${hits.length}）`);
    }
  }
}

(async () => {
  console.error(`[bili-scan] 扫描 ID ${START_ID}→${END_ID}（${total} 个，${WORKERS} 并发）`);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
  save('final');
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.error(`[bili-scan] 完成：有效 ${validCount}，无效 ${invalidCount}，失败 ${failCount}，命中 ${hits.length}，耗时 ${mins} 分钟`);
  if (failSamples.length) console.error(`[bili-scan] 失败样本：${JSON.stringify(failSamples.slice(0, 10))}`);
  // 按年份统计命中分布
  const byYear = {};
  for (const h of hits) {
    const y = (h.startDate || '未知').slice(0, 4);
    byYear[y] = (byYear[y] || 0) + 1;
  }
  console.error(`[bili-scan] 命中年份分布：${JSON.stringify(byYear)}`);
  console.error(`-> ${OUT}`);
})().catch((e) => {
  console.error('[bili-scan] 致命错误：', e);
  save('crash');
  process.exit(1);
});
