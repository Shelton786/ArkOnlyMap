/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 活动详情卡 ---------------- */
/* ---------------- 详情 ---------------- */
function openDetail(ev) {
  state.selectedId = ev.id;
  applyFilters(); // 同步刷新列表激活态与标记层级
  const p = ev.poster_url ? `<img class="detail-poster" src="${esc(safeUrl(ev.poster_url))}" onerror="this.style.display='none'"/>` : '';
  const link = safeUrl(ev.source_url) ? `<a class="detail-link" href="${esc(ev.source_url)}" target="_blank" rel="noopener">查看官方信息 ↗</a>` : '';
  const tags = Array.isArray(ev.tags) ? ev.tags : [];
  const u = state.user;
  const isAdmin = u && (u.role === 'admin' || u.role === 'site_admin');
  const isPending = ev.review_status === 'pending';
  const actions = [];
  if (link) actions.push(link);
  if (canEdit(ev)) actions.push(`<button class="ak-btn ak-btn--sm" onclick="openEdit(${ev.id})">编辑</button>`);
  if (canDelete(ev)) actions.push(`<button class="ak-btn ak-btn--sm ak-btn--danger" onclick="deleteEvent(${ev.id})">删除</button>`);
  if (u && ev.review_status !== 'merged') actions.push(`<button class="ak-btn ak-btn--sm ak-btn--ghost" onclick="openSupplement(${ev.id})">补充信息</button>`);
  if (u && ev.organizer_claim_status === 'none' && !(ev.organizer_user_id === u.id && ev.organizer_claim_status === 'approved')) {
    actions.push(`<button class="ak-btn ak-btn--sm ak-btn--ghost" onclick="claimEvent(${ev.id})">认领此集会</button>`);
  }
  if (isAdmin && ev.organizer_claim_status === 'pending') {
    actions.push(`<button class="ak-btn ak-btn--sm" onclick="approveClaim(${ev.id})">通过认领</button>`);
  }
  const reviewTag = isPending
    ? `<span class="badge badge--pending">${ev.submission_type === 'supplement' ? '未确认·补充' : '未确认'}</span>`
    : '';
  const panel = document.getElementById('detail-panel');
  panel.innerHTML = `
    <button class="detail-close" onclick="closeDetail()">×</button>
    ${p}
    <div class="detail-body">
      <h2 class="detail-title">${esc(ev.title)}</h2>
      <p class="detail-sub">${STATUS_TEXT[ev.status] || '待定'} · ${esc(fmtDate(ev))} ${reviewTag}</p>
      <div class="detail-rows">
        ${ev.city ? row('城市', ev.city + (isChina(ev.country) ? (ev.province ? ' / ' + ev.province : '') : (ev.country ? ' / ' + ev.country : ''))) : ''}
        ${ev.venue ? row('场馆', ev.venue) : ''}
        ${ev.address ? row('地址', ev.address) : ''}
        ${ev.organizer ? row('主办', ev.organizer) : ''}
        ${tags.length ? row('标签', tags.join('、')) : ''}
        ${ev.submitted_by_name ? `<div class="row"><span class="k">提交者</span><span class="v">${ev.submitted_by_amid ? `<a href="/account/${esc(ev.submitted_by_amid)}" style="color:var(--ak-primary);text-decoration:none;">${esc(ev.submitted_by_name)}</a>` : esc(ev.submitted_by_name)}</span></div>` : ''}
        ${isPending ? row('审核', ev.submission_type === 'supplement' ? '补充待合并' : '待管理员确认') : ''}
        ${ev.organizer_claim_status === 'pending' ? row('认领', '待管理员确认') : ''}
        ${ev.organizer_claim_status === 'approved' ? row('主办', '已认领') : ''}
        ${ev.verified ? row('核实', '✓ 已核实') : ''}
      </div>
      ${ev.description ? `<div class="detail-desc">${esc(ev.description)}</div>` : ''}
      <div class="detail-actions">${actions.join('')}</div>
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
  const u = state.user;
  if (!u || !ev) return false;
  if (u.role === 'admin' || u.role === 'site_admin') return true;
  if (ev.submitted_by != null && ev.submitted_by === u.id) return true;
  if (ev.organizer_claim_status === 'approved' && ev.organizer_user_id === u.id) return true;
  return false;
}
function canDelete(ev) { return canEdit(ev); }

async function claimEvent(id) {
  const r = await api(`/api/events/${id}/claim`, { method: 'POST' });
  if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || '认领失败'); return; }
  toast('已提交认领，等待管理员审核');
  const d = await r.json();
  const ev = state.events.find((e) => e.id === id);
  if (ev) { Object.assign(ev, d); openDetail(ev); } else loadEvents();
}
window.claimEvent = claimEvent;

async function approveClaim(id) {
  const r = await api(`/api/events/${id}/claim/approve`, { method: 'POST' });
  if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || '操作失败'); return; }
  toast('已通过认领');
  const d = await r.json();
  const ev = state.events.find((e) => e.id === id);
  if (ev) Object.assign(ev, d);
  openDetail(ev || d);
}
window.approveClaim = approveClaim;
