/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 账户与账户中心 ---------------- */
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
    const isAdmin = u.role === 'admin' || u.role === 'site_admin';
    area.innerHTML = `
      <a href="/account.html" class="user-chip" style="cursor:pointer;text-decoration:none;" title="账户中心">
        ${u.avatar_url
          ? `<img class="avatar-img" src="/api/avatar?u=${encodeURIComponent(u.avatar_url)}" alt="" onerror="this.style.display='none'">`
          : `<span class="avatar">${esc((u.display_name || u.username).slice(0, 1))}</span>`}
        <span>${esc(u.display_name || u.username)}</span>
        <span class="role-badge ${roleClass(u.role)}">${roleLabel(u.role)}</span>
      </a>
      <a href="/about.html" class="ak-btn ak-btn--ghost ak-btn--sm" style="text-decoration:none;">关于</a>
      ${isAdmin ? '<button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-review">审核</button>' : ''}
      ${u.role === 'site_admin' ? '<button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-users">用户</button>' : ''}
      <button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-logout">退出</button>`;
    document.getElementById('btn-logout').onclick = logout;
    if (isAdmin) document.getElementById('btn-review').onclick = () => { location.href = '/admin.html'; };
    if (u.role === 'site_admin') document.getElementById('btn-users').onclick = () => { location.href = '/admin.html'; };
    if (submitBtn) { submitBtn.style.display = ''; submitBtn.onclick = () => openSubmit(); }
    const gb = document.getElementById('btn-geocode');
    if (gb) {
      if (isAdmin) { gb.classList.remove('hidden'); gb.onclick = geocodeAll; } else gb.classList.add('hidden');
    }
  } else {
    area.innerHTML = `
      <button class="ak-btn ak-btn--ghost ak-btn--sm" id="btn-login">登录</button>
      <button class="ak-btn ak-btn--primary ak-btn--sm" id="btn-register">注册</button>`;
    document.getElementById('btn-login').onclick = () => openAuth('login');
    document.getElementById('btn-register').onclick = () => openAuth('register');
    if (submitBtn) submitBtn.style.display = 'none';
    const gb = document.getElementById('btn-geocode');
    if (gb) gb.classList.add('hidden');
  }
}
async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null; renderAuth(); toast('已退出');
}

/* ---------------- 账户中心 ---------------- */
async function openAccountCenter() {
  if (!state.user) { openAuth('login'); return; }
  const r = await api('/api/auth/me');
  const d = await r.json();
  if (!d.user) { state.user = null; renderAuth(); return; }
  state.user = d.user;
  const u = d.user;
  const hypergryph = (u.providers || []).includes('hypergryph');
  openModal(`
    <div class="modal-title">账户中心</div>
    <div class="modal-sub">你的同好身份与绑定</div>
    <div class="ac-grid">
      <div class="ac-row"><span class="k">身份号</span><span class="v amid">${esc(u.amid)}</span></div>
      <div class="ac-row"><span class="k">角色</span><span class="v"><span class="role-badge ${roleClass(u.role)}">${roleLabel(u.role)}</span></span></div>
      <div class="ac-row"><span class="k">昵称</span><span class="v">${esc(u.username)}</span></div>
      <div class="ac-row"><span class="k">展示名</span><span class="v">${esc(u.display_name || u.username)}</span></div>
      <div class="ac-row"><span class="k">邮箱</span><span class="v">${u.email ? esc(u.email) + (u.email_verified ? ' ✓' : '（未验证）') : '未设置'}</span></div>
    </div>
    <div class="field"><label>修改展示名</label><input id="ac-dn" value="${esc(u.display_name || u.username)}" maxlength="30" /></div>
    <div class="field"><label>修改邮箱（验证阶段暂未开启）</label><input id="ac-email" type="email" value="${esc(u.email || '')}" placeholder="you@example.com" /></div>
    <div class="modal-error" id="ac-error"></div>
    <div class="modal-actions">
      <button class="ak-btn ak-btn--primary" id="ac-save">保存</button>
      <button class="ak-btn ak-btn--ghost" onclick="closeModal()">关闭</button>
    </div>
    <hr class="ac-sep" />
    <div class="ac-section-title">第三方绑定</div>
    <div class="ac-binds">
      <div class="bind-row">
        <span>鹰角通行证（11 位 UID）</span>
        ${hypergryph ? '<span class="bind-on">已绑定</span><button class="ak-btn ak-btn--sm ak-btn--ghost" id="ac-unhg">解绑</button>' : '<button class="ak-btn ak-btn--sm" id="ac-bindhg">绑定</button>'}
      </div>
      <div class="bind-row"><span>QQ / 微信 / Telegram</span><span class="bind-soon">即将开放</span></div>
    </div>`);
  document.getElementById('ac-save').onclick = saveAccount;
  if (hypergryph) document.getElementById('ac-unhg').onclick = unbindHg;
  else document.getElementById('ac-bindhg').onclick = bindHg;
}
window.openAccountCenter = openAccountCenter;

async function saveAccount() {
  const dn = document.getElementById('ac-dn').value.trim();
  const email = document.getElementById('ac-email').value.trim();
  const err = document.getElementById('ac-error');
  const r = await api('/api/auth/me', { method: 'PUT', body: JSON.stringify({ display_name: dn, email }) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || '保存失败'; return; }
  state.user = d.user; renderAuth(); closeModal(); toast('已保存');
}
window.saveAccount = saveAccount;

async function bindHg() {
  const uid = prompt('请输入你的鹰角通行证 11 位 UID：');
  if (!uid) return;
  const r = await api('/api/auth/link/hypergryph', { method: 'POST', body: JSON.stringify({ uid }) });
  const d = await r.json();
  if (!r.ok) { alert(d.error || '绑定失败'); return; }
  state.user = d.user; renderAuth(); openAccountCenter(); toast('已绑定鹰角通行证');
}
window.bindHg = bindHg;

async function unbindHg() {
  if (!confirm('确定解绑鹰角通行证？')) return;
  const r = await api('/api/auth/link/hypergryph', { method: 'DELETE' });
  const d = await r.json();
  if (!r.ok) { alert(d.error || '解绑失败'); return; }
  state.user = d.user; renderAuth(); openAccountCenter(); toast('已解绑');
}
window.unbindHg = unbindHg;
