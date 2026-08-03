// Cloudflare Pages Functions —— 个人主页路由
// 将 /account/{amid}（如 /account/AM-12345678）映射到静态页 public/profile.html。
// 页面本身不含 amid（前端从 location.pathname 读取并调用 /api/users/:amid）。
export const onRequest = async ({ env, request, params }) => {
  const amid = params.amid || '';
  // 校验 amid 格式，避免无意义请求打进静态资源
  if (!/^AM-\d{8}$/.test(amid)) {
    return new Response('无效的用户主页地址', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  // 读取部署后的静态资源
  const assetUrl = new URL('/profile.html', request.url);
  const res = await env.ASSETS.fetch(new Request(assetUrl));
  if (!res || !res.ok) {
    return new Response('页面不存在', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  // 原样返回 profile.html；前端脚本会读取 pathname 中的 amid
  return res;
};
