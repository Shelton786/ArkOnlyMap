// 自定义头像选择弹窗（自包含，不依赖 app.js）。
// 仅允许森空岛 CDN 头像：画廊来自 window.SKLAND_AVATARS（public/js/skland-avatars.js），
// 或直接粘贴森空岛头像链接；保存走 PUT /api/auth/me，由后端再次校验「仅限森空岛 CDN」。
// 预览与展示统一走 /api/avatar 代理（森空岛有防盗链，不可裸链）。
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // 头像统一经后端代理，绕过森空岛防盗链
  function avatarProxy(u) {
    return u ? '/api/avatar?u=' + encodeURIComponent(u) : null;
  }
  // 前端校验（与后端 parseSklandAvatar 口径一致）；后端为权威
  function validSkland(u) {
    if (typeof u !== 'string' || !u) return false;
    try {
      const url = new URL(u);
      if (url.protocol !== 'https:') return false;
      if (url.hostname !== 'bbs.hycdn.cn' && url.hostname !== 'assets.skland.com') return false;
      if (!/\/avatar\//i.test(url.pathname)) return false;
      return true;
    } catch { return false; }
  }

  // opts: { current?: string|null, onSaved?: (url:string|null)=>void }
  function openAvatarPicker(opts) {
    opts = opts || {};
    const current = opts.current || null;
    const onSaved = typeof opts.onSaved === 'function' ? opts.onSaved : function () {};
    let selected = current; // null 或 Skland 头像 URL

    const list = (window.SKLAND_AVATARS || []);
    const mask = document.createElement('div');
    mask.style.cssText = 'position:fixed;inset:0;background:rgba(3,7,16,.72);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;';

    const galleryHtml = list.map((u) =>
      `<div class="av-opt" data-u="${esc(u)}"><img loading="lazy" src="${esc(avatarProxy(u))}" alt=""></div>`
    ).join('');

    mask.innerHTML = `
      <style>
        .av-modal { width:100%; max-width:460px; max-height:86vh; overflow:auto;
          background:linear-gradient(180deg,rgba(18,32,66,.98),rgba(7,11,22,.98));
          border:1px solid var(--line); border-radius:6px; padding:20px; box-sizing:border-box; }
        .av-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:14px; }
        .av-opt { cursor:pointer; border-radius:6px; overflow:hidden; background:rgba(13,21,48,.6);
          aspect-ratio:1; outline:2px solid transparent; transition:outline-color .1s; }
        .av-opt:hover { outline-color:rgba(74,171,234,.5); }
        .av-opt img { width:100%; height:100%; object-fit:cover; display:block; }
      </style>
      <div class="av-modal">
        <div style="font-family:'Noto Serif SC',serif;color:#fff;font-size:17px;margin-bottom:4px;">更换头像</div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:14px;">仅支持森空岛 CDN 头像</div>
        <div class="av-grid">${galleryHtml}</div>
        <div style="font-size:13px;color:var(--text-dim);margin-bottom:6px;">或粘贴森空岛头像链接</div>
        <input id="av-url" style="width:100%;box-sizing:border-box;padding:9px 11px;border-radius:4px;border:1px solid var(--line);background:rgba(7,11,22,.8);color:#fff;font-size:13px;"
          placeholder="https://bbs.hycdn.cn/asset/avatar/..." value="${esc(current || '')}">
        <div id="av-err" style="color:#ff8080;font-size:12px;margin-top:6px;min-height:16px;"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
          <button id="av-reset" class="ak-btn ak-btn--ghost ak-btn--sm">恢复默认</button>
          <button id="av-cancel" class="ak-btn ak-btn--ghost ak-btn--sm">取消</button>
          <button id="av-save" class="ak-btn ak-btn--primary ak-btn--sm">保存</button>
        </div>
      </div>`;
    document.body.appendChild(mask);

    const err = mask.querySelector('#av-err');
    const inp = mask.querySelector('#av-url');

    function syncSel() {
      mask.querySelectorAll('.av-opt').forEach((el) => {
        el.style.outlineColor = (el.dataset.u === selected) ? 'var(--ak-primary)' : 'transparent';
      });
    }
    mask.querySelectorAll('.av-opt').forEach((el) => {
      el.onclick = () => {
        selected = el.dataset.u;
        if (inp) inp.value = selected;
        err.textContent = '';
        syncSel();
      };
    });
    syncSel();

    inp.oninput = () => {
      const v = inp.value.trim();
      if (v && !validSkland(v)) {
        err.textContent = '链接必须是森空岛 CDN 头像（bbs.hycdn.cn / assets.skland.com 的 /avatar 资源）';
      } else {
        err.textContent = '';
      }
      if (v) selected = v;
      syncSel();
    };

    mask.querySelector('#av-cancel').onclick = () => mask.remove();
    mask.querySelector('#av-reset').onclick = () => { selected = null; inp.value = ''; err.textContent = ''; syncSel(); };
    mask.onclick = (e) => { if (e.target === mask) mask.remove(); };

    mask.querySelector('#av-save').onclick = async () => {
      const v = inp.value.trim();
      if (v && !validSkland(v)) { err.textContent = '链接必须是森空岛 CDN 头像'; return; }
      const payload = v ? { avatar_url: v } : { avatar_url: null };
      const btn = mask.querySelector('#av-save');
      btn.disabled = true; btn.textContent = '保存中…';
      try {
        const r = await fetch('/api/auth/me', {
          method: 'PUT', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { err.textContent = d.error || '保存失败'; btn.disabled = false; btn.textContent = '保存'; return; }
        mask.remove();
        onSaved(v || null);
      } catch (e) {
        err.textContent = '网络错误';
        btn.disabled = false; btn.textContent = '保存';
      }
    };
  }

  window.openAvatarPicker = openAvatarPicker;
})();
