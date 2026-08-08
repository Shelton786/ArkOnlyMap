/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 事件绑定 + 启动（仅地图首页加载） ---------------- */
/* ---------------- 事件绑定 ---------------- */
function bindUI() {
  document.getElementById('search').addEventListener('input', (e) => {
    state.filters.q = e.target.value; applyFilters();
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
})();
