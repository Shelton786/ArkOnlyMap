-- 0009：会话版本号。改密码时 token_version +1，令此前签发的所有会话（含其它设备）立即失效。
-- 兼容：旧 token 不带 ver 字段，校验时按 0 处理；存量用户默认 0，故本次迁移不会强制全站登出。
-- 应用：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）
-- 注意：若已用 wrangler d1 execute --file 手动执行过本文件，须补登记 d1_migrations，
--       否则下次 d1:migrate:remote 会重复 ADD COLUMN（duplicate column name）。
-- 注意：必须先执行本迁移再部署读取该列的新代码，否则 getUserById 会报表无此列。
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
