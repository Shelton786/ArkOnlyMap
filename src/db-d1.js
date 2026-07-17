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
export async function createUser(db, username, passwordHash, role = 'user') {
  const info = await db
    .prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .bind(username, passwordHash, role)
    .run();
  return getUserById(db, Number(info.meta.last_row_id));
}

export async function getUserByName(db, username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
}

export async function getUserById(db, id) {
  return db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').bind(id).first();
}

export async function countUsers(db) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM users').first();
  return r ? r.n : 0;
}

// ---------------- conventions ----------------
export async function listEvents(db, { q, city, status, province, page = 1, limit = 200, withCoordsOnly = false } = {}) {
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
  const info = await db
    .prepare(
      `INSERT INTO conventions
       (title, start_date, end_date, province, city, venue, address, longitude, latitude,
        description, organizer, source_url, poster_url, verified, tags, submitted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      n.title, n.start_date, n.end_date, n.province, n.city, n.venue, n.address,
      n.longitude, n.latitude, n.description, n.organizer, n.source_url, n.poster_url,
      n.verified, n.tags, n.submitted_by
    )
    .run();
  return getEvent(db, Number(info.meta.last_row_id));
}

export async function updateEvent(db, id, data) {
  const existing = await getEvent(db, id);
  if (!existing) return null;
  const merged = normalizeEvent({ ...existing, ...data });
  await db
    .prepare(
      `UPDATE conventions SET
        title=?, start_date=?, end_date=?, province=?,
        city=?, venue=?, address=?, longitude=?, latitude=?,
        description=?, organizer=?, source_url=?,
        poster_url=?, verified=?, tags=?,
        submitted_by=?, updated_at=datetime('now')
      WHERE id=?`
    )
    .bind(
      merged.title, merged.start_date, merged.end_date, merged.province,
      merged.city, merged.venue, merged.address, merged.longitude, merged.latitude,
      merged.description, merged.organizer, merged.source_url,
      merged.poster_url, merged.verified, merged.tags,
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
