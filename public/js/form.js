/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 提交 / 编辑 / 补充表单 ---------------- */
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

function openForm(ev, opts = {}) {
  const isEdit = !!ev && !opts.supplementOf;
  const sup = opts.supplementOf || null;
  const isSupplement = !!sup;
  state._picked = null;
  if (state.pickMarker) { state.pickMarker.setMap(null); state.pickMarker = null; }
  const src = sup || ev; // 预填来源：补充模式取原活动
  const v = (k) => (src && src[k] != null ? src[k] : '');
  const tagsVal = src && Array.isArray(src.tags) ? src.tags.join('、') : '';
  const startVal = src ? (src.start_date || '') : '';
  const curProv = v('province');
  const provinceOptions = Object.keys(PROVINCE_CITIES)
    .map((p) => `<option value="${esc(p)}" ${curProv === p ? 'selected' : ''}>${esc(p)}</option>`).join('');
  let cityOptions = '';
  if (curProv && PROVINCE_CITIES[curProv]) {
    cityOptions = PROVINCE_CITIES[curProv]
      .map((c) => `<option value="${esc(c)}" ${v('city') === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
  }
  const hasCoord = src && src.longitude != null;
  const curCountry = v('country') || '中国';
  const countryVal = COUNTRY_LIST.includes(curCountry) ? curCountry : '其他';
  const countryOptions = COUNTRY_LIST
    .map((c) => `<option value="${esc(c)}" ${countryVal === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
  const cnMode = isChina(curCountry);
  openModal(`
    <div class="modal-title">${isSupplement ? '补充集会信息' : isEdit ? '编辑漫展' : '提交新漫展'}</div>
    <div class="modal-sub">${isSupplement ? '审核通过后，你填写的内容将合并进原活动' : isEdit ? '修改你提交的活动信息' : '填写活动信息，提交后将在地图上出现'}</div>
    ${isSupplement ? '<div class="supplement-banner">补充模式：仅填写需要更正 / 新增的字段，审核通过后合并到原活动。</div>' : ''}
    <div class="field"><label>活动名称 *</label><input id="f-title" value="${esc(v('title'))}" placeholder="例如：平壤.明日方舟ONLY" /></div>
    <div class="field"><label>举办日期</label><input id="f-start-date" type="date" value="${esc(startVal)}" /><label style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;"><input type="checkbox" id="f-multi-day" /> 持续多天</label><div id="f-end-date-wrap" style="display:none;margin-top:8px;"><label style="font-size:12px;color:var(--text-dim);">结束日期</label><input id="f-end-date" type="date" /></div></div>
    <div class="field"><label>国家 / 地区 *</label><select id="f-country">${countryOptions}</select></div>
    <div class="field-row" id="loc-cn">
      <div class="field"><label>省份</label><select id="f-province">${provinceOptions}</select></div>
      <div class="field"><label>城市 *</label><select id="f-city">${cityOptions || '<option value="">（先选省份）</option>'}</select></div>
    </div>
    <div class="field-row" id="loc-os" style="display:${cnMode ? 'none' : ''};">
      <div class="field"><label>省 / 州（选填）</label><input id="f-province-os" value="${cnMode ? '' : esc(v('province') || '')}" placeholder="例如：加利福尼亚州" /></div>
      <div class="field"><label>城市 *</label><input id="f-city-os" value="${cnMode ? '' : esc(v('city') || '')}" placeholder="例如：洛杉矶" /></div>
    </div>
    <div class="field"><label>场馆</label><input id="f-venue" value="${esc(v('venue'))}" placeholder="例如：朝鲜平壤大剧院" /></div>
    <div class="field"><label>详细地址</label><input id="f-address" value="${esc(v('address'))}" placeholder="用于地图定位，留空也可稍后补。例如：朝鲜国家馆" /></div>
    <div class="field"><label>主办</label><input id="f-organizer" value="${esc(v('organizer'))}" /></div>
    <div class="field"><label>来源链接</label><input id="f-source" value="${esc(v('source_url'))}" placeholder="https://" /></div>
    <div class="field"><label>海报图片 URL</label><input id="f-poster" value="${esc(v('poster_url'))}" placeholder="https://..." /></div>
    <div class="field"><label>标签（用、分隔）</label><input id="f-tags" value="${esc(tagsVal)}" placeholder="例如：官方、同人、茶话会、即卖会、免费展会等" /></div>
    <div class="field"><label>介绍</label><textarea id="f-desc" placeholder="活动简介、亮点、交通等">${esc(v('description'))}</textarea></div>
    <div class="field">
      <label>地图定位（自动）</label>
      <div class="coord-pick" id="f-coord">${hasCoord ? `已定位：${src.longitude}, ${src.latitude}` : '填写城市 / 详细地址后将自动解析落点'}</div>
    </div>
    ${isSupplement ? `<input type="hidden" id="f-sub-type" value="supplement" /><input type="hidden" id="f-parent" value="${sup.id}" />` : ''}
    <div class="modal-error" id="f-error"></div>
    <div class="modal-actions">
      <button type="button" class="ak-btn ak-btn--primary" id="f-submit">${isSupplement ? '提交补充' : isEdit ? '保存' : '提交'}</button>
      <button type="button" class="ak-btn ak-btn--ghost" onclick="closeModal()">取消</button>
    </div>`);

  document.getElementById('f-submit').onclick = () => submitForm(ev, opts);
  wireAddressAutolocate();
  wireCitySelect();
  // 国家 / 地区切换：中国→省份/城市下拉；海外→省/州(选填)+城市自由文本
  const countrySel = document.getElementById('f-country');
  const locCn = document.getElementById('loc-cn');
  const locOs = document.getElementById('loc-os');
  if (countrySel && locCn && locOs) {
    const toggleLoc = () => {
      const cn = isChina(countrySel.value);
      locCn.style.display = cn ? '' : 'none';
      locOs.style.display = cn ? 'none' : '';
    };
    countrySel.addEventListener('change', toggleLoc);
    toggleLoc();
  }
  // 持续多天开关：勾选显示结束日期
  const mdCb = document.getElementById('f-multi-day');
  const endWrap = document.getElementById('f-end-date-wrap');
  if (mdCb && endWrap) {
    mdCb.addEventListener('change', () => { endWrap.style.display = mdCb.checked ? '' : 'none'; });
    // 编辑模式：如有 end_date 则自动勾选并回填
    if (src && src.end_date && src.end_date !== src.start_date) {
      mdCb.checked = true;
      endWrap.style.display = '';
      const ed = document.getElementById('f-end-date');
      if (ed) ed.value = src.end_date;
    }
  }
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
  // 兜底：输入后浏览器端地理编码预览（无联想命中也能在地图上定位）
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

function wireCitySelect() {
  const p = document.getElementById('f-province');
  const c = document.getElementById('f-city');
  if (!p || !c) return;
  const fill = () => {
    const prev = c.value;
    const cities = PROVINCE_CITIES[p.value] || [];
    c.innerHTML = cities.length
      ? cities.map((ci) => `<option value="${esc(ci)}">${esc(ci)}</option>`).join('')
      : '<option value="">（该省暂无列表）</option>';
    if ([...c.options].some((o) => o.value === prev)) c.value = prev;
  };
  p.addEventListener('change', fill);
  if (p.value) fill();
}

function setPicked(lng, lat) {
  const coordEl = document.getElementById('f-coord');
  if (coordEl) coordEl.textContent = `已定位：${lng.toFixed(5)}, ${lat.toFixed(5)}`;
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

async function submitForm(ev, opts = {}) {
  const err = document.getElementById('f-error');
  if (err) err.textContent = '';
  try {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { err.textContent = '请填写活动名称'; return; }
  const tags = document.getElementById('f-tags').value.split('、').map((s) => s.trim()).filter(Boolean);
  const startDate = document.getElementById('f-start-date').value.trim();
  const isMultiDay = document.getElementById('f-multi-day')?.checked;
  const endDate = isMultiDay ? (document.getElementById('f-end-date')?.value.trim() || '') : '';
  const country = document.getElementById('f-country').value || '中国';
  let province, city;
  if (isChina(country)) {
    province = document.getElementById('f-province').value || null;
    city = document.getElementById('f-city').value.trim() || null;
  } else {
    province = document.getElementById('f-province-os').value.trim() || null;
    city = document.getElementById('f-city-os').value.trim() || null;
  }
  const payload = {
    title,
    start_date: startDate || null,
    end_date: (endDate && endDate !== startDate) ? endDate : null,
    country,
    province,
    city,
    venue: document.getElementById('f-venue').value.trim() || null,
    address: document.getElementById('f-address').value.trim() || null,
    organizer: document.getElementById('f-organizer').value.trim() || null,
    source_url: document.getElementById('f-source').value.trim() || null,
    poster_url: document.getElementById('f-poster').value.trim() || null,
    description: document.getElementById('f-desc').value.trim() || null,
    tags,
  };
  const isEdit = !!ev && !opts.supplementOf;
  const isSupplement = !!(opts && opts.supplementOf);
  if (isSupplement) {
    payload.submission_type = 'supplement';
    payload.parent_event_id = opts.supplementOf.id;
  }
  if (state._picked) { payload.longitude = state._picked.longitude; payload.latitude = state._picked.latitude; }
  const url = isEdit ? `/api/events/${ev.id}` : '/api/events';
  const r = await api(url, { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(payload) });
  let d = {};
  try { d = await r.json(); } catch { /* 响应非 JSON（如 500 错误页），忽略解析 */ }
  if (!r.ok) { err.textContent = (d && d.error) || '提交失败，服务器异常，请稍后重试'; return; }
  closeModal();
  state._picked = null;
  if (state.pickMarker) { state.pickMarker.setMap(null); state.pickMarker = null; }
  if (isSupplement || d.pending) toast('已提交，等待管理员审核');
  else if (isEdit) toast('已保存');
  else toast('提交成功，感谢贡献！');
  loadEvents();
  } catch (e) {
    console.error('submitForm error', e);
    if (err) err.textContent = (e && e.message) ? e.message : '提交失败，请重试';
  }
}

function openSupplement(parentEv) {
  if (!state.user) { openAuth('login'); return; }
  openForm(null, { supplementOf: parentEv });
}
window.openSupplement = openSupplement;
