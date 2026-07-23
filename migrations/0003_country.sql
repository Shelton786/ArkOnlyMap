-- 舟友同好集会地图 —— 海外展会支持：conventions 增加 country（国家/地区）列
-- 应用：
--   wrangler d1 execute arknights-only-map --local  --file=migrations/0003_country.sql
--   wrangler d1 execute arknights-only-map --remote --file=migrations/0003_country.sql
-- 兼容现有数据：仅加列，不删不改旧数据；存量活动 country 为 NULL（前端按「中国」处理）。

ALTER TABLE conventions ADD COLUMN country TEXT;
