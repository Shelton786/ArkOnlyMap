/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * 边缘缓存助手（Cloudflare Pages Functions 专用）。
 * Pages Functions 的动态响应不会被 CDN 自动缓存（仅设 s-maxage 无效，
 * Workers Cache 特性只适用独立 Workers），必须显式 caches.default.match/put。
 * TTL 认 s-maxage、忽略 stale-while-revalidate；缓存按数据中心隔离。
 */

/**
 * @param {string} cacheKeyUrl 完整 URL 作为缓存键。响应与 query 无关的端点
 *   应传入去掉 query 的 URL，避免随机参数制造一次性缓存垃圾。
 * @param {number} ttlSeconds 边缘 TTL（秒），写入 Cache-Control: s-maxage。
 * @param {() => Promise<Response>} fetcher 未命中时生成响应；其自带的
 *   Cache-Control 会被覆盖为 public, max-age=0, s-maxage=<ttl>。
 * @returns {Promise<Response>} 带 X-Edge-Cache: HIT/MISS 诊断头的响应。
 */
export async function edgeCache(cacheKeyUrl, ttlSeconds, fetcher) {
  const key = new Request(cacheKeyUrl, { method: 'GET' });
  try {
    const hit = await caches.default.match(key);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set('X-Edge-Cache', 'HIT');
      return res;
    }
  } catch (e) { console.warn('edge cache match failed:', e.message); }
  const res = await fetcher();
  // 只缓存成功响应：404 等错误不入缓存（如活动稍后过审，缓存的 404 会挡住新页面），
  // 保留 fetcher 自带的 Cache-Control（如 no-store）
  if (!res.ok) return res;
  res.headers.set('Cache-Control', `public, max-age=0, s-maxage=${ttlSeconds}`);
  res.headers.set('X-Edge-Cache', 'MISS');
  try { await caches.default.put(key, res.clone()); }
  catch (e) { console.warn('edge cache put failed:', e.message); }
  return res;
}