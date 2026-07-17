'use strict';
/**
 * 数据库层（better-sqlite3 + SQLite）
 * 两张表：users（账户）、conventions（漫展活动）
 * 漫展状态(status) 由起止日期相对今天动态计算，便于筛选。
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'app.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
init(); // 建表（函数声明已提升，可在此调用）

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

function init() {
  db.exec(`
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

// ---------- users ----------
const stmtInsertUser = db.prepare(
  'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
);
const stmtUserByName = db.prepare('SELECT * FROM users WHERE username = ?');
const stmtUserById = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?');

function createUser(username, passwordHash, role = 'user') {
  const info = stmtInsertUser.run(username, passwordHash, role);
  return stmtUserById.get(info.lastInsertRowid);
}
function getUserByName(username) {
  return stmtUserByName.get(username);
}
function getUserById(id) {
  return stmtUserById.get(id);
}

// ---------- conventions ----------
const stmtInsertEvent = db.prepare(`
  INSERT INTO conventions
  (title, start_date, end_date, province, city, venue, address, longitude, latitude,
   description, organizer, source_url, poster_url, verified, tags, submitted_by)
  VALUES (@title, @start_date, @end_date, @province, @city, @venue, @address,
   @longitude, @latitude, @description, @organizer, @source_url, @poster_url,
   @verified, @tags, @submitted_by)
`);
const stmtGetEvent = db.prepare(`${BASE_SELECT} WHERE c.id = ?`);
const stmtUpdateEvent = db.prepare(`
  UPDATE conventions SET
    title=@title, start_date=@start_date, end_date=@end_date, province=@province,
    city=@city, venue=@venue, address=@address, longitude=@longitude, latitude=@latitude,
    description=@description, organizer=@organizer, source_url=@source_url,
    poster_url=@poster_url, verified=@verified, tags=@tags,
    submitted_by=@submitted_by, updated_at=datetime('now')
  WHERE id=@id
`);
const stmtDeleteEvent = db.prepare('DELETE FROM conventions WHERE id = ?');
const stmtCount = db.prepare('SELECT COUNT(*) AS n FROM conventions');

function listEvents({ q, city, status, province, page = 1, limit = 50, withCoordsOnly = false } = {}) {
  const where = [];
  const params = {};
  if (q) {
    where.push('(c.title LIKE @q OR c.city LIKE @q OR c.venue LIKE @q OR c.organizer LIKE @q)');
    params.q = `%${q}%`;
  }
  if (city) {
    where.push('c.city = @city');
    params.city = city;
  }
  if (province) {
    where.push('c.province = @province');
    params.province = province;
  }
  if (status) {
    where.push(`(${STATUS_SQL}) = @status`);
    params.status = status;
  }
  if (withCoordsOnly) {
    where.push('c.longitude IS NOT NULL AND c.latitude IS NOT NULL');
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS n FROM conventions c ${whereSql}`).get(params).n;
  const offset = (Math.max(1, page) - 1) * limit;
  const rows = db
    .prepare(`${BASE_SELECT} ${whereSql} ORDER BY
       CASE WHEN c.start_date IS NULL THEN 1 ELSE 0 END,
       c.start_date DESC
       LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });
  return { total, page, limit, items: rows };
}

function getEvent(id) {
  return stmtGetEvent.get(id);
}

function createEvent(data) {
  const info = stmtInsertEvent.run(normalizeEvent(data));
  return getEvent(info.lastInsertRowid);
}

function updateEvent(id, data) {
  const existing = getEvent(id);
  if (!existing) return null;
  stmtUpdateEvent.run({ ...existing, ...normalizeEvent(data), id });
  return getEvent(id);
}

function deleteEvent(id) {
  return stmtDeleteEvent.run(id).changes > 0;
}

function countEvents() {
  return stmtCount.get().n;
}

function allCities() {
  return db
    .prepare(
      `SELECT city, COUNT(*) AS n FROM conventions WHERE city IS NOT NULL GROUP BY city ORDER BY n DESC, city`
    )
    .all();
}

// 把对象里的 undefined 转为 null，并把 tags 数组序列化为 JSON
function pad2(n) { return String(n).padStart(2, '0'); }
function isValidMD(mo, d) { return mo >= 1 && mo <= 12 && d >= 1 && d <= 31; }

// 解析日期范围：支持 2026-01-01 / 2026/1/17 / 2026/1/17-2026/1/18 / 含换行等
// 返回 { start, end }（均为 ISO YYYY-MM-DD，或 null）
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
  // 日期归一化：start_date 可含范围(如 2026/1/17-2026/1/18)，统一转 ISO(YYYY-MM-DD)
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

module.exports = {
  db,
  init,
  createUser,
  getUserByName,
  getUserById,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  countEvents,
  allCities,
};
