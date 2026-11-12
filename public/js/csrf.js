/*
 * ArkOnlyMap —— CSRF 防护（双提交 Cookie 的前端半边）
 * 包装 window.fetch：对同源的写操作（POST/PUT/DELETE/PATCH）自动附加
 * X-CSRF-Token 头，取值自非 HttpOnly 的 ark_csrf Cookie（登录时由服务端下发）。
 * 老会话（CSRF 上线前登录）或 Cookie 被清理时，先请求 /api/auth/me 让服务端
 * 补发一枚再重试，避免用户遇到 403「请求校验失败」却无从下手。
 * 必须在其他脚本之前引入。
 */
(function () {
  if (window.__arkCsrfPatched) return;
  window.__arkCsrfPatched = true;
  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  // 服务端对登录 / 注册豁免 CSRF，此时也还没有会话，无需补发
  const EXEMPT_PATHS = new Set(['/api/auth/login', '/api/auth/register']);
  const origFetch = window.fetch.bind(window);
  const readToken = () => {
    const m = document.cookie.match(/(?:^|;\s*)ark_csrf=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };
  window.fetch = function (input, init) {
    init = init || {};
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
    if (SAFE_METHODS.has(method) || typeof url !== 'string' || !url.startsWith('/')) {
      return origFetch(input, init);
    }
    const path = url.split('?')[0];
    if (EXEMPT_PATHS.has(path)) return origFetch(input, init);

    const send = (token) => {
      if (token) {
        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
        if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', token);
        init.headers = headers;
      }
      return origFetch(input, init);
    };
    const token = readToken();
    if (token) return send(token);
    // 补发失败也不阻塞原请求：服务端会返回可读的 403，由调用方提示刷新
    return origFetch('/api/auth/me', { credentials: 'same-origin' })
      .then(() => send(readToken()), () => send(readToken()));
  };
})();
