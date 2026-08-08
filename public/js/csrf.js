/*
 * ArkOnlyMap —— CSRF 防护（双提交 Cookie 的前端半边）
 * 包装 window.fetch：对同源的写操作（POST/PUT/DELETE/PATCH）自动附加
 * X-CSRF-Token 头，取值自非 HttpOnly 的 ark_csrf Cookie（登录时由服务端下发）。
 * 必须在其他脚本之前引入。
 */
(function () {
  if (window.__arkCsrfPatched) return;
  window.__arkCsrfPatched = true;
  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  const origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    init = init || {};
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
    if (!SAFE_METHODS.has(method) && typeof url === 'string' && url.startsWith('/')) {
      const m = document.cookie.match(/(?:^|;\s*)ark_csrf=([^;]+)/);
      if (m) {
        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
        if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', decodeURIComponent(m[1]));
        init.headers = headers;
      }
    }
    return origFetch(input, init);
  };
})();
