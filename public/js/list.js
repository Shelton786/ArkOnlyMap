/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 数据 + 侧边列表 + 筛选 ---------------- */
/* ---------------- 数据 ---------------- */
async function loadEvents(opts = {}) {
  try {
    // 写操作（提交/编辑/删除/审核/认领）后传 { fresh: true }：加时间戳参数绕过 CDN 边缘缓存，
    // 保证操作者本人立刻看到结果；普通加载走缓存（s-maxage=60），其他访客最多延迟 60 秒。
    const url = '/api/events?limit=1000' + (opts.fresh ? '&_=' + Date.now() : '');
    const r = await api(url);
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
/* ---------------- 筛选状态 ↔ URL 同步 ---------------- */
// 筛选条件（q / city / status / country）写入 URL query：
// ① 分享链接时对方打开即带同样筛选；② 刷新页面不丢筛选。
// 用 replaceState 不堆浏览器历史；只改这四个键，其余参数（如 ?event= 详情深链）原样保留。
const FILTER_KEYS = ['q', 'city', 'status', 'country'];
function syncFiltersToUrl() {
  const params = new URLSearchParams(location.search);
  for (const k of FILTER_KEYS) {
    const v = (state.filters[k] || '').trim();
    if (v) params.set(k, v); else params.delete(k);
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
}
// 从 URL 恢复筛选条件。须在 loadEvents() 之前调用：renderCities/renderCountries
// 会用 state.filters.city/country 把下拉摆回正确选项（sel.value = cur）。
function readFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  for (const k of FILTER_KEYS) state.filters[k] = params.get(k) || '';
}
// URL 恢复后补齐其余控件状态：搜索框回填、状态下划线到对应 tab
// （城市/国家下拉由 renderCities/renderCountries 负责）。
function restoreFilterUI() {
  const s = document.getElementById('search');
  if (s) s.value = state.filters.q;
  document.querySelectorAll('#status-tabs .tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.status === state.filters.status);
  });
}
// 列表与地图标记共用同一套筛选：筛选时同步隐藏标记，避免堆叠看不清
function applyFilters() {
  const list = sortEvents(visibleEvents());
  renderList(list);
  document.getElementById('count').textContent = `${list.length} 个活动`;
  renderMarkers(list);
  syncFiltersToUrl();
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
// 列表分批渲染：首批 LIST_PAGE_SIZE 条，滚动到底由哨兵自动追加下一批。
// 避免数百上千条活动一次性建 DOM 造成卡顿；行为与全量渲染一致（筛选/高亮仍整体重算）。
const LIST_PAGE_SIZE = 50;
let _listObserver = null;
let _listRendered = 0;

function makeEventCard(ev) {
  const art = document.createElement('article');
  const pendCls = ev.review_status === 'pending' ? ' is-pending' : '';
  art.className = 'event-card' + (ev.id === state.selectedId ? ' is-active' : '') + pendCls;
  art.tabIndex = 0;
  art.innerHTML = `
    <div class="ec-top">
      <h3 class="ec-title">${esc(ev.title)}</h3>
      <span class="badge badge--${ev.status} badge--solid">${STATUS_TEXT[ev.status] || '待定'}</span>
      ${ev.review_status === 'pending' ? `<span class="badge badge--pending">${ev.submission_type === 'supplement' ? '未确认·补充' : '未确认'}</span>` : ''}
    </div>
    <p class="ec-meta">
      📅 ${esc(fmtDate(ev))}<br/>
      📍 <span class="ec-city">${esc(ev.city || '城市待定')}</span>${isChina(ev.country) ? '' : (ev.country ? ' · ' + esc(ev.country) : '')}${ev.venue ? ' · ' + esc(ev.venue) : ''}
    </p>`;
  const go = () => { openDetail(ev); flyTo(ev); };
  art.addEventListener('click', go);
  art.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  return art;
}

function appendListBatch(ul, list, sentinel) {
  const next = list.slice(_listRendered, _listRendered + LIST_PAGE_SIZE);
  _listRendered += next.length;
  for (const ev of next) {
    const art = makeEventCard(ev);
    if (sentinel) ul.insertBefore(art, sentinel); else ul.appendChild(art);
  }
}

function renderList(list) {
  const ul = document.getElementById('event-list');
  const empty = document.getElementById('list-empty');
  ul.innerHTML = '';
  _listRendered = 0;
  if (_listObserver) { _listObserver.disconnect(); _listObserver = null; }
  if (!list.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  appendListBatch(ul, list, null);
  // 若当前选中项在首批之后（如从详情/地图标记联动），一次性补足到其所在批次，保证高亮卡片存在
  if (state.selectedId != null) {
    const idx = list.findIndex((e) => e.id === state.selectedId);
    while (idx >= _listRendered && _listRendered < list.length) appendListBatch(ul, list, null);
  }
  if (_listRendered < list.length) {
    const sentinel = document.createElement('div');
    sentinel.className = 'list-sentinel';
    ul.appendChild(sentinel);
    _listObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      appendListBatch(ul, list, sentinel);
      if (_listRendered >= list.length) { _listObserver.disconnect(); sentinel.remove(); }
    });
    _listObserver.observe(sentinel);
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
