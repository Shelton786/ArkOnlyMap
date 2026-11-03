// B站会员购 ID 扫描器 v2（2026-11-03）
//
// v1 教训：5  Worker 无间隔猛刷 → ~4000 请求后触发 B站 412 风控（IP 级，持续约 15 分钟+），
// 之后请求全部失败，扫描空转。且 v1 只覆盖 6 位号段（100000-115200，2025-04~2026-08），
// 漏掉 7 位号段（1001xxx-1007xxx，2026-07 至今的全部新活动，含库内 14 条与信息流 3 条）。
//
// v2 改进：
//   1. 请求节流：Worker 数默认 2，每次请求前 sleep(SPACING) 防秒封；
//   2. 412 感知：命中风控不记为失败——全局退避（60s 起翻倍，上限 300s），
//      被封 ID 进重试队列，解封后自动补扫，不漏 ID；
//   3. 断点续扫：读入既有 bili_scan.json 的命中（按 source_id 去重），可多次运行累积；
//   4. 命中即落盘（每 2000 个 ID + 退出时），被挡 ID 另存 _scan_blocked.json。
//
// 用法：node bili_scan2.mjs <start> <end> [workers]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchDetail, toRawRecordFromDetail } from './bili_api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const OUT = path.join(DATA, 'bili_scan.json');
const BLOCKED_OUT = path.join(DATA, '_scan_blocked.json');

const START_ID = Number(process.argv[2]);
const END_ID = Number(process.argv[3]);
const WORKERS = Number(process.argv[4] || 2);
if (!Number.isFinite(START_ID) || !Number.isFinite(END_ID) || START_ID > END_ID) {
  console.error('用法: node bili_scan2.mjs <start> <end> [workers]');
  process.exit(1);
}
const SPACING_MS = 500;          // 每 Worker 请求间隔（响应快时约 3~4 req/s）
const BLOCK_BASE_MS = 60000;     // 风控退避基数
const BLOCK_MAX_MS = 300000;     // 风控退避上限

const KW_RE = /明日方舟|方舟|arknights|音律联觉|终末地/i;

// ---- 既有命中载入（续扫） ----
const hitsByid = new Map();
if (fs.existsSync(OUT)) {
  try {
    const old = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    for (const r of old.records || []) hitsByid.set(String(r.source_id), r);
    console.error(`[bili-scan2] 载入既有命中 ${hitsByid.size} 条（上次范围 ${old.range ? old.range.start + '-' + old.range.end : '?'}）`);
  } catch (e) {
    console.error(`[bili-scan2] 旧扫描文件读取失败（将重开）: ${e.message}`);
  }
}

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

const stats = { scanned: 0, valid: 0, invalid: 0, failed: 0, blockedHits: 0, retried: 0 };
const failSamples = [];
let nextId = START_ID;
const retryQueue = [];
let blockedUntil = 0;      // 全局风控冷却截止时间戳
let backoffMs = BLOCK_BASE_MS;
const total = END_ID - START_ID + 1;

function save(tag) {
  const payload = {
    range: { start: START_ID, end: END_ID },
    scanned: stats.scanned,
    valid: stats.valid,
    invalid: stats.invalid,
    failed: stats.failed,
    blockedHits: stats.blockedHits,
    hits: hitsByid.size,
    updatedAt: new Date().toISOString(),
    tag,
    records: [...hitsByid.values()],
  };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
  fs.writeFileSync(BLOCKED_OUT, JSON.stringify({ blockedUntil: blockedUntil ? new Date(blockedUntil).toISOString() : null, queue: retryQueue }, null, 2), 'utf8');
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchOne(id) {
  // 返回 {kind:'ok'|'invalid'|'blocked'|'error', data|err}
  try {
    const data = await fetchDetail(id);
    return { kind: data ? 'ok' : 'invalid', data };
  } catch (e) {
    const msg = String(e.message || e);
    if (msg.includes('412')) return { kind: 'blocked', err: msg };
    return { kind: 'error', err: msg };
  }
}

async function worker(wid) {
  while (true) {
    // 风控冷却中：等待
    const now = Date.now();
    if (blockedUntil > now) {
      await sleep(Math.min(blockedUntil - now, 5000));
      continue;
    }
    let id = retryQueue.length ? retryQueue.shift() : nextId++;
    if (id === undefined || id > END_ID) {
      if (!retryQueue.length) return;
      continue;
    }
    if (id > END_ID) { if (!retryQueue.length) return; continue; }

    await sleep(SPACING_MS + Math.floor(Math.random() * 200)); // 节流 + 抖动
    const r = await fetchOne(id);
    if (r.kind === 'ok') {
      stats.scanned++; stats.valid++;
      const hay = `${r.data.name || ''} ${r.data.keywords || ''} ${r.data.tags || ''}`;
      if (KW_RE.test(hay)) {
        const rec = toRawRecordFromDetail(r.data, { keyword: null, reviewStatus: 'pending' });
        if (rec && !rec.__excluded && !hitsByid.has(String(rec.source_id))) {
          hitsByid.set(String(rec.source_id), slim(rec));
          console.error(`  ✓ [${id}] ${rec.title} ｜ ${rec.city || rec.province} ｜ ${rec.startDate}`);
        }
      }
    } else if (r.kind === 'invalid') {
      stats.scanned++; stats.invalid++;
    } else if (r.kind === 'blocked') {
      // 风控：不进 scanned 计数，ID 回队列，全局退避升级
      stats.blockedHits++;
      retryQueue.push(id);
      blockedUntil = Date.now() + backoffMs;
      console.error(`[bili-scan2] ⛔ 412 风控（id=${id}），全局退避 ${(backoffMs / 1000).toFixed(0)}s，重试队列 ${retryQueue.length}`);
      backoffMs = Math.min(backoffMs * 2, BLOCK_MAX_MS);
      save('blocked');
      await sleep(2000);
    } else {
      stats.scanned++; stats.failed++;
      if (failSamples.length < 20) failSamples.push({ id, err: r.err.slice(0, 120) });
      // 普通错误也补扫一次（网络抖动），仍失败则记录
      if (stats.failed % 50 === 0) console.error(`[bili-scan2] 普通失败累计 ${stats.failed}，样本: ${JSON.stringify(failSamples.slice(-3))}`);
    }
    if ((stats.scanned + stats.blockedHits) % 2000 < WORKERS) {
      save('progress');
      console.error(`[bili-scan2] 进度 ${stats.scanned}/${total}（有效 ${stats.valid}，无效 ${stats.invalid}，失败 ${stats.failed}，风控 ${stats.blockedHits}，命中 ${hitsByid.size}，重试队列 ${retryQueue.length}）`);
    }
  }
}

(async () => {
  console.error(`[bili-scan2] 扫描 ID ${START_ID}→${END_ID}（${total} 个，${WORKERS} 并发，节流 ${SPACING_MS}ms）`);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
  // 重试队列排空后收尾
  save('final');
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.error(`[bili-scan2] 完成：有效 ${stats.valid}，无效 ${stats.invalid}，失败 ${stats.failed}，风控命中 ${stats.blockedHits}，总命中 ${hitsByid.size}，耗时 ${mins} 分钟`);
  if (failSamples.length) console.error(`[bili-scan2] 失败样本：${JSON.stringify(failSamples.slice(0, 10))}`);
  if (retryQueue.length) console.error(`[bili-scan2] ⚠️ 仍有 ${retryQueue.length} 个 ID 未扫（风控未解），已存 _scan_blocked.json`);
  const byYear = {};
  for (const h of hitsByid.values()) {
    const y = (h.startDate || '未知').slice(0, 4);
    byYear[y] = (byYear[y] || 0) + 1;
  }
  console.error(`[bili-scan2] 命中年份分布：${JSON.stringify(byYear)}`);
  console.error(`-> ${OUT}`);
})().catch((e) => {
  console.error('[bili-scan2] 致命错误：', e);
  save('crash');
  process.exit(1);
});
