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

export function createApp() {
  const app = new Hono();
  app.use('*', auth.attachUser);

  const APP_TITLE = '舟友同好集会地图';

  // 暴露给前端的最小配置
  app.get('/api/config', (c) => {
    const env = c.env;
    return c.json({
      title: APP_TITLE,
      amapKey: env.AMAP_KEY || '',
      amapSecurityCode: env.AMAP_SECURITY_CODE || '',
      geocodeEnabled: hasKey(env),
    });
  });

  app.get('/api/stats', async (c) => {
    const [events, cities] = await Promise.all([
      db.countEvents(c.env.DB),
      db.allCities(c.env.DB),
    ]);
    return c.json({ events, cities: cities.length });
  });

  // ---------------- 认证 ----------------
  const secret = (c) => c.env.SESSION_SECRET || process.env.SESSION_SECRET || 'arknights-only-map-change-me';
  // 把 users 行整理成前端可用的公开资料（不暴露 password_hash）
  const shapeUser = (u, identities) => ({
    id: u.id,
    username: u.username,
    amid: u.amid,
    email: u.email || null,
    display_name: u.display_name || u.username,
    role: u.role,
    email_verified: !!u.email_verified,
    providers: (identities || []).map((i) => i.provider),
  });

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
    const noUsers = (await db.countUsers(c.env.DB)) === 0;
    const role = noUsers ? 'site_admin' : 'user'; // 首位注册者自动成为站长
    const user = await db.createUser(c.env.DB, {
      username, passwordHash: auth.hashPassword(password), role, email: email || null, displayName: displayName || null,
    });
    // 旧「昵称+密码」登录方式写成一条 password identity，保证登录可用
    await db.createIdentity(c.env.DB, user.id, 'password', username, username, 1);
    const token = auth.issueToken(user, secret(c));
    auth.setSessionCookie(c, token);
    const identities = await db.getIdentities(c.env.DB, user.id);
    return c.json({ user: shapeUser(user, identities), role: user.role });
  });

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const loginId = (body.username || body.email || '').trim();
    const password = body.password || '';
    if (!loginId) return c.json({ error: '请输入昵称或邮箱' }, 400);
    // 邮箱登录名优先，其次昵称
    const user = /@/.test(loginId)
      ? await db.getUserByEmail(c.env.DB, loginId)
      : await db.getUserByName(c.env.DB, loginId);
    if (!user || !auth.verifyPassword(password, user.password_hash)) {
      return c.json({ error: '昵称/邮箱或密码错误' }, 401);
    }
    const token = auth.issueToken(user, secret(c));
    auth.setSessionCookie(c, token);
    const identities = await db.getIdentities(c.env.DB, user.id);
    return c.json({ user: shapeUser(user, identities), role: user.role });
  });

  app.post('/api/auth/logout', (c) => {
    auth.clearSessionCookie(c);
    return c.json({ ok: true });
  });

  app.get('/api/auth/me', async (c) => {
    const u = c.get('user');
    if (!u) return c.json({ user: null });
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
    const u = await db.updateUser(c.env.DB, c.get('user').id, patch);
    const identities = await db.getIdentities(c.env.DB, u.id);
    return c.json({ user: shapeUser(u, identities) });
  });

  // 绑定鹰角通行证（手动 11 位 UID，阶段 A 即可用，无 OAuth）
  app.post('/api/auth/link/hypergryph', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const uid = (body.uid || '').trim();
    if (!/^\d{11}$/.test(uid)) return c.json({ error: '鹰角通行证为 11 位数字 ID' }, 400);
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

  // ---------------- 活动 ----------------
  app.get('/api/events/cities', async (c) => {
    return c.json(await db.allCities(c.env.DB));
  });

  app.get('/api/events', async (c) => {
    const q = c.req.query('q');
    const city = c.req.query('city');
    const province = c.req.query('province');
    const status = c.req.query('status');
    const page = c.req.query('page') ? Number(c.req.query('page')) : 1;
    const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 200;
    const withCoordsOnly = c.req.query('coords') === '1';
    // 管理员可加 ?review=all 查看 rejected；默认仅返回 approved + pending（公开）
    const user = c.get('user');
    const review = c.req.query('review') === 'all' && auth.roleAtLeast(user, 'admin') ? 'all' : 'public';
    return c.json(
      await db.listEvents(c.env.DB, {
        q: q || undefined,
        city: city || undefined,
        province: province || undefined,
        status: status || undefined,
        page,
        limit,
        withCoordsOnly,
        review,
      })
    );
  });

  app.get('/api/events/:id', async (c) => {
    const ev = await db.getEvent(c.env.DB, Number(c.req.param('id')));
    if (!ev) return c.json({ error: '未找到该活动' }, 404);
    return c.json(ev);
  });

  app.post('/api/events', auth.requireAuth, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    if (!body.title || !body.title.trim()) return c.json({ error: '请填写活动名称' }, 400);
    const user = c.get('user');
    const isSupplement = body.submission_type === 'supplement' && body.parent_event_id;
    const review_status = auth.roleAtLeast(user, 'organizer') ? 'approved' : 'pending';
    const data = {
      ...body,
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
    const ev = await db.createEvent(c.env.DB, data);
    return c.json({ ...ev, pending: review_status === 'pending' }, 201);
  });

  app.put('/api/events/:id', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (!auth.canEditEvent(c.get('user'), existing)) {
      return c.json({ error: '无权修改该活动' }, 403);
    }
    const body = await c.req.json().catch(() => ({}));
    const data = { ...body, title: (body.title || existing.title).trim() };
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
    const ev = await db.approveClaim(c.env.DB, id, c.get('user').id);
    return c.json(ev);
  });

  // ---------------- 管理员：审核队列 ----------------
  app.get('/api/admin/review', auth.requireAdminOrAbove, async (c) => {
    return c.json(await db.listPendingEvents(c.env.DB));
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
    return c.json(await db.listUsers(c.env.DB));
  });

  app.post('/api/admin/users/:id/role', auth.requireAdminOrAbove, async (c) => {
    const targetId = Number(c.req.param('id'));
    const caller = c.get('user');
    const body = await c.req.json().catch(() => ({}));
    const newRole = body.role;
    if (!['user', 'organizer', 'admin', 'site_admin'].includes(newRole)) {
      return c.json({ error: '非法角色' }, 400);
    }
    // 权限收敛：admin 不能把自己的权限提到 admin/site_admin 以上；仅 site_admin 可设 admin/site_admin
    if (!auth.roleAtLeast(caller, 'site_admin') && (newRole === 'admin' || newRole === 'site_admin')) {
      return c.json({ error: '仅站长可授予管理员/站长角色' }, 403);
    }
    const target = await db.getUserById(c.env.DB, targetId);
    if (!target) return c.json({ error: '用户不存在' }, 404);
    const u = await db.setUserRole(c.env.DB, targetId, newRole);
    return c.json({ user: { id: u.id, username: u.username, amid: u.amid, role: u.role } });
  });

  // 仅更新坐标（浏览器端地理编码后回写；任何登录用户均可校正）
  app.post('/api/events/:id/coords', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    const body = await c.req.json().catch(() => ({}));
    const lng = Number(body.longitude);
    const lat = Number(body.latitude);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return c.json({ error: '坐标无效' }, 400);
    await db.saveCoords(c.env.DB, id, lng, lat);
    return c.json({ ok: true });
  });

  // ---------------- 管理员：导入 / 工具 ----------------
  app.post('/api/admin/import', auth.requireAdmin, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];
    let added = 0, skipped = 0;
    for (const it of items) {
      if (!it.title || !it.title.trim()) { skipped++; continue; }
      await db.createEvent(c.env.DB, { ...it, title: it.title.trim(), submitted_by: c.get('user').id });
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
