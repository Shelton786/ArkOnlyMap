-- 0004: 行政编码（GB/T 2260）+ 国家 ISO 3166-1 + 来源溯源
-- D1 不支持 ALTER TABLE 同时加 UNIQUE，故列无约束，唯一索引单独建。
ALTER TABLE conventions ADD COLUMN country_code TEXT;   -- ISO 3166-1 alpha-2，如 CN / JP
ALTER TABLE conventions ADD COLUMN province_code TEXT;  -- 2 位，如 31（上海）
ALTER TABLE conventions ADD COLUMN city_code TEXT;       -- 4 位，如 3101（上海市）
ALTER TABLE conventions ADD COLUMN district_code TEXT;   -- 6 位，如 310115（浦东新区）

-- 来源溯源：自动采集去重与可信度标记
ALTER TABLE conventions ADD COLUMN source TEXT;         -- 'bilibili' | 'cpp' | 'qianyu' | 'qiandao' | 'user'
ALTER TABLE conventions ADD COLUMN source_id TEXT;      -- 源内稳定 id（如会员购 id=1003061）；用户提交为 NULL
ALTER TABLE conventions ADD COLUMN imported_at TEXT;    -- 最近一次采集入库时间

CREATE UNIQUE INDEX IF NOT EXISTS idx_conv_source ON conventions(source, source_id);
CREATE INDEX IF NOT EXISTS idx_conv_pcode ON conventions(province_code);
CREATE INDEX IF NOT EXISTS idx_conv_ccode ON conventions(city_code);
