-- 新增 district（区县文字名）列，与 0004 的 district_code 配套存储。
-- 区县名用于详情展示，district_code 用于精确筛选/标点。
ALTER TABLE conventions ADD COLUMN district TEXT;
