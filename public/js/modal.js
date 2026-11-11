/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 弹窗框架 + 登录注册 ---------------- */
let _modalKeyHandler = null;
let _modalPrevFocus = null;

function openModal(html) {
  const root = document.getElementById('modal-root');
  // 切换登录/注册会再次调用 openModal：先摘掉上一个弹窗的键盘监听，
  // 但保留最初的来源焦点，关闭时才能把焦点还给触发按钮。
  if (_modalKeyHandler) {
    document.removeEventListener('keydown', _modalKeyHandler);
    _modalKeyHandler = null;
  } else {
    _modalPrevFocus = document.activeElement;
  }
  root.innerHTML = `<div class="modal-mask"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const mask = root.querySelector('.modal-mask');
  const dialog = root.querySelector('.modal');
  const title = dialog.querySelector('.modal-title');
  if (title) dialog.setAttribute('aria-label', title.textContent.trim());
  mask.addEventListener('click', (e) => { if (e.target === mask) closeModal(); });
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));

  const focusable = () => [...dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.disabled && el.offsetParent !== null);
  _modalKeyHandler = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', _modalKeyHandler);
  const first = focusable()[0];
  if (first) first.focus();
}
function closeModal() {
  if (_modalKeyHandler) {
    document.removeEventListener('keydown', _modalKeyHandler);
    _modalKeyHandler = null;
  }
  // 关闭后把焦点还给打开弹窗前的元素，避免键盘焦点丢失到页面开头
  if (_modalPrevFocus && document.contains(_modalPrevFocus)) {
    try { _modalPrevFocus.focus(); } catch (e) { /* 元素已不可聚焦则忽略 */ }
  }
  _modalPrevFocus = null;
  document.getElementById('modal-root').innerHTML = '';
}

function openAuth(mode) {
  const isLogin = mode === 'login';
  openModal(`
    <div class="modal-title">${isLogin ? '博士登录' : '加入集会'}</div>
    <div class="modal-sub">${isLogin ? '用昵称或邮箱登录' : '注册一个身份（AMID），用于确认你的提交'}</div>
    <div class="field"><label>${isLogin ? '昵称 / 邮箱' : '昵称 *'}</label><input id="au-name" placeholder="${isLogin ? '昵称或邮箱' : '2-20 个字符'}" /></div>
    ${!isLogin ? '<div class="field"><label>邮箱（可选，作为登录名）</label><input id="au-email" type="email" placeholder="you@example.com" /></div>' : ''}
    <div class="field"><label>密码</label><input id="au-pass" type="password" placeholder="至少 6 位" /></div>
    <div class="modal-error" id="au-error"></div>
    <div class="modal-actions">
      <button class="ak-btn ak-btn--primary" id="au-submit">${isLogin ? '登录' : '注册'}</button>
      <button class="ak-btn ak-btn--ghost" data-close>取消</button>
    </div>
    <div class="modal-switch">${isLogin ? '还没有身份？' : '已有身份？'}
      <a id="au-switch" role="button" tabindex="0">${isLogin ? '立即注册' : '去登录'}</a>
    </div>`);
  document.getElementById('au-submit').onclick = () => submitAuth(isLogin);
  document.getElementById('au-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(isLogin); });
  const sw = document.getElementById('au-switch');
  const switchMode = () => openAuth(isLogin ? 'register' : 'login');
  sw.addEventListener('click', switchMode);
  sw.addEventListener('keydown', (e) => { if (e.key === 'Enter') switchMode(); });
}
async function submitAuth(isLogin) {
  const username = document.getElementById('au-name').value.trim();
  const password = document.getElementById('au-pass').value;
  const emailEl = document.getElementById('au-email');
  const email = emailEl ? emailEl.value.trim() : '';
  const err = document.getElementById('au-error');
  const r = await api(isLogin ? '/api/auth/login' : '/api/auth/register', {
    method: 'POST', body: JSON.stringify({ username, password, email }),
  });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || '操作失败'; return; }
  state.user = d.user; renderAuth(); closeModal();
  toast(isLogin ? '欢迎回来，博士' : '注册成功');
  if (typeof loadEvents === 'function') loadEvents(); // 仅地图首页存在
}
