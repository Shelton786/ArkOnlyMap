-- 舟友同好集会地图 —— D1 初始化（Cloudflare Pages + D1）
-- 应用：wrangler d1 execute DB --local --file=migrations/0001_init.sql
--       wrangler d1 execute DB --remote --file=migrations/0001_init.sql

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
