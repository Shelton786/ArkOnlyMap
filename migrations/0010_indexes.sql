-- P1 数据库重构：索引调整（2026-11-12）
-- 依据线上 EXPLAIN QUERY PLAN 与列引用普查，删除 3 个从未被查询命中的索引，
-- 补上用户管理、认领审核、订阅源实际会走到的 5 个索引。
-- 全部语句幂等：重复执行不会因 ADD/DROP 报错（手动 --file 与 d1 migrations apply 均安全）。

-- 一、删除零命中索引
-- title：服务端搜索是 LIKE '%关键词%'，前导通配符用不上 B 树索引。
-- province_code / city_code：站点运行时从不按编码列查询；两者只由离线采集脚本写入。
DROP INDEX IF EXISTS idx_conv_title;
DROP INDEX IF EXISTS idx_conv_pcode;
DROP INDEX IF EXISTS idx_conv_ccode;

-- 二、新增索引
-- 用户列表按页批量统计：WHERE submitted_by IN (...) GROUP BY submitted_by，
-- 带 review_status 可直接从索引算 SUM(CASE WHEN review_status='pending')，避免回表。
CREATE INDEX IF NOT EXISTS idx_conv_submitted ON conventions(submitted_by, review_status);
-- 认领数统计 / 待审认领 JOIN 申请人
CREATE INDEX IF NOT EXISTS idx_conv_claim_user ON conventions(organizer_claim_user_id);
-- 「TA 的集会」与驳回认领后的角色回收计数：两列同时出现在 WHERE
CREATE INDEX IF NOT EXISTS idx_conv_organizer ON conventions(organizer_user_id, organizer_claim_status);
-- 待审认领队列：WHERE organizer_claim_status = 'pending'
CREATE INDEX IF NOT EXISTS idx_conv_claim_status ON conventions(organizer_claim_status);
-- RSS / ICS 订阅源按收录时间倒序、待审活动队列按创建时间正序
CREATE INDEX IF NOT EXISTS idx_conv_created ON conventions(created_at);

-- 注意：idx_conv_source (source, source_id) 为采集幂等写入的唯一键，必须保留；
-- idx_conv_city / start / review / parent 均在实际查询中使用，保留。
-- 应用：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）。
-- 若用 wrangler d1 execute --file 手动执行，务必补登记到 d1_migrations 表。
