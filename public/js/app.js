/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 事件绑定 + 启动（仅地图首页加载） ---------------- */
/* ---------------- 事件绑定 ---------------- */
function bindUI() {
  // 搜索防抖：逐字符输入会瞬间触发「全量筛选 + 列表 DOM 重建 + 地图标记重算」，
  // 停顿 200ms 才真正执行一次，快速输入时不再逐字卡顿。
  // q 仍即时写入 state，确保防抖窗口内切换城市/状态时联动用的是最新关键词。
  const searchApply = debounce(() => applyFilters(), 200);
  document.getElementById('search').addEventListener('input', (e) => {
    state.filters.q = e.target.value;
    searchApply();
  });
  document.getElementById('city-select').addEventListener('change', (e) => {
    state.filters.city = e.target.value; applyFilters(); frameToCity();
  });
  const cs = document.getElementById('country-select');
  if (cs) cs.addEventListener('change', (e) => {
    state.filters.country = e.target.value; applyFilters(); frameToCity();
  });
  document.getElementById('close-list').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('open');
  });
  document.querySelectorAll('#status-tabs .tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('#status-tabs .tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      state.filters.status = t.dataset.status; applyFilters();
    });
  });
  document.getElementById('toggle-list').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });}

/* ---------------- 启动 ---------------- */
(async function main() {
  bindUI();
  // 筛选状态进 URL：先从地址栏恢复（须早于 loadEvents，城市/国家下拉依赖它回填），再补齐控件
  readFiltersFromUrl();
  restoreFilterUI();
  await loadConfig();
  await loadMe();
  await loadEvents();
  // 个人主页里的活动卡片跳转回来时，自动打开对应活动详情
  const deepEvent = new URLSearchParams(location.search).get('event');
  if (deepEvent) {
    const ev = state.events.find((e) => String(e.id) === String(deepEvent));
    if (ev) openDetail(ev);
  }
  const ok = await loadAmap();
  if (ok) {
    const wait = setInterval(() => {
      if (window.AMap && document.getElementById('map')) {
        clearInterval(wait); initMap();
      }
    }, 80);
  }
  // PWA：注册 Service Worker（离线可用 app shell；/api/ 数据不走缓存，保证新鲜）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();
