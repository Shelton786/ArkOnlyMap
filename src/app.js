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
  app.post('/api/auth/register', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = body.password || '';
    if (username.length < 2 || username.length > 20) return c.json({ error: '昵称长度需 2-20 个字符' }, 400);
    if (password.length < 6) return c.json({ error: '密码至少 6 位' }, 400);
    if (await db.getUserByName(c.env.DB, username)) return c.json({ error: '该昵称已被注册' }, 409);
    const noUsers = (await db.countUsers(c.env.DB)) === 0;
    const role = noUsers ? 'admin' : 'user'; // 首位注册者自动成为管理员
    const user = await db.createUser(c.env.DB, username, auth.hashPassword(password), role);
    const token = auth.issueToken(user, (c.env.SESSION_SECRET || process.env.SESSION_SECRET || ''));
    auth.setSessionCookie(c, token);
    return c.json({ user: { id: user.id, username: user.username, role: user.role }, role: user.role });
  });

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = body.password || '';
    const user = await db.getUserByName(c.env.DB, username);
    if (!user || !auth.verifyPassword(password, user.password_hash)) {
      return c.json({ error: '昵称或密码错误' }, 401);
    }
    const token = auth.issueToken(user, (c.env.SESSION_SECRET || process.env.SESSION_SECRET || ''));
    auth.setSessionCookie(c, token);
    return c.json({ user: { id: user.id, username: user.username, role: user.role }, role: user.role });
  });

  app.post('/api/auth/logout', (c) => {
    auth.clearSessionCookie(c);
    return c.json({ ok: true });
  });

  app.get('/api/auth/me', (c) => {
    return c.json({ user: c.get('user') || null });
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
    return c.json(
      await db.listEvents(c.env.DB, {
        q: q || undefined,
        city: city || undefined,
        province: province || undefined,
        status: status || undefined,
        page,
        limit,
        withCoordsOnly,
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
    const data = { ...body, title: body.title.trim(), submitted_by: c.get('user').id };
    if ((data.longitude == null || data.latitude == null) && data.address && hasKey(c.env)) {
      const g = await geocode(data.address, data.city, c.env);
      if (g) { data.longitude = g.longitude; data.latitude = g.latitude; }
    }
    const ev = await db.createEvent(c.env.DB, data);
    return c.json(ev, 201);
  });

  app.put('/api/events/:id', auth.requireAuth, async (c) => {
    const id = Number(c.req.param('id'));
    const existing = await db.getEvent(c.env.DB, id);
    if (!existing) return c.json({ error: '未找到该活动' }, 404);
    if (existing.submitted_by !== c.get('user').id && c.get('user').role !== 'admin') {
      return c.json({ error: '只能修改自己提交的活动' }, 403);
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
    if (existing.submitted_by !== c.get('user').id && c.get('user').role !== 'admin') {
      return c.json({ error: '只能删除自己提交的活动' }, 403);
    }
    await db.deleteEvent(c.env.DB, id);
    return c.json({ ok: true });
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
