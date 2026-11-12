-- P1.5 数据治理（2026-11-12，一次性脚本；可重复执行）
-- 只读备份：执行前已导出 _p15_audit.txt（仓库根目录 _* 忽略规则内，未入 git）。
-- 口径：province / city / district 名称是事实来源，省市区编码只是可重算的派生元数据。
-- 本脚本只统一写法、修正明显串位的派生编码，绝不改标题 / 日期 / 城市名 / 坐标等活动事实。
-- 不触碰 updated_at，避免 sitemap lastmod 大面积变动。

-- 一、删除 2 条已驳回的垃圾提交（444「..」、448「明日方舟启动」），
--     执行前已确认无子行 parent_event_id 指向它们，且不公开、不影响 382 条公开活动。
DELETE FROM conventions WHERE id IN (444, 448) AND review_status = 'rejected';

-- 二、归一 province 后缀：库内「江苏」/「江苏省」两种写法并存，会让编辑表单的
--     省份下拉失配（form.js matchProvinceKey 的兜底即为解决这个问题）。
--     目标写法取 public/data/geo_codes.json 中同编码的最短别名。共 22 行。
UPDATE conventions SET province = '江苏' WHERE province = '江苏省';   -- 4, 333
UPDATE conventions SET province = '广东' WHERE province = '广东省';   -- 52, 446
UPDATE conventions SET province = '云南' WHERE province = '云南省';   -- 76, 348, 349, 410
UPDATE conventions SET province = '上海' WHERE province = '上海市';   -- 94, 359
UPDATE conventions SET province = '重庆' WHERE province = '重庆市';   -- 158, 251
UPDATE conventions SET province = '湖北' WHERE province = '湖北省';   -- 170, 213, 365, 377, 378, 420
UPDATE conventions SET province = '四川' WHERE province = '四川省';   -- 260, 445
UPDATE conventions SET province = '湖南' WHERE province = '湖南省';   -- 326
UPDATE conventions SET province = '江西' WHERE province = '江西省';   -- 345

-- 三、校正 3 条编码串位：采集期 geocodeBatch 共享 city 导致 city_code / district
--     被配到别的城市。名称、场馆与坐标均自洽，故以名称为准重算 city_code，
--     并把无法从现有信息确定的 district / district_code 清空（不猜具体区县）。
UPDATE conventions SET city_code = '4401', district = NULL, district_code = NULL
  WHERE id = 168 AND city = '广州' AND city_code = '4413';  -- 原 district 惠东县 / 441323
UPDATE conventions SET city_code = '3201', district = NULL, district_code = NULL
  WHERE id = 221 AND city = '南京' AND city_code = '3206';  -- 原 district 如皋市 / 320682
UPDATE conventions SET city_code = '5101', district = NULL, district_code = NULL
  WHERE id = 260 AND city = '成都' AND city_code = '5105';  -- 原 district 泸县 / 510521

-- 四、【刻意不处理】id = 52 / 446「苏州·迅游日记·明日方舟同人ONLY」：
--     名称为「广东省 / 惠州」，但编码 32 / 3205、标题「苏州」、地址「苏州往事主题街区」、
--     坐标 120.595614, 31.184198 全部指向江苏苏州。改名称属于改动活动事实，
--     超出本次「只改写法」的授权范围，留待人工确认后再单独处理。

-- 五、【刻意不处理】剩余同名标题 4 组、同城同日 14 组：按「同品牌多届 / 多城勿并」
--     的既有约定只出清单，不自动合并。清单见项目工作日志 2026-11-12.md。
-- 末尾给一条空查询：wrangler 的 sql.ingest 按分号切语句，纯注释收尾会报
-- "leftover buffer" 警告（不影响结果，但会干扰执行日志的判读）。
SELECT 1;
