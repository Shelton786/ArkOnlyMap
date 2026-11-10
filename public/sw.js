/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Service Worker：PWA 离线可用 + 静态资源加速。
 * 缓存策略（关键约束：活动数据必须新鲜，任何接口响应都不进缓存）：
 *   1. 非 GET 请求（提交活动/登录等）→ 直接放行，不拦截；
 *   2. /api/ 接口与 /_AMapService/ 高德代理 → network-only，离线时由页面 toast 提示；
 *   3. 页面导航（navigate）→ network-first，失败回落缓存的首页；
 *   4. 同源静态资源（js/css/图片）→ stale-while-revalidate，先读缓存再后台更新；
 *   5. 跨域资源（高德地图 SDK）→ 不缓存，直接走网络。
 *   注：字体已自托管（/fonts/），属同源静态资源，走第 4 条 SWR 缓存。
 */
'use strict';

// 版本号约定：每次修改 APP_SHELL 中的 js/css 都要 +1。
// 静态资源是 stale-while-revalidate，不 bump 的话老访客会先吃到旧缓存脚本，
// 要刷新两次才看到新逻辑；bump 后 activate 会清掉旧缓存并重新预缓存新文件。
const CACHE = 'arkonlymap-v5';
// App shell：预缓存保证离线首访即可打开（图标/字体等大文件不预缓存，按需 SWR）
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/css/style.css',
  '/css/fonts.css',
  '/js/csrf.js',
  '/js/core.js',
  '/js/modal.js',
  '/js/auth-ui.js',
  '/js/map.js',
  '/js/list.js',
  '/js/detail.js',
  '/js/form.js',
  '/js/admin-ui.js',
  '/js/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // 逐个 add：单个资源失败不拖垮整个 install（SW 注册失败会失去离线能力）
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // 写操作一律不拦截

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 跨域不缓存（字体 CDN / 高德 SDK）

  // 活动数据与高德安全密钥代理 network-only，保证新鲜且不进缓存
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_AMapService/')) return;

  if (req.mode === 'navigate') {
    // 页面导航：network-first（HTML 常变），断网回落缓存首页
    event.respondWith(
      fetch(req).catch(() => caches.match('/').then((r) => r || Response.error()))
    );
    return;
  }

  // 同源静态资源：stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
