/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * 管理后台「用户管理」模块（经典脚本，由 /admin.html 加载）。
 *
 * 后台页不引入 core.js / modal.js（那套绑定依赖地图页的全局 state），
 * 因此这里自带一份轻量弹窗实现，并沿用 modal.js 的无障碍约定：
 * role=dialog / aria-modal、Esc 关闭、Tab 焦点陷阱、关闭后焦点归还。
 * 所有外部数据与文案通过 ctx.esc 注入，避免用户昵称/邮箱触发 XSS。
 */
(function () {
  'use strict';

  const ROLE_RANK = { user: 0, organizer: 1, admin: 2, site_admin: 3 };
  const ALL_ROLES = ['user', 'organizer', 'admin', 'site_admin'];
  const SORTS = [
    { key: 'newest', label: '最新注册' },
    { key: 'oldest', label: '最早注册' },
    { key: 'role', label: '按权限' },
    { key: 'username', label: '按用户名' },
  ];
  const LIMITS = [20, 50, 100];

  let host = null;
  let ctx = null;
  let searchTimer = null;
  let reqSeq = 0;
  const st = {
    q: '', role: '', sort: 'newest', page: 1, limit: 20,
    total: 0, pages: 1, items: [], selected: new Set(),
    loading: false, error: '',
  };
  const dlg = { prevFocus: null, keyHandler: null };

  const E = (s) => ctx.esc(s);
  const RL = (r) => ctx.roleLabel(r);
  const RC = (r) => ctx.roleClass(r);
  const num = (v) => Number(v) || 0;
  const shortDate = (s) => (s ? String(s).slice(0, 10) : '—');

  // 调用者只能修改权限严格低于自己的用户；同级（含自己）与更高一律禁用。
  function canEdit(u) {
    return (ROLE_RANK[u.role] ?? -1) < (ROLE_RANK[ctx.me.role] ?? -1)
      && String(u.id) !== String(ctx.me.id);
  }
  // 前端可选角色与后端 validateNewRole 保持一致：admin 不能授予 admin/site_admin。
  function allowedRoles() {
    if (ctx.me.role === 'site_admin') return ALL_ROLES.slice();
    if (ctx.me.role === 'admin') return ['user', 'organizer'];
    return [];
  }
  function byId(id) { return st.items.find((u) => String(u.id) === String(id)); }

  function roleBadge(r) {
    return `<span class="role-badge ${RC(r)}">${E(RL(r))}</span>`;
  }
  function avatarHtml(u) {
    if (u.avatar_url) {
      return `<img class="ua-avatar" src="${E('/api/avatar?u=' + encodeURIComponent(u.avatar_url))}" alt="" onerror="this.style.display='none'">`;
    }
    return `<span class="ua-avatar ua-avatar--text">${E((u.display_name || u.username || '?').slice(0, 1))}</span>`;
  }

  /* ---------------- 弹窗（自带 a11y 实现） ---------------- */
  function openDialog(html) {
    if (dlg.keyHandler) closeDialog();
    const root = document.getElementById('modal-root');
    if (!root) return null;
    dlg.prevFocus = document.activeElement;
    root.innerHTML = `<div class="modal-mask"><div class="modal ua-modal" role="dialog" aria-modal="true">${html}</div></div>`;
    const mask = root.querySelector('.modal-mask');
    const dialog = root.querySelector('.modal');
    const title = dialog.querySelector('.modal-title');
    if (title) dialog.setAttribute('aria-label', title.textContent.trim());
    mask.addEventListener('click', (e) => { if (e.target === mask) closeDialog(); });
    root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeDialog));
    const focusable = () => [...dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter((el) => !el.disabled && el.offsetParent !== null);
    dlg.keyHandler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeDialog(); return; }
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', dlg.keyHandler);
    const first = focusable()[0];
    if (first) first.focus();
    return dialog;
  }
  function closeDialog() {
    if (dlg.keyHandler) {
      document.removeEventListener('keydown', dlg.keyHandler);
      dlg.keyHandler = null;
    }
    if (dlg.prevFocus && document.contains(dlg.prevFocus)) {
      try { dlg.prevFocus.focus(); } catch (e) { /* 元素已不可聚焦 */ }
    }
    dlg.prevFocus = null;
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  }

  /* ---------------- 骨架 ---------------- */
  function renderShell() {
    host.innerHTML = `
      <div class="ua-panel">
        <div class="ua-toolbar">
          <div class="ua-search">
            <span class="ua-search-icon" aria-hidden="true">⌕</span>
            <input id="ua-q" type="search" autocomplete="off" spellcheck="false"
              placeholder="搜索昵称 / 用户名 / AMID / 邮箱" aria-label="搜索用户" value="${E(st.q)}" />
          </div>
          <select id="ua-role" class="ua-select" aria-label="按角色筛选">
            <option value="">全部角色</option>
            ${ALL_ROLES.map((r) => `<option value="${r}" ${st.role === r ? 'selected' : ''}>${E(RL(r))}</option>`).join('')}
          </select>
          <select id="ua-sort" class="ua-select" aria-label="排序方式">
            ${SORTS.map((s) => `<option value="${s.key}" ${st.sort === s.key ? 'selected' : ''}>${E(s.label)}</option>`).join('')}
          </select>
          <button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="refresh" type="button">刷新</button>
        </div>

        <div class="ua-summary">
          <span id="ua-count">共 0 位用户</span>
          <span class="ua-hint">角色变更需二次确认 · 可勾选后批量设置</span>
        </div>

        <div class="ua-bulk hidden" id="ua-bulk">
          <span>已选 <b id="ua-sel-count">0</b> 位</span>
          <select id="ua-bulk-role" class="ua-select" aria-label="批量设置的目标角色">
            ${allowedRoles().map((r) => `<option value="${r}">设为${E(RL(r))}</option>`).join('')}
          </select>
          <button class="ak-btn ak-btn--primary ak-btn--sm" data-act="bulk-apply" type="button">批量设置角色</button>
          <button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="bulk-clear" type="button">取消选择</button>
        </div>

        <div class="ua-table-wrap">
          <table class="ua-table">
            <thead>
              <tr>
                <th class="ua-col-check"><input type="checkbox" id="ua-check-all" aria-label="全选本页可修改的用户" /></th>
                <th>用户</th>
                <th class="ua-col-amid">AMID</th>
                <th class="ua-col-mail">邮箱</th>
                <th>角色</th>
                <th>活动</th>
                <th class="ua-col-date">注册</th>
                <th class="ua-col-ops">操作</th>
              </tr>
            </thead>
            <tbody id="ua-tbody"></tbody>
          </table>
        </div>
        <div class="ua-pager" id="ua-pager"></div>
      </div>`;

    if (!host.__uaBound) {
      host.__uaBound = true;
      host.addEventListener('click', onClick);
      host.addEventListener('change', onChange);
      host.addEventListener('input', onInput);
    }
  }

  function renderBody() {
    const box = host.querySelector('#ua-tbody');
    if (!box) return;
    const count = host.querySelector('#ua-count');
    if (count) count.textContent = `共 ${st.total} 位用户` + (st.q || st.role ? '（已筛选）' : '');
    if (st.loading) {
      box.innerHTML = `<tr><td colspan="8" class="ua-state">加载中…</td></tr>`;
      return;
    }
    if (st.error) {
      box.innerHTML = `<tr><td colspan="8" class="ua-state ua-state--error">
        ${E(st.error)} <button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="retry" type="button">重试</button>
      </td></tr>`;
      return;
    }
    if (!st.items.length) {
      const filtered = !!(st.q || st.role);
      box.innerHTML = `<tr><td colspan="8" class="ua-state">
        ${filtered ? '没有符合条件的用户' : '暂无用户'}
        ${filtered ? '<button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="clear-filter" type="button">清除筛选</button>' : ''}
      </td></tr>`;
      return;
    }
    box.innerHTML = st.items.map((u) => {
      const editable = canEdit(u);
      const checked = st.selected.has(String(u.id));
      const pending = num(u.pending_count);
      return `
        <tr data-id="${E(u.id)}">
          <td class="ua-col-check">
            <input type="checkbox" class="ua-check" data-id="${E(u.id)}" ${checked ? 'checked' : ''} ${editable ? '' : 'disabled'}
              aria-label="选择 ${E(u.display_name || u.username)}" />
          </td>
          <td>
            <div class="ua-user">
              ${avatarHtml(u)}
              <div class="ua-user-main">
                <span class="ua-display">${E(u.display_name || u.username)}</span>
                <span class="ua-username">@${E(u.username)}</span>
              </div>
            </div>
          </td>
          <td class="ua-col-amid ua-mono">${E(u.amid || '—')}</td>
          <td class="ua-col-mail">${u.email
            ? `${E(u.email)}${u.email_verified ? '<span class="ua-verified" title="邮箱已验证">✓</span>' : ''}`
            : '<span class="ua-dim">未填写</span>'}</td>
          <td>${roleBadge(u.role)}</td>
          <td class="ua-stats">
            <span>提交 <b>${num(u.event_count)}</b></span>
            <span class="${pending ? 'ua-stat--warn' : ''}">待审 <b>${pending}</b></span>
            <span>认领 <b>${num(u.claim_count)}</b></span>
          </td>
          <td class="ua-col-date ua-mono" title="${E(u.created_at || '')}">${E(shortDate(u.created_at))}</td>
          <td class="ua-col-ops">
            <button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="detail" data-id="${E(u.id)}" type="button">详情</button>
            <button class="ak-btn ak-btn--ghost ak-btn--sm" data-act="role" data-id="${E(u.id)}" type="button"
              ${editable ? '' : 'disabled title="同级或更高权限的用户不可修改"'}>改角色</button>
          </td>
        </tr>`;
    }).join('');
    syncCheckAll();
  }

  function renderPager() {
    const box = host.querySelector('#ua-pager');
    if (!box) return;
    box.innerHTML = `
      <button class="ak-btn ak-btn--ghost ak-btn--sm" data-page="prev" type="button" ${st.page <= 1 || st.loading ? 'disabled' : ''}>上一页</button>
      <span class="ua-page-info">第 ${st.page} / ${st.pages} 页 · 共 ${st.total} 位</span>
      <button class="ak-btn ak-btn--ghost ak-btn--sm" data-page="next" type="button" ${st.page >= st.pages || st.loading ? 'disabled' : ''}>下一页</button>
      <select class="ua-select ua-limit" id="ua-limit" aria-label="每页条数">
        ${LIMITS.map((n) => `<option value="${n}" ${st.limit === n ? 'selected' : ''}>${n} 条/页</option>`).join('')}
      </select>`;
  }

  function renderBulk() {
    const bar = host.querySelector('#ua-bulk');
    if (!bar) return;
    const n = st.selected.size;
    bar.classList.toggle('hidden', n === 0);
    const label = host.querySelector('#ua-sel-count');
    if (label) label.textContent = String(n);
  }

  function syncCheckAll() {
    const all = host.querySelector('#ua-check-all');
    if (!all) return;
    const editable = st.items.filter(canEdit);
    const picked = editable.filter((u) => st.selected.has(String(u.id))).length;
    all.disabled = editable.length === 0;
    all.checked = editable.length > 0 && picked === editable.length;
    all.indeterminate = picked > 0 && picked < editable.length;
  }

  /* ---------------- 数据 ---------------- */
  async function load() {
    if (!host) return;
    const seq = ++reqSeq;
    st.loading = true;
    st.error = '';
    renderBody();
    renderPager();
    const params = new URLSearchParams({ page: String(st.page), limit: String(st.limit), sort: st.sort });
    if (st.q) params.set('q', st.q);
    if (st.role) params.set('role', st.role);
    try {
      const r = await ctx.api('/api/admin/users?' + params.toString());
      if (!r.ok) {
        throw new Error(r.status === 403 ? '无权限查看用户列表' : `加载失败（HTTP ${r.status}）`);
      }
      const d = await r.json();
      if (seq !== reqSeq) return; // 旧请求晚到，丢弃，避免覆盖新的筛选结果
      st.items = Array.isArray(d.items) ? d.items : [];
      st.total = num(d.total);
      st.pages = Math.max(1, num(d.pages));
      st.page = num(d.page) || st.page;
      // 换页/筛选后，选中集合只保留当前仍可见且可修改的行
      const visible = new Set(st.items.filter(canEdit).map((u) => String(u.id)));
      for (const id of [...st.selected]) if (!visible.has(id)) st.selected.delete(id);
      if (ctx.onCount) ctx.onCount(st.total);
    } catch (e) {
      if (seq !== reqSeq) return;
      st.error = e.message || '加载失败，请重试';
    } finally {
      if (seq === reqSeq) st.loading = false;
    }
    renderBody();
    renderPager();
    renderBulk();
  }

  /* ---------------- 交互 ---------------- */
  function onInput(e) {
    if (e.target.id !== 'ua-q') return;
    clearTimeout(searchTimer);
    const v = e.target.value;
    // 搜索防抖：用户停止输入 280ms 后才发请求，避免每敲一个字都打一次 D1。
    searchTimer = setTimeout(() => {
      const q = v.trim();
      if (q === st.q) return;
      st.q = q;
      st.page = 1;
      load();
    }, 280);
  }

  function onChange(e) {
    const t = e.target;
    if (t.id === 'ua-role') { st.role = t.value; st.page = 1; load(); }
    else if (t.id === 'ua-sort') { st.sort = t.value; st.page = 1; load(); }
    else if (t.id === 'ua-limit') { st.limit = Number(t.value) || 20; st.page = 1; load(); }
    else if (t.id === 'ua-check-all') {
      st.items.filter(canEdit).forEach((u) => {
        if (t.checked) st.selected.add(String(u.id));
        else st.selected.delete(String(u.id));
      });
      host.querySelectorAll('.ua-check').forEach((cb) => { if (!cb.disabled) cb.checked = t.checked; });
      syncCheckAll();
      renderBulk();
    } else if (t.classList.contains('ua-check')) {
      if (t.checked) st.selected.add(String(t.dataset.id));
      else st.selected.delete(String(t.dataset.id));
      syncCheckAll();
      renderBulk();
    }
  }

  function onClick(e) {
    const el = e.target.closest('[data-act], [data-page]');
    if (!el || el.disabled) return;
    if (el.dataset.page) {
      if (el.dataset.page === 'prev' && st.page > 1) st.page--;
      else if (el.dataset.page === 'next' && st.page < st.pages) st.page++;
      else return;
      st.selected.clear();
      load();
      return;
    }
    switch (el.dataset.act) {
      case 'refresh': load(); break;
      case 'retry': load(); break;
      case 'clear-filter':
        st.q = ''; st.role = ''; st.page = 1;
        const q = host.querySelector('#ua-q'); if (q) q.value = '';
        const rs = host.querySelector('#ua-role'); if (rs) rs.value = '';
        load();
        break;
      case 'bulk-clear':
        st.selected.clear();
        host.querySelectorAll('.ua-check').forEach((cb) => { cb.checked = false; });
        syncCheckAll(); renderBulk();
        break;
      case 'bulk-apply': {
        const sel = host.querySelector('#ua-bulk-role');
        openRoleDialog([...st.selected], sel ? sel.value : '');
        break;
      }
      case 'detail': openDetail(el.dataset.id); break;
      case 'role': openRoleDialog([el.dataset.id], ''); break;
    }
  }

  /* ---------------- 改角色（二次确认） ---------------- */
  function openRoleDialog(ids, presetRole) {
    if (!ids.length) return;
    const roles = allowedRoles();
    if (!roles.length) { ctx.toast('当前身份不能修改任何角色'); return; }
    const single = ids.length === 1;
    const first = byId(ids[0]);
    if (!first) { ctx.toast('用户已不在当前页，请刷新后重试'); return; }
    const cur = single ? first.role : '';
    const defaultRole = presetRole || (single && roles.includes(cur) ? cur : roles[0]);
    const names = ids.slice(0, 5).map((id) => {
      const u = byId(id);
      return u ? E(u.display_name || u.username) : `#${E(id)}`;
    }).join('、');
    const more = ids.length > 5 ? ` 等 ${ids.length} 位` : '';

    const dialog = openDialog(`
      <div class="modal-title">修改角色</div>
      <div class="modal-sub">${E(names)}${more}</div>
      ${single ? `<div class="ua-current">当前角色：${roleBadge(cur)}</div>` : ''}
      <div class="field">
        <label>设为</label>
        <div class="ua-role-options">
          ${roles.map((r) => `
            <label class="ua-role-opt">
              <input type="radio" name="ua-new-role" value="${r}" ${r === defaultRole ? 'checked' : ''} />
              ${roleBadge(r)}
            </label>`).join('')}
        </div>
      </div>
      <div class="ua-warn">角色变更立即生效。仅站长可授予「管理员 / 站长」；同级或更高权限的用户不会被修改。</div>
      <div class="modal-actions">
        <button class="ak-btn ak-btn--primary" id="ua-confirm" type="button">确认修改</button>
        <button class="ak-btn ak-btn--ghost" data-close type="button">取消</button>
      </div>`);
    if (!dialog) return;
    dialog.querySelector('#ua-confirm').onclick = async (e) => {
      const btn = e.currentTarget;
      const picked = dialog.querySelector('input[name="ua-new-role"]:checked');
      if (!picked) return;
      const role = picked.value;
      if (single && role === cur) { ctx.toast('角色未变化'); return; }
      btn.disabled = true;
      btn.textContent = '处理中…';
      try {
        // 单个与批量走同一入口，权限校验与审计日志保持一致。
        const r = await ctx.api('/api/admin/users/roles', {
          method: 'POST', body: JSON.stringify({ ids: ids.map(Number), role }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { ctx.toast(d.error || '修改失败'); btn.disabled = false; btn.textContent = '确认修改'; return; }
        const okN = (d.updated || []).length;
        const badN = (d.failed || []).length;
        const reason = badN ? `，跳过 ${badN} 位（${(d.failed[0] || {}).error || '不可修改'}）` : '';
        ctx.toast(`已更新 ${okN} 位${reason}`);
        closeDialog();
        st.selected.clear();
        await load();
      } catch (err) {
        ctx.toast('网络异常，请重试');
        btn.disabled = false;
        btn.textContent = '确认修改';
      }
    };
  }

  /* ---------------- 用户详情 ---------------- */
  function openDetail(id) {
    const u = byId(id);
    if (!u) return;
    const row = (k, v) => `<div class="ua-dl-row"><dt>${E(k)}</dt><dd>${v}</dd></div>`;
    const dialog = openDialog(`
      <div class="modal-title">用户详情</div>
      <div class="modal-sub">#${E(u.id)} · ${E(u.display_name || u.username)}</div>
      <dl class="ua-detail">
        ${row('用户名', '@' + E(u.username))}
        ${row('AMID', E(u.amid || '—'))}
        ${row('邮箱', u.email ? `${E(u.email)}${u.email_verified ? '（已验证）' : '（未验证）'}` : '未填写')}
        ${row('角色', roleBadge(u.role))}
        ${row('注册时间', E(u.created_at || '—'))}
        ${row('提交活动', `${num(u.event_count)} 条 · 待审 ${num(u.pending_count)} 条`)}
        ${row('主办认领', `${num(u.claim_count)} 次`)}
      </dl>
      <div class="ua-subtitle">最近提交的活动</div>
      <div id="ua-events" class="ua-events"><p class="ua-dim">加载中…</p></div>
      <div class="modal-actions"><button class="ak-btn ak-btn--ghost" data-close type="button">关闭</button></div>`);
    if (!dialog) return;
    const box = dialog.querySelector('#ua-events');
    ctx.api(`/api/admin/users/${encodeURIComponent(u.id)}/events`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('加载失败'))))
      .then((d) => {
        if (!document.contains(box)) return; // 弹窗已被关闭
        const items = Array.isArray(d.items) ? d.items : [];
        box.innerHTML = items.length
          ? items.map((ev) => `<div class="ua-event">
              <span class="ua-event-title">${E(ev.title)}</span>
              <span class="ua-event-meta">${E(ev.city || '未知城市')} · ${E(shortDate(ev.start_date || ev.created_at))}</span>
              <span class="badge ${ev.review_status === 'pending' ? 'badge--pending' : ''}">${E({ pending: '待审', approved: '已通过', rejected: '已驳回', merged: '已合并' }[ev.review_status] || ev.review_status || '')}</span>
            </div>`).join('')
          : '<p class="ua-dim">暂无提交记录</p>';
      })
      .catch(() => { if (document.contains(box)) box.innerHTML = '<p class="ua-dim">活动记录加载失败</p>'; });
  }

  /* ---------------- 对外入口 ---------------- */
  window.mountUserAdmin = function (container, options) {
    host = container;
    ctx = options;
    closeDialog();
    // 保留搜索/筛选/排序条件（切走再回来不用重输），但清空选择避免误操作跨页残留。
    st.selected.clear();
    st.page = 1;
    renderShell();
    load();
  };
})();
