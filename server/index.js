'use strict';
/**
 * 舟友同好集会地图 —— 后端服务
 * 全栈可协作：账户 + 漫展活动 CRUD + 筛选 + 导入
 */
const path = require('path');
const fs = require('fs');

// 在加载依赖前注入 .env（依赖模块在加载时会读取环境变量）
(function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
})();

const express = require('express');
const { init, createUser, getUserByName, createEvent, listEvents, getEvent, updateEvent, deleteEvent, countEvents, allCities } = require('./db');
const auth = require('./auth');
const { geocode, hasKey } = require('./geocode');

init();

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(auth.attachUser);

const APP_TITLE = process.env.APP_TITLE || '舟友同好集会地图';
const AMAP_KEY = process.env.AMAP_KEY || '';
const AMAP_SECURITY = process.env.AMAP_SECURITY_CODE || '';

// 暴露给前端的最小配置（高德 Key 本就需在浏览器使用）
app.get('/api/config', (req, res) => {
  res.json({ title: APP_TITLE, amapKey: AMAP_KEY, amapSecurityCode: AMAP_SECURITY, geocodeEnabled: hasKey() });
});

app.get('/api/stats', (req, res) => {
  res.json({ events: countEvents(), cities: allCities().length });
});

// ---------------- 认证 ----------------
app.post('/api/auth/register', (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  if (username.length < 2 || username.length > 20) return res.status(400).json({ error: '昵称长度需 2-20 个字符' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' });
  if (getUserByName(username)) return res.status(409).json({ error: '该昵称已被注册' });
  const noUsers = require('./db').db.prepare('SELECT COUNT(*) n FROM users').get().n === 0;
  const role = noUsers ? 'admin' : 'user'; // 首位注册者自动成为管理员
  const user = createUser(username, auth.hashPassword(password), role);
  const token = auth.issueToken(user);
  auth.setSessionCookie(res, token);
  res.json({ user, role: user.role });
});

app.post('/api/auth/login', (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  const user = getUserByName(username);
  if (!user || !auth.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: '昵称或密码错误' });
  }
  const token = auth.issueToken(user);
  auth.setSessionCookie(res, token);
  res.json({ user: { id: user.id, username: user.username, role: user.role }, role: user.role });
});

app.post('/api/auth/logout', (req, res) => {
  auth.clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.user || null });
});

// ---------------- 活动 ----------------
app.get('/api/events/cities', (req, res) => {
  res.json(allCities());
});

app.get('/api/events', (req, res) => {
  const { q, city, province, status, page, limit } = req.query;
  const result = listEvents({
    q: q || undefined,
    city: city || undefined,
    province: province || undefined,
    status: status || undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 200,
    withCoordsOnly: req.query.coords === '1',
  });
  res.json(result);
});

app.get('/api/events/:id', (req, res) => {
  const ev = getEvent(Number(req.params.id));
  if (!ev) return res.status(404).json({ error: '未找到该活动' });
  res.json(ev);
});

app.post('/api/events', auth.requireAuth, async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.title.trim()) return res.status(400).json({ error: '请填写活动名称' });
  const data = { ...body, title: body.title.trim(), submitted_by: req.user.id };
  // 缺坐标但有地址时尝试地理编码
  if ((data.longitude == null || data.latitude == null) && data.address && hasKey()) {
    const g = await geocode(data.address, data.city);
    if (g) { data.longitude = g.longitude; data.latitude = g.latitude; }
  }
  const ev = createEvent(data);
  res.status(201).json(ev);
});

app.put('/api/events/:id', auth.requireAuth, async (req, res) => {
  const existing = getEvent(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: '未找到该活动' });
  if (existing.submitted_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: '只能修改自己提交的活动' });
  }
  const body = req.body || {};
  const data = { ...body, title: (body.title || existing.title).trim() };
  if ((data.longitude == null || data.latitude == null) && data.address && hasKey() && (!existing.longitude && !existing.latitude)) {
    const g = await geocode(data.address, data.city);
    if (g) { data.longitude = g.longitude; data.latitude = g.latitude; }
  }
  const ev = updateEvent(Number(req.params.id), data);
  res.json(ev);
});

app.delete('/api/events/:id', auth.requireAuth, (req, res) => {
  const existing = getEvent(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: '未找到该活动' });
  if (existing.submitted_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: '只能删除自己提交的活动' });
  }
  deleteEvent(Number(req.params.id));
  res.json({ ok: true });
});

// 仅更新坐标（浏览器端地理编码后回写；任何登录用户均可校正）
app.post('/api/events/:id/coords', auth.requireAuth, (req, res) => {
  const existing = getEvent(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: '未找到该活动' });
  const lng = Number(req.body.longitude);
  const lat = Number(req.body.latitude);
  if (isNaN(lng) || isNaN(lat)) return res.status(400).json({ error: '坐标无效' });
  require('./db').db.prepare('UPDATE conventions SET longitude=?, latitude=? WHERE id=?')
    .run(lng, lat, Number(req.params.id));
  res.json({ ok: true });
});

// ---------------- 管理员：导入 / 工具 ----------------
app.post('/api/admin/import', auth.requireAdmin, (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  let added = 0, skipped = 0;
  for (const it of items) {
    if (!it.title || !it.title.trim()) { skipped++; continue; }
    createEvent({ ...it, title: it.title.trim(), submitted_by: req.user.id });
    added++;
  }
  res.json({ added, skipped });
});

app.post('/api/admin/geocode-missing', auth.requireAdmin, async (req, res) => {
  if (!hasKey()) return res.status(400).json({ error: '未配置高德 Key，无法地理编码' });
  const rows = require('./db').db.prepare('SELECT * FROM conventions WHERE longitude IS NULL AND address IS NOT NULL').all();
  let done = 0;
  for (const r of rows) {
    const g = await geocode(r.address, r.city);
    if (g) {
      require('./db').db.prepare('UPDATE conventions SET longitude=?, latitude=? WHERE id=?').run(g.longitude, g.latitude, r.id);
      done++;
    }
  }
  res.json({ scanned: rows.length, geocoded: done });
});

// 静态资源
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ${APP_TITLE} 后端已启动: http://localhost:${PORT}`);
});
