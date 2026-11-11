/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
    // 安全密钥代理模式（高德官方推荐）：前端只指向本站代理，
    // jscode 由 functions/_AMapService 在服务端附加，安全密钥绝不下发浏览器。
    window._AMapSecurityConfig = { serviceHost: `${location.origin}/_AMapService` };
    const s = document.createElement('script');
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${state.config.amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Geocoder,AMap.AutoComplete`;
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
// 标记层级：进行中 > 即将举办 > 已结束 / 未知；点选的活动永远置顶。
// 高德在 zIndex 相同时按添加顺序叠放，同城/同场馆的活动坐标常常重合，
// 若级别相同，后绘制的蓝点（即将举办）就会盖住黄点（进行中），故状态间必须错开数值。
const MARKER_Z = { upcoming: 300, ongoing: 350, past: 100, unknown: 100 };
const SELECTED_Z = 400;
function markerZ(ev) {
  return ev.id === state.selectedId ? SELECTED_Z : (MARKER_Z[ev.status] || 100);
}
function addMarker(ev) {
  if (ev.longitude == null || ev.latitude == null) return;
  const marker = new AMap.Marker({
    position: [ev.longitude, ev.latitude],
    content: markerHtml(ev), anchor: 'center',
    zIndex: markerZ(ev),
  });
  // 增量更新需要知道「这个标记当前渲染的是哪份数据」，否则筛选/刷新后
  // 点击回调会拿着旧对象打开详情（审核状态、字段都可能已变）。
  marker._akEv = ev;
  marker._akMeta = {
    z: markerZ(ev),
    status: ev.status,
    pending: ev.review_status === 'pending',
    lng: ev.longitude,
    lat: ev.latitude,
  };
  marker.on('click', () => { openDetail(marker._akEv || ev); });
  marker.setMap(state.map);
  state.markers.set(ev.id, marker);
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
    if (g) { ev.longitude = g.longitude; ev.latitude = g.latitude; ev._geoDone = true; addMarker(ev); await saveCoords(ev); done++; }
    else ev._geoDone = true;
  }
  renderMarkers(visibleEvents());
  if (btn) { btn.disabled = false; btn.textContent = '📍 补全坐标'; }
  toast(`已补全 ${done} 个坐标`);
}
function renderMarkers(list) {
  if (!state.map) return;
  const items = (list && list.length !== undefined) ? list : state.events;
  const wanted = new Map();
  for (const ev of items) {
    if (ev.longitude != null && ev.latitude != null) wanted.set(ev.id, ev);
  }
  // 先移除被筛掉的标记，其余全部复用，不再整批销毁重建（搜索防抖后每次输入、
  // 切换城市/状态、打开详情都会走到这里，全量重建数百个 DOM 是主要卡顿来源）。
  for (const [id, marker] of state.markers) {
    if (!wanted.has(id)) { marker.setMap(null); state.markers.delete(id); }
  }
  const fresh = [];
  for (const [id, ev] of wanted) {
    const marker = state.markers.get(id);
    if (!marker) { fresh.push(ev); continue; }
    marker._akEv = ev;
    const meta = marker._akMeta || (marker._akMeta = {});
    const z = markerZ(ev);
    if (meta.z !== z) {
      if (typeof marker.setzIndex === 'function') { marker.setzIndex(z); meta.z = z; }
      else { marker.setMap(null); state.markers.delete(id); fresh.push(ev); }
      if (!state.markers.has(id)) continue;
    }
    const pending = ev.review_status === 'pending';
    if (meta.status !== ev.status || meta.pending !== pending) {
      if (typeof marker.setContent === 'function') {
        marker.setContent(markerHtml(ev));
        meta.status = ev.status; meta.pending = pending;
      } else { marker.setMap(null); state.markers.delete(id); fresh.push(ev); }
      if (!state.markers.has(id)) continue;
    }
    if (meta.lng !== ev.longitude || meta.lat !== ev.latitude) {
      if (typeof marker.setPosition === 'function') {
        marker.setPosition([ev.longitude, ev.latitude]);
        meta.lng = ev.longitude; meta.lat = ev.latitude;
      } else { marker.setMap(null); state.markers.delete(id); fresh.push(ev); }
    }
  }
  // 本次新增的仍按层级由低到高添加：同 zIndex 时后绘制者在上层，
  // 保证进行中(黄) 压住 即将举办(蓝)，点选的活动压住所有标记。
  fresh.sort((a, b) => markerZ(a) - markerZ(b));
  for (const ev of fresh) addMarker(ev);
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
        addMarker(ev);
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
function frameToCity() {
  if (!state.map) return;
  const ms = [...state.markers.values()];
  if (state.filters.city && ms.length) {
    state.map.setFitView(ms, false, [50, 50, 50, 50]);
  } else if (!state.filters.city) {
    state.map.setZoomAndCenter(DEFAULT_ZOOM, DEFAULT_CENTER);
  }
}
