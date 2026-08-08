-- 一次性回填脚本：把「已用 execute 手动跑过」的旧迁移登记进 d1_migrations 表
-- 仅老库需要执行一次；全新库无需本脚本（migrations apply 会自动登记）。
-- 用法：npm run d1:backfill        （本地）
--       npm run d1:backfill:remote （线上）
-- 每行带 NOT EXISTS 守卫，重复执行无副作用。

CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO d1_migrations (name) SELECT '0001_init.sql'              WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0001_init.sql');
INSERT INTO d1_migrations (name) SELECT '0002_accounts.sql'          WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0002_accounts.sql');
INSERT INTO d1_migrations (name) SELECT '0003_country.sql'           WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0003_country.sql');
INSERT INTO d1_migrations (name) SELECT '0004_codes.sql'             WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0004_codes.sql');
INSERT INTO d1_migrations (name) SELECT '0005_district.sql'          WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0005_district.sql');
INSERT INTO d1_migrations (name) SELECT '0006_users_updated_at.sql'  WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0006_users_updated_at.sql');
INSERT INTO d1_migrations (name) SELECT '0007_claim_user.sql'        WHERE NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '0007_claim_user.sql');
