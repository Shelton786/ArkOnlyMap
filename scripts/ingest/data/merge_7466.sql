-- 合并 2026-10-08 巡检命中：上海 [7466]「上海明日方舟ONLY·兔游NO.1」与库内 id=94 是同一场活动。
-- 做法：补齐 id=94 缺失的溯源信息，**保留**其已有的坐标、简介、主办方、审核状态（不新增重复点）。
--   - source/source_id：补 cpp 溯源键
--   - district：补 闵行（原为空）
--   - venue：按源站「上海虹桥品汇A座」同步（原写「A栋」）
--   - poster_url / source_url：补手机端海报 + 电脑端官方跳转链接
UPDATE conventions SET
  source = 'cpp',
  source_id = '7466',
  district = '闵行',
  venue = '上海虹桥品汇A座',
  poster_url = 'https://imagecdn3.allcpp.cn/upload/2026/9/bcb213a3-4a9f-4308-91e3-fe7cc57fea76.png',
  source_url = 'https://www.allcpp.cn/allcpp/event/event.do?event=7466'
WHERE id = 94;