-- 舟友同好集会地图 —— 海外展会支持：conventions 增加 country（国家/地区）列
-- 应用：npm run d1:migrate（本地）/ npm run d1:migrate:remote（线上）
-- 兼容现有数据：仅加列，不删不改旧数据；存量活动 country 为 NULL（前端按「中国」处理）。

ALTER TABLE conventions ADD COLUMN country TEXT;
