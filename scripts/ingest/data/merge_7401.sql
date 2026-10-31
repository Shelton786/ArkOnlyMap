-- 7401 杭州明日方舟ONLY-行险手记 合并到 id=321（老手工录入，同城同日 2026-11-14，同一场地）
-- 仅补 source/source_id、district、手机端海报、电脑端官方链接；保留原坐标/标题/简介/审核态，不新增重复点。
UPDATE conventions SET
  source='cpp',
  source_id='7401',
  district='拱墅',
  poster_url='https://imagecdn3.allcpp.cn/upload/2026/9/65ee4709-c6a1-41cf-8385-a112b8547b04.jpg',
  source_url='https://www.allcpp.cn/allcpp/event/event.do?event=7401'
WHERE id=321 AND (source IS NULL OR source != 'cpp');

-- 7466 上海兔游：按源站同步标题（No.→NO.，加间隔号）
UPDATE conventions SET title='上海明日方舟ONLY·兔游NO.1' WHERE source='cpp' AND source_id='7466';
