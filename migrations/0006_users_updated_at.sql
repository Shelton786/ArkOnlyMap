-- 舟友同好集会地图 —— D1 迁移 0006
-- users 表补 updated_at 列：updateUser() 会在 UPDATE 时写入 updated_at = datetime('now')，
-- 但初始建表（0001_init.sql）未包含该列，导致修改资料/头像时 SQL 报错 500。
--
-- 注意：D1（Cloudflare SQLite）不支持 ADD COLUMN 时使用非恒定默认值（如 datetime('now')），
-- 会报 "Cannot add a column with non-constant default"。故先加可空列，再用 UPDATE 回填。
--
-- 应用方式：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）
--   wrangler d1 execute arknights-only-map --remote --file=migrations/0006_users_updated_at.sql

ALTER TABLE users ADD COLUMN updated_at TEXT;
UPDATE users SET updated_at = datetime('now') WHERE updated_at IS NULL;
