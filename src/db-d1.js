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
 * 数据库层（Cloudflare D1 / serverless SQLite，异步）
 *
 * 与旧版 better-sqlite3 结构保持一致：
 *  - users（账户）、conventions（漫展活动）
 *  - 活动状态(status) 由起止日期相对今天动态计算，便于筛选
 *
 * 所有函数第一个参数都是 D1Database 实例（运行时由 c.env.DB 提供）。
 */

const STATUS_SQL = `CASE
  WHEN c.start_date IS NULL THEN 'unknown'
  WHEN COALESCE(c.end_date, c.start_date) < date('now') THEN 'past'
  WHEN c.start_date > date('now') THEN 'upcoming'
  ELSE 'ongoing'
END`;

const BASE_SELECT = `SELECT c.*, ${STATUS_SQL} AS status,
  u.username AS submitted_by_name
  FROM conventions c
  LEFT JOIN users u ON u.id = c.submitted_by`;

// 建表（D1 不支持 IF NOT EXISTS 一次多语句的差异，逐条执行更稳妥）
export async function initSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS conventions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      province TEXT,
      city TEXT,
      venue TEXT,
      address TEXT,
      longitude REAL,
      latitude REAL,
      description TEXT,
      organizer TEXT,
      source_url TEXT,
      poster_url TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      submitted_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_conv_city ON conventions(city);
    CREATE INDEX IF NOT EXISTS idx_conv_start ON conventions(start_date);
    CREATE INDEX IF NOT EXISTS idx_conv_title ON conventions(title);
  `);
}

// ---------------- users ----------------
export async function createUser(db, { username, passwordHash, role = 'user', email = null, displayName = null, amid = null }) {
  if (!amid) amid = await generateUniqueAmid(db);
  const info = await db
    .prepare('INSERT INTO users (username, password_hash, role, email, display_name, amid) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(username, passwordHash, role, email || null, displayName || username, amid)
    .run();
  return getUserById(db, Number(info.meta.last_row_id));
}

export async function getUserByName(db, username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
}

export async function getUserById(db, id) {
  return db
    .prepare('SELECT id, username, amid, email, display_name, role, email_verified, created_at FROM users WHERE id = ?')
    .bind(id)
    .first();
}

export async function getUserByEmail(db, email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function countUsers(db) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM users').first();
  return r ? r.n : 0;
}

// 生成「AM-」+ 8 位唯一数字（与现有 amid 不冲突）
export async function generateUniqueAmid(db) {
  const taken = new Set(
    (await db.prepare('SELECT amid FROM users WHERE amid IS NOT NULL').all()).results?.map((r) => r.amid) || []
  );
  let amid;
  do {
    amid = 'AM-' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  } while (taken.has(amid));
  return amid;
}

// ---------------- auth_identities（多登录方式） ----------------
export async function createIdentity(db, userId, provider, providerAccountId, providerUsername = null, verified = 0) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO auth_identities (user_id, provider, provider_account_id, provider_username, verified)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(userId, provider, String(providerAccountId), providerUsername, verified)
    .run();
}

export async function getIdentities(db, userId) {
  const r = await db.prepare('SELECT provider, provider_account_id, provider_username, verified FROM auth_identities WHERE user_id = ?').bind(userId).all();
  return r.results || [];
}

export async function getIdentity(db, provider, providerAccountId) {
  return db
    .prepare('SELECT * FROM auth_identities WHERE provider = ? AND provider_account_id = ?')
    .bind(provider, String(providerAccountId))
    .first();
}

export async function deleteIdentity(db, userId, provider) {
  await db.prepare('DELETE FROM auth_identities WHERE user_id = ? AND provider = ?').bind(userId, provider).run();
}

// 更新用户资料（display_name / email）
export async function updateUser(db, id, { displayName, email }) {
  const sets = [];
  const vals = [];
  if (displayName !== undefined) { sets.push('display_name = ?'); vals.push(displayName); }
  if (email !== undefined) { sets.push('email = ?'); sets.push('email_verified = 0'); vals.push(email || null); }
  if (!sets.length) return getUserById(db, id);
  vals.push(id);
  await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return getUserById(db, id);
}

export async function setUserRole(db, id, role) {
  await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run();
  return getUserById(db, id);
}

export async function listUsers(db) {
  const r = await db
    .prepare('SELECT id, username, amid, email, display_name, role, email_verified, created_at FROM users ORDER BY id')
    .all();
  return r.results || [];
}

// ---------------- conventions ----------------
export async function listEvents(db, { q, city, status, province, page = 1, limit = 200, withCoordsOnly = false, review = 'public' } = {}) {
  const where = [];
  const bindVals = []; // 与 where 顺序一一对应的位置参数值
  if (q) {
    where.push('(c.title LIKE ? OR c.city LIKE ? OR c.venue LIKE ? OR c.organizer LIKE ?)');
    const like = `%${q}%`;
    bindVals.push(like, like, like, like);
  }
  if (city) {
    where.push('c.city = ?');
    bindVals.push(city);
  }
  if (province) {
    where.push('c.province = ?');
    bindVals.push(province);
  }
  if (status) {
    where.push(`(${STATUS_SQL}) = ?`);
    bindVals.push(status);
  }
  if (withCoordsOnly) {
    where.push('c.longitude IS NOT NULL AND c.latitude IS NOT NULL');
  }
  // 审核状态过滤：默认仅返回「已确认 + 未确认（公开）」，不返回 merged（已合并）/ rejected（驳回）
  if (review === 'all') {
    where.push("c.review_status IN ('approved', 'pending', 'rejected')");
  } else {
    where.push("c.review_status IN ('approved', 'pending')");
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM conventions c ${whereSql}`)
    .bind(...bindVals)
    .first();
  const total = totalRow ? totalRow.n : 0;
  const offset = (Math.max(1, page) - 1) * limit;
  const rows = await db
    .prepare(
      `${BASE_SELECT} ${whereSql} ORDER BY
        CASE WHEN c.start_date IS NULL THEN 1 ELSE 0 END,
        c.start_date DESC
        LIMIT ? OFFSET ?`
    )
    .bind(...bindVals, limit, offset)
    .all();
  const items = (rows.results || []).map(parseRow);
  return { total, page, limit, items };
}

export async function getEvent(db, id) {
  const r = await db.prepare(`${BASE_SELECT} WHERE c.id = ?`).bind(id).first();
  return r ? parseRow(r) : null;
}

// tags 字段以 JSON 字符串存储，统一解析成数组返回，便于前端直接渲染
function parseRow(r) {
  if (!r) return r;
  let tags = [];
  if (typeof r.tags === 'string' && r.tags) {
    try { tags = JSON.parse(r.tags); } catch { tags = []; }
  } else if (Array.isArray(r.tags)) {
    tags = r.tags;
  }
  return { ...r, tags: Array.isArray(tags) ? tags : [] };
}

export async function createEvent(db, data) {
  const n = normalizeEvent(data);
  // 审核 / 认领相关字段（带安全默认值）
  n.review_status = data.review_status || 'approved';
  n.submission_type = data.submission_type || 'new';
  n.parent_event_id = data.parent_event_id != null ? Number(data.parent_event_id) : null;
  n.organizer_user_id = data.organizer_user_id != null ? Number(data.organizer_user_id) : null;
  n.organizer_claim_status = data.organizer_claim_status || 'none';
  n.submitted_by = data.submitted_by != null ? Number(data.submitted_by) : null;
  // 0004/0005 新增列：用户提交时多为 null，采集管道会填入编码与溯源
  n.district = data.district || null;
  n.country_code = data.country_code || null;
  n.province_code = data.province_code || null;
  n.city_code = data.city_code || null;
  n.district_code = data.district_code || null;
  n.source = data.source || 'user';
  n.source_id = data.source_id || null;
  n.imported_at = data.imported_at || null;
  const info = await db
    .prepare(
      `INSERT INTO conventions
       (title, start_date, end_date, province, city, district, country, venue, address, longitude, latitude,
        description, organizer, source_url, poster_url, verified, tags, submitted_by,
        review_status, submission_type, parent_event_id, organizer_user_id, organizer_claim_status,
        country_code, province_code, city_code, district_code, source, source_id, imported_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      n.title, n.start_date, n.end_date, n.province, n.city, n.district, n.country, n.venue, n.address,
      n.longitude, n.latitude, n.description, n.organizer, n.source_url, n.poster_url,
      n.verified, n.tags, n.submitted_by,
      n.review_status, n.submission_type, n.parent_event_id, n.organizer_user_id, n.organizer_claim_status,
      n.country_code, n.province_code, n.city_code, n.district_code, n.source, n.source_id, n.imported_at
    )
    .run();
  return getEvent(db, Number(info.meta.last_row_id));
}

// 批量幂等写入（采集管道用）。同一 (source, source_id) 重复时更新，不重复插。
// 用 db.batch 一次性提交，减少往返。列集合与 run.mjs 的 COLS 保持一致。
const UPSERT_COLS = [
  'title', 'start_date', 'end_date', 'province', 'city', 'district', 'venue', 'address',
  'longitude', 'latitude', 'description', 'organizer', 'source_url', 'poster_url', 'verified', 'tags',
  'country', 'country_code', 'province_code', 'city_code', 'district_code',
  'source', 'source_id', 'imported_at', 'review_status', 'submitted_by',
];

export async function upsertEvents(db, records) {
  const safe = (records || []).filter(Boolean);
  if (!safe.length) return 0;
  const stmts = safe.map((r) => {
    const cols = UPSERT_COLS;
    const placeholders = cols.map(() => '?').join(', ');
    const update = cols
      .filter((c) => !['source', 'source_id', 'submitted_by'].includes(c))
      .map((c) => `${c}=excluded.${c}`)
      .join(', ');
    const vals = cols.map((c) => {
      const v = r[c];
      if (c === 'verified') return v ? 1 : 0;
      if (v === undefined) return null;
      return v;
    });
    return db
      .prepare(`INSERT INTO conventions (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT(source, source_id) DO UPDATE SET ${update}`)
      .bind(...vals);
  });
  await db.batch(stmts);
  return safe.length;
}

// ---------------- 审核 / 认领 ----------------
export async function listPendingEvents(db) {
  const r = await db
    .prepare(
      `${BASE_SELECT} WHERE c.review_status = 'pending' ORDER BY c.created_at ASC`
    )
    .all();
  return (r.results || []).map(parseRow);
}

// 审核通过「新建」：转 approved
export async function approveNewEvent(db, id) {
  await db.prepare("UPDATE conventions SET review_status = 'approved' WHERE id = ? AND review_status = 'pending'").bind(id).run();
  return getEvent(db, id);
}

// 审核驳回：转 rejected（仅管理员可见）
export async function rejectEvent(db, id) {
  await db.prepare("UPDATE conventions SET review_status = 'rejected' WHERE id = ? AND review_status = 'pending'").bind(id).run();
  return getEvent(db, id);
}

// 审核通过「补充」：把补充行的非空字段合并进原活动，补充行标记 merged
export async function mergeSupplement(db, supplementId) {
  const sup = await getEvent(db, supplementId);
  if (!sup || sup.submission_type !== 'supplement' || !sup.parent_event_id) return null;
  const parent = await getEvent(db, sup.parent_event_id);
  if (!parent) return null;

  const SCALAR = ['title', 'start_date', 'end_date', 'province', 'city', 'district', 'country', 'venue', 'address', 'longitude', 'latitude', 'organizer', 'source_url', 'poster_url', 'tags',
    'country_code', 'province_code', 'city_code', 'district_code', 'source', 'source_id', 'imported_at'];
  const merged = { ...parent };
  for (const k of SCALAR) {
    if (sup[k] != null && sup[k] !== '') merged[k] = sup[k];
  }
  // 描述类字段：补充内容追加到原活动
  if (sup.description != null && sup.description !== '') {
    merged.description = (parent.description ? parent.description + '\n\n' : '') + '【信息补充】\n' + sup.description;
  }
  await updateEvent(db, parent.id, merged);
  // 补充行标记 merged（不再单独展示）
  await db.prepare("UPDATE conventions SET review_status = 'merged' WHERE id = ?").bind(supplementId).run();
  return getEvent(db, parent.id);
}

export async function requestClaim(db, id, userId) {
  await db
    .prepare("UPDATE conventions SET organizer_claim_status = 'pending' WHERE id = ? AND organizer_claim_status = 'none'")
    .bind(id)
    .run();
  return getEvent(db, id);
}

export async function approveClaim(db, id, userId) {
  await db
    .prepare("UPDATE conventions SET organizer_claim_status = 'approved', organizer_user_id = ? WHERE id = ? AND organizer_claim_status = 'pending'")
    .bind(userId, id)
    .run();
  return getEvent(db, id);
}

export async function updateEvent(db, id, data) {
  const existing = await getEvent(db, id);
  if (!existing) return null;
  const merged = normalizeEvent({ ...existing, ...data });
  await db
    .prepare(
      `UPDATE conventions SET
        title=?, start_date=?, end_date=?, province=?,
        city=?, district=?, country=?, venue=?, address=?, longitude=?, latitude=?,
        description=?, organizer=?, source_url=?,
        poster_url=?, verified=?, tags=?,
        country_code=?, province_code=?, city_code=?, district_code=?,
        source=?, source_id=?, imported_at=?,
        submitted_by=?, updated_at=datetime('now')
      WHERE id=?`
    )
    .bind(
      merged.title, merged.start_date, merged.end_date, merged.province,
      merged.city, merged.district, merged.country, merged.venue, merged.address, merged.longitude, merged.latitude,
      merged.description, merged.organizer, merged.source_url,
      merged.poster_url, merged.verified, merged.tags,
      merged.country_code, merged.province_code, merged.city_code, merged.district_code,
      merged.source, merged.source_id, merged.imported_at,
      merged.submitted_by, id
    )
    .run();
  return getEvent(db, id);
}

export async function deleteEvent(db, id) {
  const r = await db.prepare('DELETE FROM conventions WHERE id = ?').bind(id).run();
  return (r.meta && r.meta.changes > 0) || (r.changes && r.changes > 0);
}

export async function countEvents(db) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM conventions').first();
  return r ? r.n : 0;
}

export async function allCities(db) {
  const r = await db
    .prepare(
      `SELECT city, COUNT(*) AS n FROM conventions WHERE city IS NOT NULL GROUP BY city ORDER BY n DESC, city`
    )
    .all();
  return r.results || [];
}

// 仅更新坐标
export async function saveCoords(db, id, lng, lat) {
  await db
    .prepare('UPDATE conventions SET longitude=?, latitude=? WHERE id=?')
    .bind(lng, lat, id)
    .run();
}

// 取缺坐标的活动（管理员一键补全）
export async function getMissingCoords(db) {
  const r = await db
    .prepare('SELECT * FROM conventions WHERE longitude IS NULL AND address IS NOT NULL')
    .all();
  return r.results || [];
}

// ---------------- 日期解析 / 归一化 ----------------
function pad2(n) { return String(n).padStart(2, '0'); }
function isValidMD(mo, d) { return mo >= 1 && mo <= 12 && d >= 1 && d <= 31; }

function parseDateRange(raw) {
  if (raw == null) return { start: null, end: null };
  const s = String(raw).replace(/\n/g, ' ').trim();
  const found = [];
  const re = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})|(\d{1,2})[/-](\d{1,2})/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (isValidMD(mo, d)) found.push(`${y}-${pad2(mo)}-${pad2(d)}`);
    } else {
      const mo = +m[4], d = +m[5];
      if (isValidMD(mo, d)) found.push(`${new Date().getFullYear()}-${pad2(mo)}-${pad2(d)}`);
    }
  }
  if (!found.length) return { start: null, end: null };
  if (found.length === 1) return { start: found[0], end: found[0] };
  return { start: found[0], end: found[found.length - 1] };
}

function normalizeEvent(d) {
  const out = { ...d };
  for (const k of Object.keys(out)) {
    if (out[k] === undefined) out[k] = null;
  }
  if (out.start_date != null) {
    const r = parseDateRange(out.start_date);
    out.start_date = r.start;
    if (out.end_date == null && r.end && r.end !== r.start) out.end_date = r.end;
  }
  if (out.end_date != null) {
    const r = parseDateRange(out.end_date);
    out.end_date = r.end || r.start || null;
  }
  if (Array.isArray(out.tags)) out.tags = JSON.stringify(out.tags);
  else if (typeof out.tags === 'string') {
    try {
      const arr = JSON.parse(out.tags);
      out.tags = Array.isArray(arr) ? out.tags : JSON.stringify([]);
    } catch {
      out.tags = JSON.stringify([]);
    }
  } else if (out.tags == null) {
    out.tags = JSON.stringify([]);
  }
  if (out.longitude !== null && out.longitude !== undefined) out.longitude = Number(out.longitude);
  if (out.latitude !== null && out.latitude !== undefined) out.latitude = Number(out.latitude);
  out.verified = out.verified ? 1 : 0;
  return out;
}
