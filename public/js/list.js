/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 数据 + 侧边列表 + 筛选 ---------------- */
/* ---------------- 数据 ---------------- */
async function loadEvents() {
  try {
    const r = await api('/api/events?limit=1000');
    const data = await r.json();
    // 集会状态由「浏览器当天日期」+ 举办日期实时推算，避免依赖服务端缓存
    state.events = (data.items || []).map((e) => { e.status = eventStatus(e); return e; });
    renderCities();
    applyFilters();
    renderMarkers();
  } catch (e) { toast('加载活动失败'); }
}

async function loadCities() {
  try {
    const r = await api('/api/events/cities');
    return await r.json();
  } catch { return []; }
}

/* ---------------- 列表 ---------------- */
function visibleEvents() {
  const { q, city, status, country } = state.filters;
  const ql = q.trim().toLowerCase();
  return state.events.filter((ev) => {
    if (country && (ev.country || '中国') !== country) return false;
    if (city && ev.city !== city) return false;
    if (status && ev.status !== status) return false;
    if (ql) {
      const hay = `${ev.title} ${ev.city || ''} ${ev.venue || ''} ${ev.organizer || ''}`.toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    return true;
  });
}
// 列表与地图标记共用同一套筛选：筛选时同步隐藏标记，避免堆叠看不清
function applyFilters() {
  const list = sortEvents(visibleEvents());
  renderList(list);
  document.getElementById('count').textContent = `${list.length} 个活动`;
  renderMarkers(list);
}
// 列表排序：按状态分组（进行中/即将举办在上，已举办在下）；
// 组内「即将举办/进行中」按开始日期升序（最近的在前），「已举办」按开始日期降序（最新的在前）。
function sortEvents(list) {
  const val = (s) => {
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
    return m ? +new Date(+m[1], +m[2] - 1, +m[3]) : Infinity; // 无日期排最后
  };
  const rank = { ongoing: 0, upcoming: 1, past: 2, unknown: 3 };
  return list.slice().sort((a, b) => {
    const ra = rank[a.status] ?? 3, rb = rank[b.status] ?? 3;
    if (ra !== rb) return ra - rb;
    const va = val(a.start_date), vb = val(b.start_date);
    return a.status === 'past' ? vb - va : va - vb;
  });
}
function renderList(list) {
  const ul = document.getElementById('event-list');
  const empty = document.getElementById('list-empty');
  ul.innerHTML = '';
  if (!list.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  for (const ev of list) {
    const art = document.createElement('article');
    const pendCls = ev.review_status === 'pending' ? ' is-pending' : '';
    art.className = 'event-card' + (ev.id === state.selectedId ? ' is-active' : '') + pendCls;
    art.tabIndex = 0;
    art.innerHTML = `
      <div class="ec-top">
        <h3 class="ec-title">${esc(ev.title)}</h3>
        <span class="badge badge--${ev.status}">${STATUS_TEXT[ev.status] || '待定'}</span>
        ${ev.review_status === 'pending' ? `<span class="badge badge--pending">${ev.submission_type === 'supplement' ? '未确认·补充' : '未确认'}</span>` : ''}
      </div>
      <p class="ec-meta">
        📅 ${esc(fmtDate(ev))}<br/>
        📍 <span class="ec-city">${esc(ev.city || '城市待定')}</span>${isChina(ev.country) ? '' : (ev.country ? ' · ' + esc(ev.country) : '')}${ev.venue ? ' · ' + esc(ev.venue) : ''}
      </p>`;
    const go = () => { openDetail(ev); flyTo(ev); };
    art.addEventListener('click', go);
    art.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    ul.appendChild(art);
  }
}
async function renderCities() {
  const cities = await loadCities();
  const sel = document.getElementById('city-select');
  const cur = state.filters.city;
  sel.innerHTML = '<option value="">全部城市</option>' +
    cities.map((c) => `<option value="${esc(c.city)}">${esc(c.city)} (${c.n})</option>`).join('');
  sel.value = cur;
  renderCountries();
}

// 国家 / 地区筛选（海外展会可发现性）
function renderCountries() {
  const sel = document.getElementById('country-select');
  if (!sel) return;
  const set = new Set();
  state.events.forEach((ev) => { if (ev.country && ev.country !== '中国') set.add(ev.country); });
  const cur = state.filters.country || '';
  sel.innerHTML = '<option value="">全部国家 / 地区</option>' +
    (set.size ? '<option value="中国">中国</option>' : '') +
    [...set].sort().map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  sel.value = cur;
}
