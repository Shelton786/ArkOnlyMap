-- ============================================================
-- 数据库修复脚本（NOT EXECUTED — 待用户确认后运行）
-- 目标库: arknights-only-map (remote D1)
-- 执行: npx wrangler d1 execute arknights-only-map --remote --file=scripts/ingest/fix_audit.sql
-- 注意: 先做 P0 修正真实城市，再做 P1 去后缀。
-- ============================================================

-- ---------- P0: 修正 9 条 city/province 错填 ----------
UPDATE conventions SET city='杭州', province='浙江'      WHERE id=79;
UPDATE conventions SET city='徐州', province='江苏'      WHERE id=134;
UPDATE conventions SET city='青岛', province='山东'      WHERE id=163;
UPDATE conventions SET city='青岛', province='山东'      WHERE id=201;
UPDATE conventions SET city='青岛', province='山东'      WHERE id=245;
UPDATE conventions SET city='青岛', province='山东'      WHERE id=272;
UPDATE conventions SET city='上海', province='上海'      WHERE id=311;
UPDATE conventions SET city='广州', province='广东'      WHERE id=168;
UPDATE conventions SET city='成都', province='四川'      WHERE id=260;

-- ---------- P1-1: 城市名去「市」后缀 ----------
UPDATE conventions SET city = CASE
  WHEN city LIKE '%市' THEN substr(city, 1, length(city) - 1)
  ELSE city END
WHERE city LIKE '%市';

-- ---------- P1-2: 省份名去「省」/「市」后缀，自治区归一 ----------
UPDATE conventions SET province = CASE
  WHEN province = '广西壮族自治区' THEN '广西'
  WHEN province LIKE '%市' THEN substr(province, 1, length(province) - 1)  -- 直辖市 X市→X
  WHEN province LIKE '%省' THEN substr(province, 1, length(province) - 1)
  ELSE province END
WHERE province LIKE '%市' OR province LIKE '%省' OR province = '广西壮族自治区';

-- ---------- P2 (可选): 单日活动 end_date 补全为 start_date ----------
-- UPDATE conventions SET end_date = start_date WHERE end_date IS NULL AND start_date IS NOT NULL;
