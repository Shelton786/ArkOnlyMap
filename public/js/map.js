/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 配置 + 地图加载 + 标记 ---------------- */
/* ---------------- 配置 + 地图加载 ---------------- */
async function loadConfig() {
  try {
    const r = await api('/api/config');
    state.config = await r.json();
  } catch (e) { /* 用默认 */ }
  document.title = state.config.title;
}
function loadAmap() {
  return new Promise((resolve) => {
    if (!state.config.amapKey) {
      document.getElementById('map').innerHTML =
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#6e82a3;font-size:14px;text-align:center;padding:30px;">地图需在服务端配置高德 Key 后显示<br/>列表与提交功能不受影响</div>';
      resolve(false); return;
    }
    window._AMapSecurityConfig = { securityJsCode: state.config.amapSecurityCode };
    const s = document.createElement('script');
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${state.config.amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Geocoder,AMap.AutoComplete,AMap.MarkerCluster`;
    s.onload = () => resolve(true);
    s.onerror = () => { resolve(false); };
    document.head.appendChild(s);
  });
}
function initMap() {
  const map = new AMap.Map('map', {
    zoom: DEFAULT_ZOOM, center: DEFAULT_CENTER, mapStyle: 'amap://styles/normal',
    viewMode: '2D',
    resizeEnable: true, /* 启用 AMap 自适应容器尺寸变化 */
  });
  map.addControl(new AMap.Scale());
  map.addControl(new AMap.ToolBar({ position: 'RB' }));
  state.map = map;
  renderMarkers();

  // 缩放/旋屏时强制地图重新适配容器（修复移动端缩放后布局崩坏）
  let _resizeTimer;
  const scheduleResize = () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      if (state.map && !state.map._destroyed) {
        state.map.setSize();
        state.map.setFitView(false);
      }
    }, 200);
  };
  window.addEventListener('resize', scheduleResize);
  window.addEventListener('orientationchange', () => { setTimeout(scheduleResize, 300); });

  // 视觉视口变化时也触发（移动端双指缩放/地址栏显隐）
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleResize);
  }
}

/* ---------------- 地图标记 ---------------- */
function markerHtml(ev) {
  const pend = ev.review_status === 'pending' ? ' is-pending' : '';
  return `<div class="ak-marker is-${ev.status}${pend}">
      ${ev.status === 'upcoming' ? '<span class="pulse"></span>' : ''}
      <span class="pin"></span>
    </div>`;
}
const MARKER_Z = { upcoming: 300, ongoing: 300, past: 100, unknown: 100 };
// 构建单个标记（仅用于聚合插件不可用时的降级直挂）
function buildMarker(ev) {
  const marker = new AMap.Marker({
    position: [ev.longitude, ev.latitude],
    content: markerHtml(ev), anchor: 'center',
    zIndex: ev.id === state.selectedId ? 400 : (MARKER_Z[ev.status] || 100),
  });
  marker.on('click', () => { openDetail(ev); });
  state.markers.set(ev.id, marker);
  return marker;
}
// 聚合点样式：主题色圆点 + 数量
function renderClusterMarker(ctx) {
  const div = document.createElement('div');
  div.className = 'ak-cluster';
  div.innerHTML = `<span>${ctx.count}</span>`;
  ctx.marker.setContent(div);
  ctx.marker.setAnchor('center');
  ctx.marker.setzIndex(350);
}
// 非聚合单点样式：复用原活动标记外观与点击行为。
// ctx.data[0] 是构造时传入的数据点（含我们塞进去的 id），由此找回活动对象。
function renderSingleMarker(ctx) {
  const id = ctx.data && ctx.data[0] && ctx.data[0].id;
  const ev = state.events.find((e) => e.id === id);
  if (!ev) return;
  ctx.marker.setContent(markerHtml(ev));
  ctx.marker.setAnchor('center');
  ctx.marker.setzIndex(ev.id === state.selectedId ? 400 : (MARKER_Z[ev.status] || 100));
  ctx.marker.on('click', () => { openDetail(ev); });
}
function evToPoint(ev) {
  return { lnglat: [ev.longitude, ev.latitude], id: ev.id };
}
// 浏览器端地理编码（使用 JS API Key，类型匹配）
// ⚠️ 高德 getLocation 回调在某些情况下（安全密钥不匹配、限流、网络）可能永远不返回，
// 会导致「正在定位活动坐标…」遮罩永久转圈。故加超时保护：到点一律当作解析失败。
function geocodeClient(ev) {
  return new Promise((resolve) => {
    if (!window.AMap || !AMap.Geocoder) { resolve(null); return; }
    if (!state.geocoder) state.geocoder = new AMap.Geocoder({ city: '全国' });
    const addr = [ev.address, ev.city].filter(Boolean).join(' ');
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    const timer = setTimeout(() => done(null), 6000); // 兜底超时：绝不永久挂起
    try {
      state.geocoder.getLocation(addr, (status, result) => {
        clearTimeout(timer);
        if (status === 'complete' && result.geocodes && result.geocodes.length) {
          const loc = result.geocodes[0].location;
          let lng, lat;
          if (typeof loc === 'string') [lng, lat] = loc.split(',').map(Number);
          else { lng = loc.lng != null ? loc.lng : loc.getLng(); lat = loc.lat != null ? loc.lat : loc.getLat(); }
          if (!isNaN(lng) && !isNaN(lat)) { done({ longitude: lng, latitude: lat }); return; }
        }
        done(null);
      });
    } catch (e) { clearTimeout(timer); done(null); }
  });
}
async function saveCoords(ev) {
  try {
    await api(`/api/events/${ev.id}/coords`, { method: 'POST', body: JSON.stringify({ longitude: ev.longitude, latitude: ev.latitude }) });
  } catch (e) { /* 忽略 */ }
}
// 管理员：一键补全所有缺坐标活动（浏览器端解析并落库）
async function geocodeAll() {
  const missing = state.events.filter((e) => (e.longitude == null || e.latitude == null) && e.address && !e._geoDone);
  if (!missing.length) { toast('没有需要解析的坐标'); return; }
  const btn = document.getElementById('btn-geocode');
  if (btn) { btn.disabled = true; btn.textContent = '解析中…'; }
  let done = 0;
  for (const ev of missing) {
    const g = await geocodeClient(ev);
    if (g) { ev.longitude = g.longitude; ev.latitude = g.latitude; ev._geoDone = true; await saveCoords(ev); done++; }
    else ev._geoDone = true;
  }
  renderMarkers(visibleEvents());
  if (btn) { btn.disabled = false; btn.textContent = '📍 补全坐标'; }
  toast(`已补全 ${done} 个坐标`);
}
function renderMarkers(list) {
  if (!state.map) return;
  const items = (list && list.length !== undefined) ? list : state.events;
  if (state.cluster) { state.cluster.setMap(null); state.cluster = null; }
  for (const m of state.markers.values()) m.setMap(null);
  state.markers.clear();
  const located = items.filter((ev) => ev.longitude != null && ev.latitude != null);
  // 点聚合（JS API 2.0 的 MarkerCluster 接收 {lnglat,...} 数据点而非 Marker 实例）：
  // 同城密集活动在小缩放级别合并为数字圆点，放大自动展开；
  // 插件不可用时（如加载失败）退化为逐个点直挂地图
  if (window.AMap && AMap.MarkerCluster) {
    state.cluster = new AMap.MarkerCluster(state.map, located.map(evToPoint), {
      gridSize: 60,
      renderClusterMarker,
      renderMarker: renderSingleMarker,
    });
  } else {
    for (const ev of located) buildMarker(ev).setMap(state.map);
  }
  // 缺坐标的活动：在浏览器端顺序地理编码（带间隔，避免限流），登录用户自动回写
  geocodeMissingOnLoad(items);
}
async function geocodeMissingOnLoad(items) {
  if (state._geoRunning) return;
  // 地理编码未启用（服务端无 Key）或高德不可用：直接跳过，不显示「定位中」遮罩
  if (!state.config.geocodeEnabled) return;
  if (!window.AMap || !AMap.Geocoder) return;
  const list = (items && items.length !== undefined) ? items : state.events;
  const missing = list.filter(
    (e) => (e.longitude == null || e.latitude == null) && e.address && !e._geoStarted
  );
  if (!missing.length) return;
  state._geoRunning = true;
  const overlay = document.getElementById('map-loading');
  const txt = document.getElementById('map-loading-text');
  if (overlay) overlay.classList.remove('hidden');
  let done = 0, resolved = 0;
  try {
    for (const ev of missing) {
      ev._geoStarted = true;
      const g = await geocodeClient(ev);
      if (g) {
        ev.longitude = g.longitude; ev.latitude = g.latitude; ev._geoDone = true;
        if (state.user) await saveCoords(ev);
        resolved++;
      }
      done++;
      if (txt) txt.textContent = `正在定位活动坐标… (${done}/${missing.length})`;
      await new Promise((r) => setTimeout(r, 120));
    }
  } finally {
    if (overlay) overlay.classList.add('hidden');
    state._geoRunning = false;
  }
  renderMarkers(list);
  if (resolved) toast(`已自动定位 ${resolved} 个活动坐标`);
}
function flyTo(ev) {
  if (!state.map || ev.longitude == null) return;
  state.map.setZoomAndCenter(14, [ev.longitude, ev.latitude]);
}
// 城市筛选切换后，自动框选到该城市的标记；取消城市则回到默认长三角视图
// 聚合模式下标记由插件托管，这里直接由活动坐标计算视野范围
function frameToCity() {
  if (!state.map) return;
  const list = visibleEvents().filter((e) => e.longitude != null && e.latitude != null);
  if (state.filters.city && list.length) {
    if (list.length === 1) { flyTo(list[0]); return; }
    let swLng = Infinity, swLat = Infinity, neLng = -Infinity, neLat = -Infinity;
    for (const e of list) {
      swLng = Math.min(swLng, e.longitude); swLat = Math.min(swLat, e.latitude);
      neLng = Math.max(neLng, e.longitude); neLat = Math.max(neLat, e.latitude);
    }
    state.map.setBounds(new AMap.Bounds([swLng, swLat], [neLng, neLat]), false, [50, 50, 50, 50]);
  } else if (!state.filters.city) {
    state.map.setZoomAndCenter(DEFAULT_ZOOM, DEFAULT_CENTER);
  }
}
