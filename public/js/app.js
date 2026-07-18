'use strict';
/* 舟友同好集会地图 —— 前端逻辑 */

const state = {
  config: { title: '舟友同好集会地图', amapKey: '', amapSecurityCode: '', geocodeEnabled: false },
  map: null,
  markers: new Map(),
  events: [],
  user: null,
  filters: { q: '', city: '', status: '' },
  selectedId: null,
  pickMode: false,
  pickMarker: null,
};

const STATUS_TEXT = { upcoming: '即将举办', ongoing: '进行中', past: '已结束', unknown: '待定' };

// 默认地图视图：长三角（南京—上海之间），解决“一进来太大看不清”的问题
const DEFAULT_CENTER = [119.6, 31.6];
const DEFAULT_ZOOM = 7;

/* ---------------- 工具 ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function api(path, opts = {}) {
  return fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}
function fmtDate(ev) {
  if (ev.start_date && ev.end_date && ev.start_date !== ev.end_date)
    return `${ev.start_date} ~ ${ev.end_date}`;
  return ev.start_date || ev.end_date || '日期待定';
}
function safeUrl(u) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : '';
}
// 解析举办日期：支持 2026-07-26 / 2026/7/17 / 2026/7/17-2026/7/18 / 2026-07-26 ~ 2026-07-27
function parseDateRange(raw) {
  if (!raw) return { start: null, end: null };
  const s = String(raw).replace(/\n/g, ' ').trim();
  const found = [];
  const re = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})|(\d{1,2})[/-](\d{1,2})/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
        found.push(`${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    } else {
      const mo = +m[4], d = +m[5];
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
        found.push(`${new Date().getFullYear()}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  if (!found.length) return { start: null, end: null };
  if (found.length === 1) return { start: found[0], end: found[0] };
  return { start: found[0], end: found[found.length - 1] };
}

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
  });
  map.addControl(new AMap.Scale());
  map.addControl(new AMap.ToolBar({ position: 'RB' }));
  map.on('click', (e) => {
    if (state.pickMode) {
      setPicked(e.lnglat.getLng(), e.lnglat.getLat());
    }
  });
  state.map = map;
  renderMarkers();
}

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

// 举办日期 -> Date（按本地零点解析，避免时区偏移）
function parseDateOnly(s) {
  const m = /(\d{4})-(\d{2})-(\d{2})/.exec(String(s == null ? '' : s));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
// 根据当前日期判断集会状态：past=已举办 / upcoming=即将举办 / ongoing=进行中
function eventStatus(ev) {
  if (!ev.start_date) return 'unknown';
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d1 = parseDateOnly(ev.start_date);
  const d2 = parseDateOnly(ev.end_date || ev.start_date);
  if (!d1) return 'unknown';
  if (d2 && d2 < t) return 'past';
  if (d1 > t) return 'upcoming';
  return 'ongoing';
}
async function loadCities() {
  try {
    const r = await api('/api/events/cities');
    return await r.json();
  } catch { return []; }
}

/* ---------------- 列表 ---------------- */
function visibleEvents() {
  const { q, city, status } = state.filters;
  const ql = q.trim().toLowerCase();
  return state.events.filter((ev) => {
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
    const li = document.createElement('li');
    li.className = 'event-card' + (ev.id === state.selectedId ? ' is-active' : '');
    li.innerHTML = `
      <div class="ec-top">
        <span class="ec-title">${esc(ev.title)}</span>
        <span class="badge badge--${ev.status}">${STATUS_TEXT[ev.status] || '待定'}</span>
      </div>
      <div class="ec-meta">
        📅 ${esc(fmtDate(ev))}<br/>
        📍 <span class="ec-city">${esc(ev.city || '城市待定')}</span>${ev.venue ? ' · ' + esc(ev.venue) : ''}
      </div>`;
    li.onclick = () => { openDetail(ev); flyTo(ev); };
    ul.appendChild(li);
  }
}
async function renderCities() {
  const cities = await loadCities();
  const sel = document.getElementById('city-select');
  const cur = state.filters.city;
  sel.innerHTML = '<option value="">全部城市</option>' +
    cities.map((c) => `<option value="${esc(c.city)}">${esc(c.city)} (${c.n})</option>`).join('');
  sel.value = cur;
}

/* ---------------- 地图标记 ---------------- */
function markerHtml(ev) {
  return `<div class="ak-marker is-${ev.status}">
      ${ev.status === 'upcoming' ? '<span class="pulse"></span>' : ''}
      <span class="pin"></span>
    </div>`;
}
const MARKER_Z = { upcoming: 300, ongoing: 300, past: 100, unknown: 100 };
function addMarker(ev) {
  if (ev.longitude == null || ev.latitude == null) return;
  const marker = new AMap.Marker({
    position: [ev.longitude, ev.latitude],
    content: markerHtml(ev), anchor: 'center',
    zIndex: ev.id === state.selectedId ? 400 : (MARKER_Z[ev.status] || 100),
  });
  marker.on('click', () => { openDetail(ev); });
  marker.setMap(state.map);
  state.markers.set(ev.id, marker);
}
// 浏览器端地理编码（使用 JS API Key，类型匹配）
function geocodeClient(ev) {
  return new Promise((resolve) => {
    if (!state.geocoder) state.geocoder = new AMap.Geocoder({ city: '全国' });
    const addr = [ev.address, ev.city].filter(Boolean).join(' ');
    state.geocoder.getLocation(addr, (status, result) => {
      if (status === 'complete' && result.geocodes && result.geocodes.length) {
        const loc = result.geocodes[0].location;
        let lng, lat;
        if (typeof loc === 'string') [lng, lat] = loc.split(',').map(Number);
        else { lng = loc.lng != null ? loc.lng : loc.getLng(); lat = loc.lat != null ? loc.lat : loc.getLat(); }
        if (!isNaN(lng) && !isNaN(lat)) { resolve({ longitude: lng, latitude: lat }); return; }
      }
      resolve(null);
    });
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
  for (const m of state.markers.values()) m.setMap(null);
  state.markers.clear();
  for (const ev of items) {
    if (ev.longitude != null && ev.latitude != null) addMarker(ev);
  }
  // 缺坐标的活动：在浏览器端顺序地理编码（带间隔，避免限流），登录用户自动回写
  geocodeMissingOnLoad(items);
}
async function geocodeMissingOnLoad(items) {
  if (state._geoRunning) return;
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

/* ---------------- 详情 ---------------- */
function openDetail(ev) {
  state.selectedId = ev.id;
  applyFilters(); // 同步刷新列表激活态与标记层级
  const p = ev.poster_url ? `<img class="detail-poster" src="${esc(safeUrl(ev.poster_url))}" onerror="this.style.display='none'"/>` : '';
  const link = safeUrl(ev.source_url) ? `<a class="detail-link" href="${esc(ev.source_url)}" target="_blank" rel="noopener">查看官方信息 ↗</a>` : '';
  const tags = Array.isArray(ev.tags) ? ev.tags : [];
  const panel = document.getElementById('detail-panel');
  panel.innerHTML = `
    <button class="detail-close" onclick="closeDetail()">×</button>
    ${p}
    <div class="detail-body">
      <div class="detail-title">${esc(ev.title)}</div>
      <div class="detail-sub">${STATUS_TEXT[ev.status] || '待定'} · ${esc(fmtDate(ev))}</div>
      <div class="detail-rows">
        ${ev.city ? row('城市', ev.city + (ev.province ? ' / ' + ev.province : '')) : ''}
        ${ev.venue ? row('场馆', ev.venue) : ''}
        ${ev.address ? row('地址', ev.address) : ''}
        ${ev.organizer ? row('主办', ev.organizer) : ''}
        ${tags.length ? row('标签', tags.join('、')) : ''}
        ${ev.submitted_by_name ? row('提交者', ev.submitted_by_name) : ''}
        ${ev.verified ? row('核实', '✓ 已核实') : ''}
      </div>
      ${ev.description ? `<div class="detail-desc">${esc(ev.description)}</div>` : ''}
      <div class="detail-actions">
        ${link}
        ${canEdit(ev) ? `<button class="ak-btn ak-btn--sm" onclick="openEdit(${ev.id})">编辑</button>` : ''}
        ${canEdit(ev) ? `<button class="ak-btn ak-btn--sm ak-btn--danger" onclick="deleteEvent(${ev.id})">删除</button>` : ''}
      </div>
    </div>`;
  panel.classList.remove('hidden');
}
function row(k, v) { return `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`; }
function closeDetail() {
  state.selectedId = null;
  document.getElementById('detail-panel').classList.add('hidden');
  applyFilters();
}
function canEdit(ev) {
  return state.user && (state.user.role === 'admin' || ev.submitted_by === state.user.id);
}

/* ---------------- 账户 ---------------- */
async function loadMe() {
  try {
    const r = await api('/api/auth/me');
    const d = await r.json();
    state.user = d.user;
  } catch { state.user = null; }
  renderAuth();
}
function renderAuth() {
  const area = document.getElementById('auth-area');
  const submitBtn = document.getElementById('btn-submit');
  if (state.user) {
    const u = state.user;
    area.innerHTML = `
      <div class="user-chip">
        <span class="avatar">${esc(u.username.slice(0, 1))}</span>
        <span>${esc(u.username)}</span>
        ${u.role === 'admin' ? '<span class="role-admin">管理员</span>' : ''}
      </div>
      <button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-logout">退出</button>`;
    document.getElementById('btn-logout').onclick = logout;
    submitBtn.style.display = '';
    submitBtn.onclick = () => openSubmit();
  } else {
    area.innerHTML = `
      <button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-login">登录</button>
      <button class="ak-btn ak-btn--primary ak-btn--sm" id="btn-register">注册</button>`;
    document.getElementById('btn-login').onclick = () => openAuth('login');
    document.getElementById('btn-register').onclick = () => openAuth('register');
    submitBtn.style.display = 'none';
  }
  const gb = document.getElementById('btn-geocode');
  if (gb) {
    if (state.user && state.user.role === 'admin') { gb.classList.remove('hidden'); gb.onclick = geocodeAll; }
    else gb.classList.add('hidden');
  }
}
async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null; renderAuth(); toast('已退出');
}

/* ---------------- 弹窗框架 ---------------- */
function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-mask" onclick="if(event.target===this)closeModal()">
    <div class="modal">${html}</div></div>`;
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

function openAuth(mode) {
  const isLogin = mode === 'login';
  openModal(`
    <div class="modal-title">${isLogin ? '博士登录' : '加入集会'}</div>
    <div class="modal-sub">${isLogin ? '登录以标记与提交漫展' : '注册一个身份，用于确认你的提交'}</div>
    <div class="field"><label>昵称</label><input id="au-name" placeholder="2-20 个字符" /></div>
    <div class="field"><label>密码</label><input id="au-pass" type="password" placeholder="至少 6 位" /></div>
    <div class="modal-error" id="au-error"></div>
    <div class="modal-actions">
      <button class="ak-btn ak-btn--primary" id="au-submit">${isLogin ? '登录' : '注册'}</button>
      <button class="ak-btn ak-btn--ghost" onclick="closeModal()">取消</button>
    </div>
    <div class="modal-switch">${isLogin ? '还没有身份？' : '已有身份？'}
      <a onclick="openAuth('${isLogin ? 'register' : 'login'}')">${isLogin ? '立即注册' : '去登录'}</a>
    </div>`);
  document.getElementById('au-submit').onclick = () => submitAuth(isLogin);
  document.getElementById('au-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(isLogin); });
}
async function submitAuth(isLogin) {
  const username = document.getElementById('au-name').value.trim();
  const password = document.getElementById('au-pass').value;
  const err = document.getElementById('au-error');
  const r = await api(isLogin ? '/api/auth/login' : '/api/auth/register', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || '操作失败'; return; }
  state.user = d.user; renderAuth(); closeModal();
  toast(isLogin ? '欢迎回来，博士' : '注册成功');
  loadEvents();
}

/* ---------------- 提交 / 编辑 ---------------- */
function openSubmit() {
  if (!state.user) { openAuth('login'); return; }
  openForm(null);
}
function openEdit(id) {
  const ev = state.events.find((e) => e.id === id);
  if (!ev) return;
  openForm(ev);
}
window.openEdit = openEdit;

async function deleteEvent(id) {
  if (!confirm('确定删除该集会？此操作不可撤销。')) return;
  const r = await api(`/api/events/${id}`, { method: 'DELETE' });
  if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || '删除失败'); return; }
  toast('已删除');
  closeDetail();
  loadEvents();
}
window.deleteEvent = deleteEvent;

function openForm(ev) {
  const isEdit = !!ev;
  state.pickMode = false;
  if (state.pickMarker) { state.pickMarker.setMap(null); state.pickMarker = null; }
  const v = (k) => (ev && ev[k] != null ? ev[k] : '');
  const tagsVal = ev && Array.isArray(ev.tags) ? ev.tags.join('、') : '';
  let dateVal = '';
  if (ev) {
    if (ev.start_date && ev.end_date && ev.end_date !== ev.start_date) dateVal = `${ev.start_date} ~ ${ev.end_date}`;
    else dateVal = ev.start_date || ev.end_date || '';
  }
  openModal(`
    <div class="modal-title">${isEdit ? '编辑漫展' : '提交新漫展'}</div>
    <div class="modal-sub">${isEdit ? '修改你提交的活动信息' : '填写活动信息，提交后将在地图上出现'}</div>
    <div class="field"><label>活动名称 *</label><input id="f-title" value="${esc(v('title'))}" placeholder="如：罗德岛上海 ONLY" /></div>
    <div class="field"><label>举办日期</label><input id="f-date" type="text" value="${esc(dateVal)}" placeholder="如 2026-07-26 或 2026-07-26 ~ 2026-07-27" /></div>
    <div class="field-row">
      <div class="field"><label>省份</label><input id="f-province" value="${esc(v('province'))}" placeholder="如：上海" /></div>
      <div class="field"><label>城市 *</label><input id="f-city" value="${esc(v('city'))}" placeholder="如：上海" /></div>
    </div>
    <div class="field"><label>场馆</label><input id="f-venue" value="${esc(v('venue'))}" placeholder="如：某会展中心" /></div>
    <div class="field"><label>详细地址</label><input id="f-address" value="${esc(v('address'))}" placeholder="用于地图定位；留空也可稍后补" /></div>
    <div class="field-row">
      <div class="field"><label>主办</label><input id="f-organizer" value="${esc(v('organizer'))}" /></div>
      <div class="field"><label>来源链接</label><input id="f-source" value="${esc(v('source_url'))}" placeholder="https://" /></div>
    </div>
    <div class="field"><label>海报图片 URL</label><input id="f-poster" value="${esc(v('poster_url'))}" placeholder="https://..." /></div>
    <div class="field"><label>标签（用、分隔）</label><input id="f-tags" value="${esc(tagsVal)}" placeholder="如：官方、同人、仅限" /></div>
    <div class="field"><label>介绍</label><textarea id="f-desc" placeholder="活动简介、亮点、交通等">${esc(v('description'))}</textarea></div>
    <div class="field">
      <label>地图定位</label>
      <button class="ak-btn ak-btn--sm" id="f-pick" type="button">📍 在地图上选点</button>
      <div class="coord-pick" id="f-coord">${isEdit && ev.longitude != null ? `已选：${ev.longitude}, ${ev.latitude}` : '未选点（也可仅填地址由系统解析）'}</div>
    </div>
    <div class="modal-error" id="f-error"></div>
    <div class="modal-actions">
      <button class="ak-btn ak-btn--primary" id="f-submit">${isEdit ? '保存' : '提交'}</button>
      <button class="ak-btn ak-btn--ghost" onclick="closeModal()">取消</button>
    </div>`);

  const pickBtn = document.getElementById('f-pick');
  pickBtn.onclick = togglePick;

  document.getElementById('f-submit').onclick = () => submitForm(ev);
  wireAddressAutolocate();
}

function wireAddressAutolocate() {
  const addrEl = document.getElementById('f-address');
  const cityEl = document.getElementById('f-city');
  if (!addrEl) return;
  if (window.AMap && AMap.AutoComplete) {
    try {
      const ac = new AMap.AutoComplete({ input: 'f-address' });
      ac.on('select', (e) => {
        if (e && e.poi && e.poi.location) {
          const loc = e.poi.location;
          const lng = typeof loc === 'string' ? Number(loc.split(',')[0]) : (loc.lng != null ? loc.lng : loc.getLng());
          const lat = typeof loc === 'string' ? Number(loc.split(',')[1]) : (loc.lat != null ? loc.lat : loc.getLat());
          if (!isNaN(lng) && !isNaN(lat)) setPicked(lng, lat);
        }
      });
    } catch (_) { /* AutoComplete 不可用时忽略 */ }
  }
  let t;
  const preview = () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const addr = addrEl.value.trim();
      const city = cityEl ? cityEl.value.trim() : '';
      if (!addr) return;
      const g = await geocodeClient({ address: addr, city });
      if (g) setPicked(g.longitude, g.latitude);
    }, 600);
  };
  addrEl.addEventListener('input', preview);
  if (cityEl) cityEl.addEventListener('input', preview);
}

function togglePick() {
  state.pickMode = !state.pickMode;
  const hint = document.getElementById('map-hint');
  const btn = document.getElementById('f-pick');
  if (state.pickMode) {
    hint.classList.remove('hidden');
    btn.textContent = '✓ 选点中（点击地图）';
    if (!state.map) toast('地图未加载，请先在服务端配置高德 Key');
  } else {
    hint.classList.add('hidden');
    btn.textContent = '📍 在地图上选点';
  }
}
function setPicked(lng, lat) {
  state.pickMode = false;
  document.getElementById('map-hint').classList.add('hidden');
  const btn = document.getElementById('f-pick');
  if (btn) btn.textContent = '📍 重新选点';
  document.getElementById('f-coord').textContent = `已选：${lng.toFixed(5)}, ${lat.toFixed(5)}`;
  if (state.pickMarker) state.pickMarker.setMap(null);
  if (state.map) {
    state.pickMarker = new AMap.Marker({
      position: [lng, lat],
      content: '<div class="ak-marker is-upcoming"><span class="pin"></span></div>',
      anchor: 'center',
    });
    state.pickMarker.setMap(state.map);
    state.map.setZoomAndCenter(14, [lng, lat]);
  }
  state._picked = { longitude: lng, latitude: lat };
}

async function submitForm(ev) {
  const err = document.getElementById('f-error');
  const title = document.getElementById('f-title').value.trim();
  if (!title) { err.textContent = '请填写活动名称'; return; }
  const tags = document.getElementById('f-tags').value.split('、').map((s) => s.trim()).filter(Boolean);
  const dr = parseDateRange(document.getElementById('f-date').value.trim());
  const payload = {
    title,
    start_date: dr.start,
    end_date: dr.end !== dr.start ? dr.end : null,
    province: document.getElementById('f-province').value.trim() || null,
    city: document.getElementById('f-city').value.trim() || null,
    venue: document.getElementById('f-venue').value.trim() || null,
    address: document.getElementById('f-address').value.trim() || null,
    organizer: document.getElementById('f-organizer').value.trim() || null,
    source_url: document.getElementById('f-source').value.trim() || null,
    poster_url: document.getElementById('f-poster').value.trim() || null,
    description: document.getElementById('f-desc').value.trim() || null,
    tags,
  };
  if (state._picked) { payload.longitude = state._picked.longitude; payload.latitude = state._picked.latitude; }
  const isEdit = !!ev;
  const url = isEdit ? `/api/events/${ev.id}` : '/api/events';
  const r = await api(url, { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || '提交失败'; return; }
  closeModal();
  state._picked = null;
  if (state.pickMarker) { state.pickMarker.setMap(null); state.pickMarker = null; }
  toast(isEdit ? '已保存' : '提交成功，感谢贡献！');
  loadEvents();
}

/* ---------------- 事件绑定 ---------------- */
function bindUI() {
  document.getElementById('search').addEventListener('input', (e) => {
    state.filters.q = e.target.value; applyFilters();
  });
  document.getElementById('city-select').addEventListener('change', (e) => {
    state.filters.city = e.target.value; applyFilters(); frameToCity();
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
  });
  window.closeDetail = closeDetail;
  window.closeModal = closeModal;
}

/* ---------------- 启动 ---------------- */
(async function main() {
  bindUI();
  await loadConfig();
  await loadMe();
  await loadEvents();
  const ok = await loadAmap();
  if (ok) {
    // 等待 AMap 就绪
    const wait = setInterval(() => {
      if (window.AMap && document.getElementById('map')) {
        clearInterval(wait); initMap();
      }
    }, 80);
  }
})();
