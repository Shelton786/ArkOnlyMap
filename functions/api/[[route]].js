// Cloudflare Pages Functions 入口
// 该文件匹配所有 /api/* 请求，交给 Hono 应用处理。
// 环境变量 / D1 绑定通过 c.env 注入（见 wrangler.toml）。
import { handle } from 'hono/cloudflare-pages';
import { createApp } from '../../src/app.js';

export const onRequest = handle(createApp());

// ---------------- 定时采集（Cron Trigger） ----------------
// 每天由 wrangler.toml 的 [triggers].crons 触发。
// 自动采集「可程序化」的源（cpp / 千羽），B站会员购为半自动（朋友导出文件 → run.mjs），不在定时任务内。
import { loadGeo } from '../../scripts/ingest/geo.mjs';
import { fetchCpp } from '../../scripts/ingest/cpp.mjs';
import { parseQianyuCsv } from '../../scripts/ingest/qianyu.mjs';
import { upsertEvents } from '../../src/db-d1.js';

export const scheduled = async (controller, env, ctx) => {
  const DB = env.DB;
  if (!DB) {
    console.error('[scheduled] 缺少 DB 绑定，跳过采集');
    return;
  }

  // 1) 加载行政区划编码（部署后的静态资源）
  let geo = null;
  try {
    const res = await env.ASSETS.fetch(new Request('https://local/data/geo_codes.json'));
    if (res.ok) geo = await res.json();
  } catch (e) {
    console.warn('[scheduled] 加载 geo_codes.json 失败：', e.message);
  }
  if (!geo) {
    console.error('[scheduled] 无法加载 geo_codes.json，本次采集跳过');
    return;
  }
  loadGeo(geo);

  const records = [];

  // 2) cpp（接口地址可经 env.CPP_API_BASE 覆盖；当前为猜测值，失败会跳过）
  try {
    const cpp = await fetchCpp({ apiBase: env.CPP_API_BASE, keyword: env.CPP_KEYWORD });
    records.push(...cpp.map((r) => ({ ...r, _src: 'cpp' })));
    console.log(`[scheduled] cpp：${cpp.length} 条`);
  } catch (e) {
    console.warn('[scheduled] cpp 采集失败：', e.message);
  }

  // 3) 千羽腾讯文档（需先在环境变量配置 QIANYU_CSV_URL 指向一个公开 CSV）
  if (env.QIANYU_CSV_URL) {
    try {
      const csvRes = await fetch(env.QIANYU_CSV_URL);
      if (csvRes.ok) {
        const qs = parseQianyuCsv(await csvRes.text());
        records.push(...qs.map((r) => ({ ...r, _src: 'qianyu' })));
        console.log(`[scheduled] qianyu：${qs.length} 条`);
      } else {
        console.warn('[scheduled] 千羽 CSV 拉取失败，HTTP', csvRes.status);
      }
    } catch (e) {
      console.warn('[scheduled] 千羽采集失败：', e.message);
    }
  } else {
    console.log('[scheduled] 未配置 QIANYU_CSV_URL，跳过千羽');
  }

  // 4) 落库（幂等 upsert）
  if (records.length) {
    const n = await upsertEvents(DB, records);
    console.log(`[scheduled] 已 upsert ${n} 条`);
  } else {
    console.log('[scheduled] 本次无新数据');
  }
};
