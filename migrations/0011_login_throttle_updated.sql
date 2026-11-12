-- 0011：登录限流表补「最后活动时间」，用于清理陈旧记录
-- 应用：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）
-- 必须先执行本迁移再部署读取该列的新代码，否则 recordLoginFail 会报表无此列。
-- 注意：SQLite 的 ADD COLUMN 默认值只能是常量，不能用 (datetime('now'))，
-- 故存量行为 NULL；新写入由代码显式赋值，NULL 行由清理逻辑一次性淘汰。
ALTER TABLE login_throttle ADD COLUMN updated_at TEXT;
