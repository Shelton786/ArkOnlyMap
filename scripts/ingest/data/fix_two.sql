-- 一次性修复（2026-10-31，用户指示）
-- id=326 长沙「杰斯顿的多索雷斯一日游」：缺坐标（source=user 手工录入，venue/address/district 均空；
--   已排查 CPP 源站：明日方舟全量 286 条含往期 + 多关键词均无此活动，真实场馆不可考）
--   按 fill_missing_coords.mjs 既有策略用城市名兜底：高德 geocode「长沙」→ 湖南省长沙市
UPDATE conventions SET longitude=112.938882, latitude=28.228304 WHERE id=326;
-- id=37 南京「叁秋·探蕊寻香」：district 疑错（鼓楼 vs 玄武）。
--   高德逆地理编码验证库内坐标 (118.810761,32.08083) → 320102 玄武区锁金村街道六角广场，
--   确认原「鼓楼」(320106) 系错填，坐标本身正确，仅改 district 与 district_code
UPDATE conventions SET district='玄武', district_code='320102' WHERE id=37;
