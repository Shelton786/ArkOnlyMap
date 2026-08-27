/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 审核队列 + 用户管理 ---------------- */
/* ---------------- 审核队列 ---------------- */
async function openReviewQueue() {
  const r = await api('/api/admin/review');
  if (!r.ok) { toast('无权限'); return; }
  const list = await r.json();
  openModal(`
    <div class="modal-title">审核队列</div>
    <div class="modal-sub">待确认活动（公开但标「未确认」）</div>
    <div id="review-list" class="review-list">
      ${list.length ? '' : '<p class="list-empty">暂无待审核活动</p>'}
    </div>`);
  const box = document.getElementById('review-list');
  for (const ev of list) {
    const item = document.createElement('div');
    item.className = 'review-item';
    const typeTxt = ev.submission_type === 'supplement' ? '补充信息' : '新建活动';
    item.innerHTML = `
      <div class="ri-head"><b>${esc(ev.title)}</b><span class="badge badge--pending">${esc(typeTxt)}</span></div>
      <div class="ri-meta">${esc(ev.city || '')} · 提交者 ${esc(ev.submitted_by_name || '匿名')}${ev.submission_type === 'supplement' && ev.parent_event_id ? ' · 补充至 #' + esc(ev.parent_event_id) : ''}</div>
      ${Array.isArray(ev._diff) ? (ev._diff.length
        ? '<div class="ri-desc">' + ev._diff.map((d) => `<b>${esc(d.label)}</b>：${esc(d.from)} → ${esc(d.to)}`).join('<br/>') + '</div>'
        : '<div class="ri-desc">（与原活动相比无字段变化）</div>')
        : (ev.description ? '<div class="ri-desc">' + esc(ev.description) + '</div>' : '')}
      <div class="ri-actions">
        <button class="ak-btn ak-btn--sm ak-btn--primary" data-act="approve" data-id="${ev.id}">通过</button>
        <button class="ak-btn ak-btn--sm ak-btn--danger" data-act="reject" data-id="${ev.id}">驳回</button>
      </div>`;
    box.appendChild(item);
  }
  box.querySelectorAll('button[data-act]').forEach((b) => {
    b.onclick = () => reviewAction(b.dataset.id, b.dataset.act);
  });
}

async function reviewAction(id, action) {
  const r = await api('/api/admin/review/' + id, { method: 'POST', body: JSON.stringify({ action }) });
  if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || '操作失败'); return; }
  toast(action === 'approve' ? '已通过' : '已驳回');
  loadEvents();
  openReviewQueue();
}

/* ---------------- 用户管理（站长） ---------------- */
async function openUserAdmin() {
  const r = await api('/api/admin/users');
  if (!r.ok) { toast('无权限'); return; }
  const users = await r.json();
  const cur = state.user;
  openModal(`
    <div class="modal-title">用户管理</div>
    <div class="modal-sub">仅站长可设置管理员 / 站长角色</div>
    <div class="user-admin-list">
      ${users.map((u) => `
        <div class="ua-row">
          <span class="ua-name">${esc(u.display_name || u.username)} <small>${esc(u.amid || '')}</small></span>
          <select class="ua-role" data-id="${u.id}">
            ${['user', 'organizer', 'admin', 'site_admin'].map((rl) => `<option value="${rl}" ${u.role === rl ? 'selected' : ''}>${roleLabel(rl)}</option>`).join('')}
          </select>
        </div>`).join('')}
    </div>
    <div class="modal-actions"><button class="ak-btn ak-btn--ghost" data-close>关闭</button></div>`);
  document.querySelectorAll('.ua-role').forEach((sel) => {
    sel.onchange = async () => {
      const id = Number(sel.dataset.id);
      const role = sel.value;
      const rr = await api('/api/admin/users/' + id + '/role', { method: 'POST', body: JSON.stringify({ role }) });
      const d = await rr.json();
      if (!rr.ok) { toast(d.error || '设置失败'); sel.value = users.find((u) => u.id === id).role; return; }
      toast('已设为' + roleLabel(role));
      if (id === cur.id) { state.user = { ...state.user, role }; renderAuth(); }
    };
  });
}
