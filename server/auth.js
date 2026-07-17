'use strict';
/**
 * 轻量账户认证
 * - 密码：crypto.scrypt 加盐哈希
 * - 会话：HMAC-SHA256 签名的无状态 token，存放在 httpOnly cookie
 */
const crypto = require('crypto');
const { getUserById } = require('./db');

const SECRET = process.env.SESSION_SECRET || 'arknights-only-map-change-me';
const COOKIE_NAME = 'ark_session';
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30; // 30 天

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt.toString('hex')}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [saltHex, derivedHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(derivedHex, 'hex');
  const b = Buffer.from(derived, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function unsign(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function issueToken(user) {
  return sign({ uid: user.id, username: user.username, role: user.role, exp: Date.now() + TOKEN_TTL });
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${Math.floor(TOKEN_TTL / 1000)}; SameSite=Lax`
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

// Express 中间件：把当前用户挂到 req.user（无则 null）
function attachUser(req, res, next) {
  const cookies = parseCookies(req);
  const payload = unsign(cookies[COOKIE_NAME]);
  if (payload) {
    const u = getUserById(payload.uid);
    if (u) req.user = u;
  }
  next();
}

// 要求登录
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: '请先登录' });
  next();
}

// 要求管理员
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: '请先登录' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: '需要管理员权限' });
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  issueToken,
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  attachUser,
  requireAuth,
  requireAdmin,
  COOKIE_NAME,
};
