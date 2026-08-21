-- 0008：登录限流表。按 key（IP|账号）记录失败次数，达到上限后锁定一段时间。
-- 应用：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）
CREATE TABLE IF NOT EXISTS login_throttle (
  key TEXT PRIMARY KEY,          -- CF-Connecting-IP | 登录名（小写）
  fails INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT              -- ISO 时间；NULL 或过去时间表示未锁定
);
