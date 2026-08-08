/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 本文件由 app.js 拆分而来（2026.8.8），为经典脚本：
 * 依赖更早加载的 js/core.js 提供的全局绑定（state / esc / api 等）。
 */
'use strict';

/* ---------------- 弹窗框架 + 登录注册 ---------------- */
function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-mask"><div class="modal">${html}</div></div>`;
  const mask = root.querySelector('.modal-mask');
  mask.addEventListener('click', (e) => { if (e.target === mask) closeModal(); });
  // 弹窗内带 data-close 的按钮统一关闭
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

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
