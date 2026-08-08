/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * 轻量账户认证（Cloudflare Workers / Pages 适配版）
 * - 密码：node:crypto scrypt 加盐哈希（依赖 wrangler.toml 的 nodejs_compat）
 * - 会话：HMAC-SHA256 签名的无状态 token，存放在 httpOnly cookie
 *
 * 在 Node 本地（wrangler pages dev）与 Cloudflare 运行时下均可用。
 */
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import * as db from './db-d1.js';

// Cloudflare Pages 的「环境变量 / 密钥」通过 c.env 注入；本地兜底 process.env。
// 未配置时直接抛错：绝不使用代码内默认密钥签名会话，避免配置失误导致 token 可被伪造。
function secretOf(env) {
  const s = (env && env.SESSION_SECRET) || process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET 未配置：请在 .dev.vars / Pages 环境变量中设置随机长字符串');
  return s;
}

export const COOKIE_NAME = 'ark_session';
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30; // 30 天

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt.toString('hex')}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [saltHex, derivedHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(derivedHex, 'hex');
  const b = Buffer.from(derived, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function unsign(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  let sigBuf, expBuf;
  try {
    sigBuf = Buffer.from(sig);
    expBuf = Buffer.from(createHmac('sha256', secret).update(body).digest('base64url'));
  } catch {
    return null;
  }
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function issueToken(user, secret) {
  return sign({ uid: user.id, username: user.username, role: user.role, exp: Date.now() + TOKEN_TTL }, secret);
}

// 写入会话 cookie（Hono 上下文）；HTTPS 下附加 Secure，防止明文传输
function isHttps(c) {
  try {
    return new URL(c.req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

function setSessionCookie(c, token) {
  const secure = isHttps(c) ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${Math.floor(TOKEN_TTL / 1000)}; SameSite=Lax${secure}`
  );
}

function clearSessionCookie(c) {
  const secure = isHttps(c) ? '; Secure' : '';
  c.header('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
}

// Hono 中间件：把当前用户挂到 c.set('user')（无则 null）
export async function attachUser(c, next) {
  const cookie = c.req.header('Cookie');
  let uid = null;
  if (cookie) {
    const m = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (m) {
      const payload = unsign(decodeURIComponent(m[1]), secretOf(c.env));
      if (payload) uid = payload.uid;
    }
  }
  if (uid != null) {
    const u = await db.getUserById(c.env.DB, uid);
    if (u) c.set('user', u); // 完整资料（含 amid / email / role / email_verified）
  }
  await next();
}

// 角色层级：数字越大权限越高
const ROLE_RANK = { user: 0, organizer: 1, admin: 2, site_admin: 3 };
function roleAtLeast(user, role) {
  if (!user) return false;
  return (ROLE_RANK[user.role] ?? -1) >= (ROLE_RANK[role] ?? 0);
}

function requireAuth(c, next) {
  if (!c.get('user')) return c.json({ error: '请先登录' }, 401);
  return next();
}

function requireAdmin(c, next) {
  const user = c.get('user');
  if (!user) return c.json({ error: '请先登录' }, 401);
  if (!roleAtLeast(user, 'admin')) return c.json({ error: '需要管理员权限' }, 403);
  return next();
}

function requireAdminOrAbove(c, next) {
  const user = c.get('user');
  if (!user) return c.json({ error: '请先登录' }, 401);
  if (!roleAtLeast(user, 'admin')) return c.json({ error: '需要管理员权限' }, 403);
  return next();
}

function requireSiteAdmin(c, next) {
  const user = c.get('user');
  if (!user) return c.json({ error: '请先登录' }, 401);
  if (!roleAtLeast(user, 'site_admin')) return c.json({ error: '需要站长（site_admin）权限' }, 403);
  return next();
}

function requireOrganizerOrAbove(c, next) {
  const user = c.get('user');
  if (!user) return c.json({ error: '请先登录' }, 401);
  if (!roleAtLeast(user, 'organizer')) return c.json({ error: '需要主办及以上权限' }, 403);
  return next();
}

// 是否可编辑某活动：admin+ / 自己提交的 / 认领且已通过的主办
function canEditEvent(user, event) {
  if (!user || !event) return false;
  if (roleAtLeast(user, 'admin')) return true;
  if (event.submitted_by != null && event.submitted_by === user.id) return true;
  if (event.organizer_claim_status === 'approved' && event.organizer_user_id === user.id) return true;
  return false;
}

// 是否可删除某活动：admin+ / 自己提交的 / 认领且已通过的主办
function canDeleteEvent(user, event) {
  if (!user || !event) return false;
  if (roleAtLeast(user, 'admin')) return true;
  if (event.submitted_by != null && event.submitted_by === user.id) return true;
  if (event.organizer_claim_status === 'approved' && event.organizer_user_id === user.id) return true;
  return false;
}

export {
  hashPassword,
  verifyPassword,
  issueToken,
  sign,
  unsign,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  requireAdmin,
  requireAdminOrAbove,
  requireSiteAdmin,
  requireOrganizerOrAbove,
  canEditEvent,
  canDeleteEvent,
  roleAtLeast,
  ROLE_RANK,
};
