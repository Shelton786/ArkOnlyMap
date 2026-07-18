-- 舟友同好集会地图 —— 账户系统 + 角色权限 + 审核流（增量迁移）
-- 应用：wrangler d1 execute DB --local  --file=migrations/0002_accounts.sql
--       wrangler d1 execute DB --remote --file=migrations/0002_accounts.sql
-- 兼容现有 users / conventions，仅做「加列 + 建表」，不删不改旧数据。

-- 1) users 扩展：站内唯一身份号、邮箱登录名、展示名、头像、邮箱验证状态
-- 注意：SQLite 的 ALTER TABLE ADD COLUMN 不支持直接加 UNIQUE 约束，故先加列、再建唯一索引。
ALTER TABLE users ADD COLUMN amid TEXT;
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
-- role 取值范围扩展：site_admin / admin / organizer / user
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_amid ON users(amid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2) auth_identities：一个账户可绑定多种登录方式（邮箱密码 / 鹰角通行证 / 未来 QQ 微信 TG）
CREATE TABLE IF NOT EXISTS auth_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,                 -- password / hypergryph（未来：qq / wechat / telegram）
  provider_account_id TEXT NOT NULL,      -- 外部 UID / 邮箱 / 11 位鹰角 UID
  provider_username TEXT,                 -- 外部展示名
  verified INTEGER NOT NULL DEFAULT 0,    -- 邮箱验证 / OAuth 核验状态（鹰角为自述，默认 0）
  extra TEXT,                             -- JSON：头像、unionid 等扩展
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_ident_user ON auth_identities(user_id);

-- 3) conventions 扩展：审核状态 + 主办认领 + 补充合并
ALTER TABLE conventions ADD COLUMN review_status TEXT NOT NULL DEFAULT 'approved';
-- approved（已确认·公开）/ pending（未确认·公开但标注）/ merged（已合并进原活动，不再单独展示）/ rejected（驳回·仅管理员可见）
ALTER TABLE conventions ADD COLUMN submission_type TEXT NOT NULL DEFAULT 'new';
-- new（新建活动）/ supplement（补充已有活动信息）
ALTER TABLE conventions ADD COLUMN parent_event_id INTEGER REFERENCES conventions(id);
-- supplement 类型指向被补充的原活动
ALTER TABLE conventions ADD COLUMN organizer_user_id INTEGER REFERENCES users(id);
-- 认领并审核通过的主办
ALTER TABLE conventions ADD COLUMN organizer_claim_status TEXT NOT NULL DEFAULT 'none';
-- none / pending / approved

CREATE INDEX IF NOT EXISTS idx_conv_review ON conventions(review_status);
CREATE INDEX IF NOT EXISTS idx_conv_parent ON conventions(parent_event_id);
