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
 * 舟友同好集会地图 —— 后端应用（Hono，运行于 Cloudflare Pages Functions）
 *
 * 通过 hono/cloudflare-pages 适配器挂载；运行时由 c.env 注入绑定：
 *  - DB        : D1 数据库
 *  - AMAP_KEY  : 高德 JS API Key（下发前端）
 *  - AMAP_SECURITY_CODE : 高德 2.0 安全密钥
 *  - AMAP_WEB_KEY / AMAP_WEB_SECRET : 服务端地理编码用
 *  - SESSION_SECRET : 会话签名密钥
 */
import { Hono } from 'hono';
import * as db from './db-d1.js';
import * as auth from './auth.js';
import { geocode, geocodeBatch, hasKey } from './geocode.js';
import { edgeCache } from './edge-cache.js';

export function createApp() {
  const app = new Hono();
  app.use('*', auth.attachUser);
  app.use('/api/*', auth.csrfProtect);

  // 用户可通过 API 提交 / 编辑的业务字段白名单。审核状态、认领、核实、溯源、提交者
  // 等列一律由服务端决定：若接受请求体透传，普通用户可自带
  // organizer_claim_status='approved' 伪造「已认领」，从而绕过 canEditEvent 的权限判断。
  const EVENT_INPUT_FIELDS = [
    'title', 'start_date', 'end_date', 'country', 'province', 'city', 'district',
    'venue', 'address', 'longitude', 'latitude', 'description', 'organizer',
    'source_url', 'poster_url', 'tags',
  ];
  function pickEventInput(body) {
    const out = {};
    for (const k of EVENT_INPUT_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
    }
    return out;
  }

  const APP_TITLE = '舟友同好集会地图';

  // 暴露给前端的最小配置。AMAP_SECURITY_CODE 绝不下发：
  // 前端走 /_AMapService 代理，安全密钥由服务端附加（functions/_AMapService/[[path]].js）。
  app.get('/api/config', (c) => {
    const env = c.env;
    return c.json({
      title: APP_TITLE,
      amapKey: env.AMAP_KEY || '',
      geocodeEnabled: hasKey(env),
    });
  });

  app.get('/api/stats', async (c) => {
    // 公开统计，与登录态/query 无关：缓存键去掉 query，防随机参数制造缓存垃圾
    const u = new URL(c.req.url);
    return edgeCache(u.origin + u.pathname, 300, async () => {
      const [events, cities] = await Promise.all([
        db.countEvents(c.env.DB),
        db.allCities(c.env.DB),
      ]);
      return c.json({ events, cities: cities.length });
    });
  });

  // ---------------- 认证 ----------------
  // 与 auth.secretOf 保持一致：未配置 SESSION_SECRET 时抛错，绝不使用代码内默认密钥
  const secret = (c) => {
    const s = c.env.SESSION_SECRET || process.env.SESSION_SECRET;
    if (!s) throw new Error('SESSION_SECRET 未配置：请在 .dev.vars / Pages 环境变量中设置随机长字符串');
    return s;
  };
  // 把 users 行整理成前端可用的公开资料（不暴露 password_hash）
  const shapeUser = (u, identities) => ({
    id: u.id,
    username: u.username,
    amid: u.amid,
    email: u.email || null,
    display_name: u.display_name || u.username,
    role: u.role,
    avatar_url: u.avatar_url || null,
    email_verified: !!u.email_verified,
    providers: (identities || []).map((i) => i.provider),
  });

  // 校验头像 URL 必须来自森空岛 CDN（bbs.hycdn.cn 或 assets.skland.com 的 /avatar 资源）。
  // 返回规范化后的 URL，非法则 null。用于「自定义头像仅限森空岛 CDN」限制 + /api/avatar 代理防 SSRF。
  const parseSklandAvatar = (raw) => {
    if (typeof raw !== 'string' || !raw) return null;
    let url;
    try { url = new URL(raw); } catch { return null; }
    if (url.protocol !== 'https:') return null;
    if (url.hostname !== 'bbs.hycdn.cn' && url.hostname !== 'assets.skland.com') return null;
    if (!/\/avatar\//i.test(url.pathname)) return null;
    return url.href;
  };

  app.post('/api/auth/register', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = body.password || '';
    const email = (body.email || '').trim();
    const displayName = (body.display_name || '').trim();
    if (username.length < 2 || username.length > 20) return c.json({ error: '昵称长度需 2-20 个字符' }, 400);
    if (password.length < 6) return c.json({ error: '密码至少 6 位' }, 400);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: '邮箱格式不正确' }, 400);
    if (await db.getUserByName(c.env.DB, username)) return c.json({ error: '该昵称已被注册' }, 409);
    if (email && (await db.getUserByEmail(c.env.DB, email))) return c.json({ error: '该邮箱已被注册' }, 409);
    // 首位注册者自动成为站长：LIMIT 1 存在性检查（1 行读），
    // 不用 COUNT(*) 全表扫——users 表随注册增长，全表扫每次注册烧 N 行读额度
    const noUsers = !(await db.hasAnyUser(c.env.DB));
    const role = noUsers ? 'site_admin' : 'user'; // 首位注册者自动成为站长
    const user = await db.createUser(c.env.DB, {
      username, passwordHash: auth.hashPassword(password), role, email: email || null, displayName: displayName || null,
    });
    // 旧「昵称+密码」登录方式写成一条 password identity，保证登录可用
    await db.createIdentity(c.env.DB, user.id, 'password', username, username, 1);
    const token = auth.issueToken(user, secret(c));
    auth.setSessionCookie(c, token);
    auth.setCsrfCookie(c);
    const identities = await db.getIdentities(c.env.DB, user.id);
    return c.json({ user: shapeUser(user, identities), role: user.role });
  });

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const loginId = (body.username || body.email || '').trim();
    const password = body.password || '';
    if (!loginId) return c.json({ error: '请输入昵称或邮箱' }, 400);
    // 登录限流：按 IP+账号 计数，10 次失败锁 15 分钟
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const throttleKey = `${ip}|${loginId.toLowerCase()}`;
    const th = await db.getLoginThrottle(c.env.DB, throttleKey);
    if (th && th.locked_until && new Date(th.locked_until).getTime() > Date.now()) {
      const mins = Math.ceil((new Date(th.locked_until).getTime() - Date.now()) / 60000);
      return c.json({ error: `失败次数过多，请约 ${mins} 分钟后再试` }, 429);
    }
    if (th && th.locked_until) await db.clearLoginThrottle(c.env.DB, throttleKey); // 锁已过期，重置
    // 邮箱登录名优先，其次昵称
    const user = /@/.test(loginId)
      ? await db.getUserByEmail(c.env.DB, loginId)
      : await db.getUserByName(c.env.DB, loginId);
    if (!user || !auth.verifyPassword(password, user.password_hash)) {
      const fails = await db.recordLoginFail(c.env.DB, throttleKey);
      if (fails >= 10) return c.json({ error: '失败次数过多，账号已临时锁定 15 分钟' }, 429);
      return c.json({ error: `昵称/邮箱或密码错误（还可尝试 ${10 - fails} 次）` }, 401);
    }
    await db.clearLoginThrottle(c.env.DB, throttleKey);
    const token = auth.issueToken(user, secret(c));
    auth.setSessionCookie(c, token);
    auth.setCsrfCookie(c);
    const identities = await db.getIdentities(c.env.DB, user.id);
    return c.json({ user: shapeUser(user, identities), role: user.role });
  });

  app.post('/api/auth/logout', (c) => {
    auth.clearSessionCookie(c);
    auth.clearCsrfCookie(c);
    return c.json({ ok: true });
  });

  app.get('/api/auth/me', async (c) => {
    const u = c.get('user');
    if (!u) return c.json({ user: null });
    // 已登录但缺 CSRF Cookie（如本次上线前的旧会话），补发一枚
    if (!(c.req.header('Cookie') || '').includes(`${auth.CSRF_COOKIE}=`)) auth.setCsrfCookie(c);
    const identities = await db.getIdentities(c.env.DB, u.id);
    return c.json({ user: shapeUser(u, identities) });
  });

  // 修改展示名 / 邮箱（邮箱验证阶段 C 再做，当前改邮箱即重置 email_verified=0）
  app.put('/api/auth/me', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const patch = {};
    if (typeof body.display_name === 'string') {
      const dn = body.display_name.trim();
      if (dn.length < 1 || dn.length > 30) return c.json({ error: '展示名长度需 1-30 个字符' }, 400);
      patch.displayName = dn;
    }
    if (body.email !== undefined) {
      const email = (body.email || '').trim();
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: '邮箱格式不正确' }, 400);
      if (email && (await db.getUserByEmail(c.env.DB, email)) && email !== c.get('user').email) {
        return c.json({ error: '该邮箱已被注册' }, 409);
      }
      patch.email = email;
    }
    if (body.avatar_url !== undefined) {
      if (body.avatar_url === null || body.avatar_url === '') {
        patch.avatarUrl = null; // 恢复默认（清空自定义头像）
      } else {
        const sk = parseSklandAvatar(body.avatar_url);
        if (!sk) {
          return c.json({ error: '头像仅支持森空岛 CDN 图片（bbs.hycdn.cn / assets.skland.com 的 /avatar 资源）' }, 400);
        }
        patch.avatarUrl = sk;
      }
    }
    const u = await db.updateUser(c.env.DB, c.get('user').id, patch);
    const identities = await db.getIdentities(c.env.DB, u.id);
    return c.json({ user: shapeUser(u, identities) });
  });

  // 森空岛头像代理：森空岛 CDN 有防盗链（带本站 Referer 返回 403），
  // 故由服务端取图并流式返回；同时再次校验目标仅限森空岛 CDN，防止被当开放代理/SSRF。
  app.get('/api/avatar', async (c) => {
    const target = parseSklandAvatar(c.req.query('u'));
    if (!target) return c.text('invalid avatar url', 400);
    try {
      const r = await fetch(target, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.skland.com/' },
      });
      if (!r.ok) return c.text('upstream error', 502);
      const buf = await r.arrayBuffer();
      // 森空岛 CDN 对多数头像返回 application/octet-stream（实为 webp），
      // 浏览器可能因 MIME 拒渲染，统一改为 image/webp 以保证显示。
      const upstreamCt = (r.headers.get('content-type') || '').toLowerCase();
      const ct = upstreamCt.startsWith('image/') ? upstreamCt : 'image/webp';
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': ct,
          'Content-Length': String(buf.byteLength),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      return c.text('fetch error', 502);
    }
  });

  // 绑定鹰角通行证（手动 UID，阶段 A 即可用，无 OAuth）
  // 至少 8 位数字：老玩家 UID 为 8 位，新玩家 9-11 位（2026-11-11 用户反馈 8 位无法绑定后放宽）
  app.post('/api/auth/link/hypergryph', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const uid = (body.uid || '').trim();
    if (!/^\d{8,}$/.test(uid)) return c.json({ error: '鹰角通行证 UID 需为至少 8 位数字' }, 400);
    const exist = await db.getIdentity(c.env.DB, 'hypergryph', uid);
    if (exist && exist.user_id !== c.get('user').id) return c.json({ error: '该鹰角通行证已被其他账户绑定' }, 409);
    await db.createIdentity(c.env.DB, c.get('user').id, 'hypergryph', uid, uid, 0);
    const u = await db.getUserById(c.env.DB, c.get('user').id);
    const identities = await db.getIdentities(c.env.DB, u.id);
    return c.json({ user: shapeUser(u, identities) });
  });

  app.delete('/api/auth/link/:provider', auth.requireAuth, async (c) => {
    const provider = c.req.param('provider');
    if (provider === 'password') return c.json({ error: '密码登录方式不可解绑' }, 400);
    await db.deleteIdentity(c.env.DB, c.get('user').id, provider);
    const u = await db.getUserById(c.env.DB, c.get('user').id);
    const identities = await db.getIdentities(c.env.DB, u.id);
    return c.json({ user: shapeUser(u, identities) });
  });

  // 修改密码
  app.post('/api/auth/password', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const oldPwd = body.old_password || '';
    const newPwd = body.new_password || '';
    if (typeof oldPwd !== 'string' || typeof newPwd !== 'string' || !oldPwd || !newPwd) {
      return c.json({ error: '请填写当前密码和新密码' }, 400);
    }
    if (newPwd.length < 6 || newPwd.length > 128) return c.json({ error: '新密码需为 6-128 位' }, 400);
    // 不能复用 db.getUserById：它只投影公开字段，password_hash 恒为 undefined，
    // 会让 verifyPassword 永远返回 false —— 改密码因此对所有用户失效（2026-11-12 修复）。
    const hash = await db.getPasswordHashById(c.env.DB, c.get('user').id);
    if (!hash || !auth.verifyPassword(oldPwd, hash)) return c.json({ error: '当前密码错误' }, 401);
    await db.setPasswordHash(c.env.DB, c.get('user').id, auth.hashPassword(newPwd));
    // 前端提示「请重新登录」，服务端同步注销当前会话与 CSRF Cookie，避免改完密码
    // 页面仍保持登录态造成误解。其它设备上的旧 token 为无状态签名，暂无法即时吊销。
    auth.clearSessionCookie(c);
    auth.clearCsrfCookie(c);
    return c.json({ ok: true });
  });

  // ---------------- 活动 ----------------
  app.get('/api/events/cities', async (c) => {
    // 城市聚合是 D1 读行大户（全表 GROUP BY，前端每次加载都请求）：
    // 公开数据、与登录态/query 无关，边缘缓存 300s，缓存键去掉 query。
    const u = new URL(c.req.url);
    return edgeCache(u.origin + u.pathname, 300, async () => c.json(await db.allCities(c.env.DB)));
  });

  // 公开用户主页资料（前端 /account/{amid} 调用）；不含密码/邮箱等敏感信息
  // 返回：user(公开字段 + is_self + 鹰角通行证绑定状态) + hosted(认领主办) + contributed(分享情报)
  app.get('/api/users/:amid', async (c) => {
    const amid = c.req.param('amid');
    const u = await db.getUserByAmid(c.env.DB, amid);
    if (!u) return c.json({ error: '用户不存在' }, 404);
    const me = c.get('user');
    const isSelf = !!(me && me.id === u.id);
    const identities = await db.getIdentities(c.env.DB, u.id);
    const hypergryphBound = (identities || []).some((i) => i.provider === 'hypergryph');
    const hypergryphUid = (identities || []).find((i) => i.provider === 'hypergryph');
    const hosted = await db.getHostedEvents(c.env.DB, u.id, isSelf ? 'all' : 'public');
    const contributed = await db.getContributedEvents(c.env.DB, u.id, isSelf ? 'all' : 'public');
    return c.json({
      user: {
        amid: u.amid,
        display_name: u.display_name || u.username,
        role: u.role,
        avatar_url: u.avatar_url || null,
        joined_at: u.created_at,
        is_self: isSelf,
        hypergryph_bound: hypergryphBound,
        // 鹰角通行证 UID：公开展示（类似 AMID 的公开游戏 ID 铭牌）
        hypergryph_uid: hypergryphUid ? hypergryphUid.provider_account_id : null,
        // 邮箱：仅本人可见，避免泄露他人隐私
        email: isSelf ? (u.email || null) : null,
      },
      hosted,
      contributed,
    });
  });

  app.get('/api/events', async (c) => {
    const q = c.req.query('q');
    const city = c.req.query('city');
    const province = c.req.query('province');
    const status = c.req.query('status');
    const rawPage = c.req.query('page') ? Number(c.req.query('page')) : 1;
    const rawLimit = c.req.query('limit') ? Number(c.req.query('limit')) : 200;
    // 收敛分页参数：limit 无上界时 ?limit=1000000 会放大 D1 读行并把巨大响应塞进边缘缓存
    const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
    const limit = Number.isFinite(rawLimit) ? Math.min(500, Math.max(1, Math.floor(rawLimit))) : 200;
    const withCoordsOnly = c.req.query('coords') === '1';
    // 管理员可加 ?review=all 查看 rejected；默认仅返回 approved + pending（公开）
    const user = c.get('user');
    const review = c.req.query('review') === 'all' && auth.roleAtLeast(user, 'admin') ? 'all' : 'public';
    // 边缘缓存：Pages Functions 的动态响应不会被 CDN 自动缓存（仅设 s-maxage 无效），
    // 必须用 Cache API 显式缓存。仅公开变体可缓存（listEvents 不传 userId，响应与登录态无关）；
    // review=all 含驳回数据，若入缓存会经同 URL 泄露给普通用户，必须 no-store。
    // 带时间戳的绕过请求（写操作后刷新）只读不存，避免产生一次性缓存垃圾。
    // 含 review=all 的 URL 一律不缓存：非管理员请求它会降级为公开数据，若落缓存，
    // 管理员随后请求同 URL 会命中这份缺驳回数据的响应。
    // max-age=0 保证浏览器不本地缓存；s-maxage=300 即边缘 TTL（Cache API 不支持 SWR）。
    // TTL 从 60s 延长到 300s：D1 免费额度为每天 500 万行读（超额硬停），持续流量下
    // 60s 几乎每分钟穿透一次（实测 ~1440 次/天）；300s 降到 ~288 次/天。
    // 操作者写后经 fresh:true 时间戳绕过，本人即时可见；其他访客最多延迟 5 分钟。
    const cacheable = review === 'public' && c.req.query('review') !== 'all' && c.req.query('_') === undefined;
    const cacheKey = new Request(c.req.url, { method: 'GET' });
    if (cacheable) {
      try {
        const hit = await caches.default.match(cacheKey);
        if (hit) {
          const res = new Response(hit.body, hit);
          res.headers.set('X-Edge-Cache', 'HIT');
          return res;
        }
      } catch (e) { console.warn('edge cache match failed:', e.message); }
    }
    const data = await db.listEvents(c.env.DB, {
      q: q || undefined,
      city: city || undefined,
      province: province || undefined,
      status: status || undefined,
      page,
      limit,
      withCoordsOnly,
      review,
    });
    const res = c.json(data);
    // 头与行为一致：只有真正入缓存的公开变体才声明 s-maxage；
    // review=all（无论角色）与时间戳绕过一律 no-store
    res.headers.set('Cache-Control', cacheable ? 'public, max-age=0, s-maxage=300' : 'no-store');
    if (cacheable) {
      res.headers.set('X-Edge-Cache', 'MISS');
      try { await caches.default.put(cacheKey, res.clone()); }
      catch (e) { console.warn('edge cache put failed:', e.message); }
    }
    return res;
  });

  // 详情接口原先既不过滤 review_status、又直接返回 c.*，枚举 id 就能读到
  // 被驳回 / 已合并的记录及提交者 AMID、认领人 id 等内部列。列表接口只放公开状态，
  // 这里与之对齐：非管理员仅可见 approved / pending，且只拿到展示所需字段。
  const PUBLIC_EVENT_FIELDS = [
    'id', 'title', 'start_date', 'end_date', 'country', 'province', 'city', 'district',
    'venue', 'address', 'longitude', 'latitude', 'description', 'organizer',
    'source_url', 'poster_url', 'verified', 'tags', 'status', 'review_status',
    'submission_type', 'parent_event_id', 'organizer_claim_status',
    'submitted_by_name', 'submitted_by_amid', 'organizer_user_name', 'organizer_user_amid',
    'source', 'created_at', 'updated_at',
  ];
  function publicEvent(ev) {
    const out = {};
    for (const k of PUBLIC_EVENT_FIELDS) if (k in ev) out[k] = ev[k];
    return out;
  }

  app.get('/api/events/:id', async (c) => {
    const ev = await db.getEvent(c.env.DB, Number(c.req.param('id')));
    if (!ev) return c.json({ error: '未找到该活动' }, 404);
    const isAdmin = auth.roleAtLeast(c.get('user'), 'admin');
    // 用 404 而非 403，避免暴露「该 id 存在但不可见」
    if (!isAdmin && !['approved', 'pending'].includes(ev.review_status)) {
      return c.json({ error: '未找到该活动' }, 404);
    }
    return c.json(isAdmin ? ev : publicEvent(ev));
  });

  app.post('/api/events', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    if (!body.title || !body.title.trim()) return c.json({ error: '请填写活动名称' }, 400);
    const user = c.get('user');
    const isSupplement = body.submission_type === 'supplement' && body.parent_event_id;
    const review_status = auth.roleAtLeast(user, 'organizer') ? 'approved' : 'pending';
    const data = {
      ...pickEventInput(body),
      title: body.title.trim(),
      submitted_by: user.id,
      review_status,
      submission_type: isSupplement ? 'supplement' : 'new',
      parent_event_id: isSupplement ? Number(body.parent_event_id) : null,
    };
    if ((data.longitude == null || data.latitude == null) && data.address && hasKey(c.env)) {
      const g = await geocode(data.address, data.city, c.env);
      if (g) { data.longitude = g.longitude; data.latitude = g.latitude; }
    }
    try {
      const ev = await db.createEvent(c.env.DB, data);
      return c.json({ ...ev, pending: review_status === 'pending' }, 201);
    } catch (e) {
      console.error('createEvent failed:', e);
      return c.json({ error: '提交失败，请稍后重试' }, 500);
    }
  });

  app.put('/api/events/:id', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (!auth.canEditEvent(c.get('user'), existing)) {
      return c.json({ error: '无权修改该活动' }, 403);
    }
    const body = await c.req.json().catch(() => ({}));
    const data = { ...pickEventInput(body), title: (body.title || existing.title).trim() };
    if ((data.longitude == null || data.latitude == null) && data.address && hasKey(c.env) && (!existing.longitude && !existing.latitude)) {
      const g = await geocode(data.address, data.city, c.env);
      if (g) { data.longitude = g.longitude; data.latitude = g.latitude; }
    }
    const ev = await db.updateEvent(c.env.DB, id, data);
    return c.json(ev);
  });

  app.delete('/api/events/:id', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (!auth.canDeleteEvent(c.get('user'), existing)) {
      return c.json({ error: '无权删除该活动' }, 403);
    }
    await db.deleteEvent(c.env.DB, id);
    return c.json({ ok: true });
  });

  // ---------------- 主办认领 ----------------
  app.post('/api/events/:id/claim', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (existing.organizer_claim_status !== 'none') return c.json({ error: '该活动已有认领申请' }, 409);
    const ev = await db.requestClaim(c.env.DB, id, c.get('user').id);
    return c.json(ev);
  });

  app.post('/api/events/:id/claim/approve', auth.requireAdminOrAbove, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (existing.organizer_claim_status !== 'pending') return c.json({ error: '没有待审核的认领' }, 409);
    // 通过认领：活动归给发起认领的用户（organizer_claim_user_id），而非审核管理员
    const ev = await db.approveClaim(c.env.DB, id);
    return c.json(ev);
  });

  app.post('/api/events/:id/claim/reject', auth.requireAdminOrAbove, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (existing.organizer_claim_status !== 'pending') return c.json({ error: '没有待审核的认领' }, 409);
    const ev = await db.rejectClaim(c.env.DB, id);
    return c.json(ev);
  });

  // ---------------- 管理员：审核队列 ----------------
  // 补充类型的字段中文名（生成 diff 用）
  const DIFF_LABELS = {
    title: '名称', start_date: '开始日期', end_date: '结束日期', province: '省份', city: '城市',
    district: '区县', country: '国家/地区', venue: '场馆', address: '地址', organizer: '主办',
    source_url: '来源链接', poster_url: '海报', description: '介绍', tags: '标签',
  };
  // 对比补充行与原活动，产出非空且发生变化的字段列表
  function diffSupplement(parent, sup) {
    const norm = (v) => (Array.isArray(v) ? v.join('、') : (v == null ? '' : String(v)));
    const out = [];
    for (const [k, label] of Object.entries(DIFF_LABELS)) {
      const from = norm(parent[k]);
      const to = norm(sup[k]);
      if (to !== '' && to !== from) out.push({ field: k, label, from: from || '（空）', to });
    }
    return out;
  }
  app.get('/api/admin/review', auth.requireAdminOrAbove, async (c) => {
    const list = await db.listPendingEvents(c.env.DB);
    // 补充类型附带与原活动的字段差异，管理员直接看到「改了什么」
    const enriched = [];
    for (const ev of list) {
      if (ev.submission_type === 'supplement' && ev.parent_event_id) {
        const parent = await db.getEvent(c.env.DB, ev.parent_event_id);
        enriched.push({ ...ev, _diff: parent ? diffSupplement(parent, ev) : [] });
      } else {
        enriched.push(ev);
      }
    }
    return c.json(enriched);
  });

  // 待审认领（主办认领申请）
  app.get('/api/admin/claims', auth.requireAdminOrAbove, async (c) => {
    return c.json(await db.listPendingClaims(c.env.DB));
  });

  app.post('/api/admin/review/:id', auth.requireAdminOrAbove, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (existing.review_status !== 'pending') return c.json({ error: '该活动不在待审核状态' }, 409);
    const body = await c.req.json().catch(() => ({}));
    const action = body.action || 'approve';
    let ev;
    if (action === 'reject') {
      ev = await db.rejectEvent(c.env.DB, id);
    } else if (existing.submission_type === 'supplement') {
      ev = await db.mergeSupplement(c.env.DB, id); // 补充通过 → 合并进原活动
    } else {
      ev = await db.approveNewEvent(c.env.DB, id); // 新建通过 → 转 approved
    }
    return c.json({ event: ev, action });
  });

  // ---------------- 管理员：用户管理 ----------------
  app.get('/api/admin/users', auth.requireAdminOrAbove, async (c) => {
    // 用户量上来后不再一次拉全量：分页 + 关键词 + 角色 + 排序，均由 SQL 完成。
    const rawPage = c.req.query('page') ? Number(c.req.query('page')) : 1;
    const rawLimit = c.req.query('limit') ? Number(c.req.query('limit')) : 20;
    const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
    const limit = Number.isFinite(rawLimit) ? Math.min(200, Math.max(1, Math.floor(rawLimit))) : 20;
    const q = (c.req.query('q') || '').trim().slice(0, 64);
    const data = await db.listUsers(c.env.DB, {
      q: q || undefined,
      role: c.req.query('role'),
      sort: c.req.query('sort'),
      page,
      limit,
    });
    // 响应含邮箱 / AMID 等个人信息，不进边缘缓存，也不允许浏览器本地缓存。
    const res = c.json(data);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  });

  // 角色变更的三条硬规则由单条 / 批量两个入口共用，避免逻辑漂移。
  function validateNewRole(caller, newRole) {
    if (!db.USER_ROLES.includes(newRole)) return { status: 400, error: '非法角色' };
    // 权限收敛：仅 site_admin 可授予 admin / site_admin
    if (!auth.roleAtLeast(caller, 'site_admin') && (newRole === 'admin' || newRole === 'site_admin')) {
      return { status: 403, error: '仅站长可授予管理员/站长角色' };
    }
    return null;
  }
  function canChangeUser(caller, target) {
    // 不能改自己 / 同级 / 更高权限，否则 admin 可把唯一站长降为 user 夺取最高权限。
    return (auth.ROLE_RANK[target.role] ?? -1) < (auth.ROLE_RANK[caller.role] ?? -1);
  }

  app.post('/api/admin/users/:id/role', auth.requireAdminOrAbove, async (c) => {
    const targetId = Number(c.req.param('id'));
    const caller = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const problem = validateNewRole(caller, body.role);
    if (problem) return c.json({ error: problem.error }, problem.status);
    const target = await db.getUserById(c.env.DB, targetId);
    if (!target) return c.json({ error: '用户不存在' }, 404);
    if (!canChangeUser(caller, target)) {
      return c.json({ error: '不能修改同级或更高权限的用户（含自己）' }, 403);
    }
    const u = await db.setUserRole(c.env.DB, targetId, body.role);
    return c.json({ user: { id: u.id, username: u.username, amid: u.amid, role: u.role } });
  });

  // 批量改角色：逐条校验、部分成功也返回结果，前端据此提示哪几条被跳过。
  app.post('/api/admin/users/roles', auth.requireAdminOrAbove, async (c) => {
    const caller = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const problem = validateNewRole(caller, body.role);
    if (problem) return c.json({ error: problem.error }, problem.status);
    const ids = Array.isArray(body.ids)
      ? [...new Set(body.ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))]
      : [];
    if (!ids.length) return c.json({ error: '未选择用户' }, 400);
    if (ids.length > 50) return c.json({ error: '单次最多修改 50 位用户' }, 400);
    const updated = [], failed = [];
    for (const id of ids) {
      try {
        const target = await db.getUserById(c.env.DB, id);
        if (!target) { failed.push({ id, error: '用户不存在' }); continue; }
        if (!canChangeUser(caller, target)) {
          failed.push({ id, error: '不能修改同级或更高权限的用户' }); continue;
        }
        await db.setUserRole(c.env.DB, id, body.role);
        updated.push({ id, role: body.role });
        console.log(`role changed: user=${id} ${target.role}->${body.role} by=${caller.id}`);
      } catch (e) {
        failed.push({ id, error: '写入失败' });
      }
    }
    return c.json({ updated, failed });
  });

  // 用户详情面板：该用户最近提交的活动（含补充情报），只读。
  app.get('/api/admin/users/:id/events', auth.requireAdminOrAbove, async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) return c.json({ error: '用户 ID 无效' }, 400);
    return c.json({ items: await db.listUserEvents(c.env.DB, id, 20) });
  });

  // 仅更新坐标（浏览器端地理编码后回写；任何登录用户均可校正）
  app.post('/api/events/:id/coords', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    const body = await c.req.json().catch(() => ({}));
    const lng = Number(body.longitude);
    const lat = Number(body.latitude);
    // 原本只挡 NaN，999/999 这类明显错误或恶意坐标也能写进库，会把地图标记打到境外。
    // 这里按合法经纬度范围校验（保留海外展会，不做中国境内限定）。
    if (!Number.isFinite(lng) || !Number.isFinite(lat) ||
        lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return c.json({ error: '坐标无效：经度需 -180~180，纬度需 -90~90' }, 400);
    }
    await db.saveCoords(c.env.DB, id, lng, lat);
    // 留下操作者痕迹，便于在 Workers 日志里追溯误改
    console.log(`coords updated: event=${id} by=${c.get('user').id}`);
    return c.json({ ok: true });
  });

  // ---------------- 管理员：导入 / 工具 ----------------
  app.post('/api/admin/import', auth.requireAdmin, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];
    let added = 0, skipped = 0;
    for (const it of items) {
      if (!it.title || !it.title.trim()) { skipped++; continue; }
      await db.createEvent(c.env.DB, {
        ...pickEventInput(it),
        title: it.title.trim(),
        submitted_by: c.get('user').id,
        review_status: 'approved', // 管理员导入无需再审；db 层默认值为 pending
      });
      added++;
    }
    return c.json({ added, skipped });
  });

  app.post('/api/admin/geocode-missing', auth.requireAdmin, async (c) => {
    if (!hasKey(c.env)) return c.json({ error: '未配置高德 Key，无法地理编码' }, 400);
    const rows = await db.getMissingCoords(c.env.DB);
    if (!rows.length) return c.json({ scanned: 0, geocoded: 0 });
    const results = await geocodeBatch(
      rows.map((r) => ({ address: r.address, city: r.city })),
      c.env
    );
    let done = 0;
    for (let i = 0; i < rows.length; i++) {
      if (results[i]) {
        await db.saveCoords(c.env.DB, rows[i].id, results[i].longitude, results[i].latitude);
        done++;
      }
    }
    return c.json({ scanned: rows.length, geocoded: done });
  });

  return app;
}
