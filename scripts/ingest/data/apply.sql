-- 合并写入: 匹配现有行则 UPDATE(补充), 否则 INSERT
-- 生成于 2026-08-04 自动去重合并
UPDATE conventions SET
  title = COALESCE('青岛·明日方舟ONLY同人交流会5.0 余的姜齐大冒险', title) ,
  start_date = COALESCE('2026-08-07', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('山东', province) ,
  city = COALESCE('青岛', city) ,
  district = COALESCE('李沧', district) ,
  venue = COALESCE('九龙泉酒店宴会厅（李村派出所旁）', venue) ,
  address = COALESCE('九龙泉酒店宴会厅（李村派出所旁）', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6921', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/fd2c1fa1-945d-4a0f-9e3f-7b413b5728ee.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","青岛","余","桑葚"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(37, province_code) ,
  city_code = COALESCE(3702, city_code) ,
  district_code = COALESCE(370213, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6921, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=77;

UPDATE conventions SET
  title = COALESCE('杭州明日方舟only2.0『星火明灯』', title) ,
  start_date = COALESCE('2026-08-07', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('浙江', province) ,
  city = COALESCE('杭州', city) ,
  district = COALESCE('钱塘', district) ,
  venue = COALESCE('浙江省杭州市钱塘区白杨街道10号大街28号金晶科创园B座3楼宴会厅', venue) ,
  address = COALESCE('浙江省杭州市钱塘区白杨街道10号大街28号金晶科创园B座3楼宴会厅', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6743', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/6/6f6efd60-a3f5-43ee-aea1-31c519296001.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","only","同人"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(33, province_code) ,
  city_code = COALESCE(3301, city_code) ,
  district_code = COALESCE(330114, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6743, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=79;

UPDATE conventions SET
  title = COALESCE('扬州·明日方舟ONLY·岁末千秋', title) ,
  start_date = COALESCE('2026-12-05', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('扬州', city) ,
  district = COALESCE('广陵', district) ,
  venue = COALESCE('涵碧园', venue) ,
  address = COALESCE('涵碧园', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=7062', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/6/927f330b-aab8-425f-a80e-37735a41fc55.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3210, city_code) ,
  district_code = COALESCE(321002, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(7062, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=97;

UPDATE conventions SET
  title = COALESCE('上海明日方舟Only 卡兰托之雨', title) ,
  start_date = COALESCE('2026-07-30', start_date) ,
  end_date = COALESCE('2026-07-31', end_date) ,
  province = COALESCE('上海', province) ,
  city = COALESCE('上海', city) ,
  district = COALESCE('嘉定', district) ,
  venue = COALESCE('上海市嘉定区曹安公路4058号泰美术馆', venue) ,
  address = COALESCE('上海市嘉定区曹安公路4058号泰美术馆', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=7125', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/7/d5238330-1cda-4df6-a767-770460097013.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(31, province_code) ,
  city_code = COALESCE(3101, city_code) ,
  district_code = COALESCE(310114, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(7125, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=93;

UPDATE conventions SET
  title = COALESCE('汕头·明日方舟only 2.0·新月狼时', title) ,
  start_date = COALESCE('2026-07-25', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广东', province) ,
  city = COALESCE('汕头', city) ,
  district = COALESCE('龙湖', district) ,
  venue = COALESCE('龙湖区济阳四巷12号', venue) ,
  address = COALESCE('龙湖区济阳四巷12号', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6878', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/0085eed2-760b-4aff-96a3-9adc6712ce02.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","only展","叙拉古","拉普拉德"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(44, province_code) ,
  city_code = COALESCE(4405, city_code) ,
  district_code = COALESCE(440507, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6878, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=71;

UPDATE conventions SET
  title = COALESCE('梦境收束时 · 明日方舟萨卡兹主题沉浸式同人PARTY · 上海场', title) ,
  start_date = COALESCE('2026-07-24', start_date) ,
  end_date = COALESCE('2026-07-25', end_date) ,
  province = COALESCE('上海', province) ,
  city = COALESCE('上海', city) ,
  district = COALESCE('静安', district) ,
  venue = COALESCE('上海市静安区毕加索艺术馆（北京西路1394号）', venue) ,
  address = COALESCE('上海市静安区毕加索艺术馆（北京西路1394号）', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6987', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/6/dd00b184-4b1a-427e-a83e-0e1c4f007417.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","萨卡兹","上海"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(31, province_code) ,
  city_code = COALESCE(3101, city_code) ,
  district_code = COALESCE(310106, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6987, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=72;

UPDATE conventions SET
  title = COALESCE('昆明烬海灯明明日方舟only', title) ,
  start_date = COALESCE('2026-07-24', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('云南', province) ,
  city = COALESCE('昆明', city) ,
  district = COALESCE('盘龙', district) ,
  venue = COALESCE('昆明市盘龙区清社区居委会沣源路红星美凯龙3号门1楼a8110号纳哈那婚礼艺术中心', venue) ,
  address = COALESCE('昆明市盘龙区清社区居委会沣源路红星美凯龙3号门1楼a8110号纳哈那婚礼艺术中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6958', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/8867867f-ece5-4a47-bf97-d10366313987.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(53, province_code) ,
  city_code = COALESCE(5301, city_code) ,
  district_code = COALESCE(530103, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6958, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=66;

UPDATE conventions SET
  title = COALESCE('兰州·明日方舟ONLY·落幕狂想曲', title) ,
  start_date = COALESCE('2026-07-18', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('甘肃', province) ,
  city = COALESCE('兰州', city) ,
  district = COALESCE('西固', district) ,
  venue = COALESCE('康乐路74号宏达铝业二区1号金麦壹品', venue) ,
  address = COALESCE('康乐路74号宏达铝业二区1号金麦壹品', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6905', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/96623a51-0d65-40b6-a0ae-640676389fe5.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(62, province_code) ,
  city_code = COALESCE(6201, city_code) ,
  district_code = COALESCE(620104, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6905, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=63;

UPDATE conventions SET
  title = COALESCE('福州·明日方舟ONLY2.0 Adele''s Dream', title) ,
  start_date = COALESCE('2026-07-18', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('福建', province) ,
  city = COALESCE('福州', city) ,
  district = COALESCE('仓山', district) ,
  venue = COALESCE('南江滨东大道1号海峡文化艺术中心', venue) ,
  address = COALESCE('南江滨东大道1号海峡文化艺术中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6894', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/4a80c607-e8c0-43fd-8f4b-41e262f60d86.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","明日方舟Only展","福州明日方舟Only展"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(35, province_code) ,
  city_code = COALESCE(3501, city_code) ,
  district_code = COALESCE(350104, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6894, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=64;

UPDATE conventions SET
  title = COALESCE('杭州明日方舟同人only · 卫冕荣耀', title) ,
  start_date = COALESCE('2026-07-17', start_date) ,
  end_date = COALESCE('2026-07-18', end_date) ,
  province = COALESCE('浙江', province) ,
  city = COALESCE('杭州', city) ,
  district = COALESCE('余杭', district) ,
  venue = COALESCE('良渚芯云艺术中心', venue) ,
  address = COALESCE('良渚芯云艺术中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6336', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/5668bd84-a142-48c8-84a9-3c8fa3497adc.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","卡西米尔","耀骑士","瑕光","玛恩纳","鞭刃"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(33, province_code) ,
  city_code = COALESCE(3301, city_code) ,
  district_code = COALESCE(330110, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6336, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=62;

UPDATE conventions SET
  title = COALESCE('北京·明日方舟×终末地同人only', title) ,
  start_date = COALESCE('2026-06-20', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('北京', province) ,
  city = COALESCE('北京', city) ,
  district = COALESCE('朝阳', district) ,
  venue = COALESCE('北投购物公园', venue) ,
  address = COALESCE('北投购物公园', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6931', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/6/381f6f24-11c4-4e51-99e2-e15a04600a60.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","明日方舟终末地"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(11, province_code) ,
  city_code = COALESCE(1101, city_code) ,
  district_code = COALESCE(110105, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6931, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=56;

UPDATE conventions SET
  title = COALESCE('潍坊明日方舟ONLY 年导的旷世之作', title) ,
  start_date = COALESCE('2026-06-19', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('山东', province) ,
  city = COALESCE('潍坊', city) ,
  district = COALESCE('潍城', district) ,
  venue = COALESCE('潍城区民生西街118号潍坊华美达广场酒店', venue) ,
  address = COALESCE('潍城区民生西街118号潍坊华美达广场酒店', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6726', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/4/b5aa5b8c-67ac-40b7-a86e-ae67d2d2cc01.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟同人展"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(37, province_code) ,
  city_code = COALESCE(3707, city_code) ,
  district_code = COALESCE(370702, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6726, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=55;

UPDATE conventions SET
  title = COALESCE('苏州明日方舟ONLY3.0', title) ,
  start_date = COALESCE('2026-06-18', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('苏州', city) ,
  district = COALESCE('吴中', district) ,
  venue = COALESCE('尹山湖美术馆', venue) ,
  address = COALESCE('尹山湖美术馆', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6635', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/c88e1753-9d16-4102-9691-debb566efd60.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","苏州","苏州明日方舟only","only"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3205, city_code) ,
  district_code = COALESCE(320506, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6635, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=53;

UPDATE conventions SET
  title = COALESCE('西安明日方舟only2.0【方舟巡航日】', title) ,
  start_date = COALESCE('2026-06-12', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('陕西', province) ,
  city = COALESCE('西安', city) ,
  district = COALESCE('雁塔', district) ,
  venue = COALESCE('长安中路65号小寨金莎国际酒店', venue) ,
  address = COALESCE('长安中路65号小寨金莎国际酒店', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6603', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/3/6541ebb2-d9a3-4de0-af62-9c5f907b61fa.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","only","方舟巡航日"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(61, province_code) ,
  city_code = COALESCE(6101, city_code) ,
  district_code = COALESCE(610113, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6603, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=51;

UPDATE conventions SET
  title = COALESCE('南京明日方舟ONLY·冰原圣歌', title) ,
  start_date = COALESCE('2026-06-05', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('南京', city) ,
  district = COALESCE('秦淮', district) ,
  venue = COALESCE('天安数码城', venue) ,
  address = COALESCE('天安数码城', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6641', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/4/0dccedee-be41-4416-8cae-aa4f867e0cfb.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3201, city_code) ,
  district_code = COALESCE(320104, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6641, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=50;

UPDATE conventions SET
  title = COALESCE('南宁·明日方舟ONLY·遥夜花火', title) ,
  start_date = COALESCE('2026-05-29', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广西', province) ,
  city = COALESCE('南宁', city) ,
  district = COALESCE('西乡塘', district) ,
  venue = COALESCE('北投明月荟演艺中心', venue) ,
  address = COALESCE('北投明月荟演艺中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6375', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/83869e05-7d5f-4d66-a4b6-353dbb331179.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(NULL, province_code) ,
  city_code = COALESCE(4501, city_code) ,
  district_code = COALESCE(450107, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6375, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=49;

UPDATE conventions SET
  title = COALESCE('ONLY · 哈尔滨·第五届明日方舟同人only·哈基迷城', title) ,
  start_date = COALESCE('2026-05-16', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('黑龙江', province) ,
  city = COALESCE('哈尔滨', city) ,
  district = COALESCE('香坊', district) ,
  venue = COALESCE('公滨路40号卓琳酒店', venue) ,
  address = COALESCE('公滨路40号卓琳酒店', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6808', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/5/368637b5-95d6-4509-97d1-fd379a3c1f78.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","同人","only"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(23, province_code) ,
  city_code = COALESCE(2301, city_code) ,
  district_code = COALESCE(230110, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6808, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=46;

UPDATE conventions SET
  title = COALESCE('「溯羽循光」·明日方舟赫默生咖', title) ,
  start_date = COALESCE('2026-05-15', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广东', province) ,
  city = COALESCE('广州', city) ,
  district = COALESCE('天河', district) ,
  venue = COALESCE('六运一街19号104 Waiting coffee', venue) ,
  address = COALESCE('六运一街19号104 Waiting coffee', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6442', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/3/d84ae46a-6fa6-431b-b843-a8b7d0d86cb6.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","赫默"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(44, province_code) ,
  city_code = COALESCE(4401, city_code) ,
  district_code = COALESCE(440106, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6442, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=45;

UPDATE conventions SET
  title = COALESCE('南京叁秋·明日方舟同人only·探蕊寻香', title) ,
  start_date = COALESCE('2026-04-18', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('南京', city) ,
  district = COALESCE('鼓楼', district) ,
  venue = COALESCE('六角广场负一层', venue) ,
  address = COALESCE('六角广场负一层', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6262', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/1/5bdc3ba0-0047-4c5a-88a5-485fcf288daf.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3201, city_code) ,
  district_code = COALESCE(320106, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6262, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=37;

UPDATE conventions SET
  title = COALESCE('大连明日方舟ONLY3.0 伊甸之息', title) ,
  start_date = COALESCE('2026-04-17', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('辽宁', province) ,
  city = COALESCE('大连', city) ,
  district = COALESCE('沙河口', district) ,
  venue = COALESCE('中央大道格乐利雅艺术中心8号厅', venue) ,
  address = COALESCE('中央大道格乐利雅艺术中心8号厅', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6374', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/a21348f8-19fa-4bad-a968-bed53165f2ff.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟ONLY"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(21, province_code) ,
  city_code = COALESCE(2102, city_code) ,
  district_code = COALESCE(210204, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6374, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=36;

UPDATE conventions SET
  title = COALESCE('舟趴4.0 泰拉东游记 成都明日方舟ONLY', title) ,
  start_date = COALESCE('2026-04-10', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('四川', province) ,
  city = COALESCE('成都', city) ,
  district = COALESCE('金牛', district) ,
  venue = COALESCE('金牛坝路10号天合礼宴中心（易园店）', venue) ,
  address = COALESCE('金牛坝路10号天合礼宴中心（易园店）', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6450', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/3/d16460d4-1305-440f-b7e1-d82c6bbb9faf.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","同人","摊位","舟趴"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(51, province_code) ,
  city_code = COALESCE(5101, city_code) ,
  district_code = COALESCE(510106, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6450, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=35;

UPDATE conventions SET
  title = COALESCE('广州碎梦·明日方舟同人Only展', title) ,
  start_date = COALESCE('2026-04-10', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广东', province) ,
  city = COALESCE('广州', city) ,
  district = COALESCE('海珠', district) ,
  venue = COALESCE('广州市海珠区新港东路1088号 琶洲六元素体验天地 负一层', venue) ,
  address = COALESCE('广州市海珠区新港东路1088号 琶洲六元素体验天地 负一层', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6306', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/b85cad7b-4f10-451d-ab75-a7b13cb7e187.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(44, province_code) ,
  city_code = COALESCE(4401, city_code) ,
  district_code = COALESCE(440105, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6306, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=34;

UPDATE conventions SET
  title = COALESCE('长沙明日方舟同人only「朝思见闻峰会」', title) ,
  start_date = COALESCE('2026-04-04', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('湖南', province) ,
  city = COALESCE('长沙', city) ,
  district = COALESCE('芙蓉', district) ,
  venue = COALESCE('人民东路二段668号谷谷岛Paddy Land', venue) ,
  address = COALESCE('人民东路二段668号谷谷岛Paddy Land', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5597', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/12/357f4beb-22a7-4c2c-8604-fee53fa967bd.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["only","明日方舟","湖南","长沙","拉特兰","新约能天使","蕾缪乐","蕾缪安","能天使","众生行记"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(43, province_code) ,
  city_code = COALESCE(4301, city_code) ,
  district_code = COALESCE(430102, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5597, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=32;

UPDATE conventions SET
  title = COALESCE('武汉4.4明日方舟only肉鸽迷踪集成战略同人展', title) ,
  start_date = COALESCE('2026-04-03', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('湖北', province) ,
  city = COALESCE('武汉', city) ,
  district = COALESCE('汉阳', district) ,
  venue = COALESCE('玺合婚礼宴会（琴台店）湖北省武汉市汉阳区琴台文化艺术中心一层汉江江滩公园南门东350米', venue) ,
  address = COALESCE('玺合婚礼宴会（琴台店）湖北省武汉市汉阳区琴台文化艺术中心一层汉江江滩公园南门东350米', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6393', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/7544b0ef-91e0-43b1-a477-a09f12237983.jpeg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","明日方舟only","同人摊","汐小豹","集成战略","线下漫展","cosplay"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(42, province_code) ,
  city_code = COALESCE(4201, city_code) ,
  district_code = COALESCE(420105, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6393, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=31;

UPDATE conventions SET
  title = COALESCE('厦门明日方舟ONLY2.0', title) ,
  start_date = COALESCE('2026-03-27', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('福建', province) ,
  city = COALESCE('厦门', city) ,
  district = COALESCE('湖里', district) ,
  venue = COALESCE('好书画产业园一楼（湖里区翔云三路271号）', venue) ,
  address = COALESCE('好书画产业园一楼（湖里区翔云三路271号）', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6197', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/1/1abdb41c-56d7-4b0d-af94-756f76daeaf6.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","岁家","明日方舟黍"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(35, province_code) ,
  city_code = COALESCE(3502, city_code) ,
  district_code = COALESCE(350206, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6197, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=29;

UPDATE conventions SET
  title = COALESCE('正阳象限明日方舟ONLY5.0:「春雨京春」', title) ,
  start_date = COALESCE('2026-03-20', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('北京', province) ,
  city = COALESCE('北京', city) ,
  district = COALESCE('朝阳', district) ,
  venue = COALESCE('全国农业展览馆', venue) ,
  address = COALESCE('全国农业展览馆', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6226', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/2/448f3eec-273c-405e-8013-71130adfff8e.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","粥","缪尔赛思","司霆惊蛰"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(11, province_code) ,
  city_code = COALESCE(1101, city_code) ,
  district_code = COALESCE(110105, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6226, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=26;

UPDATE conventions SET
  title = COALESCE('「321，罗德岛」西安明日方舟only', title) ,
  start_date = COALESCE('2026-03-20', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('陕西', province) ,
  city = COALESCE('西安', city) ,
  district = COALESCE('灞桥', district) ,
  venue = COALESCE('浐灞大道88号丝路国际文化艺术中心', venue) ,
  address = COALESCE('浐灞大道88号丝路国际文化艺术中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5823', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/11/16f0d12f-bd65-416a-aed5-7eadb48e2242.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","only"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(61, province_code) ,
  city_code = COALESCE(6101, city_code) ,
  district_code = COALESCE(610111, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5823, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=25;

UPDATE conventions SET
  title = COALESCE('【风华粤韵】广州明日方舟ONLY2.0', title) ,
  start_date = COALESCE('2026-03-13', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广东', province) ,
  city = COALESCE('广州', city) ,
  district = COALESCE('荔湾', district) ,
  venue = COALESCE('健康方舟六楼会展中心博览馆（广东省广州市荔湾区东沙大道16号）', venue) ,
  address = COALESCE('健康方舟六楼会展中心博览馆（广东省广州市荔湾区东沙大道16号）', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5870', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/10/aabe619a-5a9e-4c8f-a251-d1f87a36a70c.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(44, province_code) ,
  city_code = COALESCE(4401, city_code) ,
  district_code = COALESCE(440103, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5870, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=22;

UPDATE conventions SET
  title = COALESCE('上海明日方舟only·莫欺海嗣穷', title) ,
  start_date = COALESCE('2026-03-13', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('上海', province) ,
  city = COALESCE('上海', city) ,
  district = COALESCE('浦东新区', district) ,
  venue = COALESCE('上海浦东新区金沪路358弄会议中心', venue) ,
  address = COALESCE('上海浦东新区金沪路358弄会议中心', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5731', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/9/82a3e767-5c78-4a98-b8d5-5d64a47a4904.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","上海明日方舟only","海嗣","深海猎人"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(31, province_code) ,
  city_code = COALESCE(3101, city_code) ,
  district_code = COALESCE(310115, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5731, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=23;

UPDATE conventions SET
  title = COALESCE('广州星罗棋布明日方舟ONLY', title) ,
  start_date = COALESCE('2026-03-07', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('广东', province) ,
  city = COALESCE('广州', city) ,
  district = COALESCE('白云', district) ,
  venue = COALESCE('西城智汇park', venue) ,
  address = COALESCE('西城智汇park', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5949', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/10/d79947d7-76a6-410b-abde-529f226a3ed5.png', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","广州明日方舟","二次元","明日方舟only","广州星罗棋布明日方舟only"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(44, province_code) ,
  city_code = COALESCE(4401, city_code) ,
  district_code = COALESCE(440111, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5949, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=20;

UPDATE conventions SET
  title = COALESCE('ONLY·扬州·明日方舟·三分明月夜', title) ,
  start_date = COALESCE('2026-02-28', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('扬州', city) ,
  district = COALESCE('广陵', district) ,
  venue = COALESCE('扬州创新中心A座4楼', venue) ,
  address = COALESCE('扬州创新中心A座4楼', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5383', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2026/1/70cfa63f-5ba5-4c5a-a6ad-4ec5a3d0d5f5.jpeg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟","only","同人","扬州"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3210, city_code) ,
  district_code = COALESCE(321002, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5383, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=17;

UPDATE conventions SET
  title = COALESCE('沈阳明日方舟only4.0：残响初啼', title) ,
  start_date = COALESCE('2026-01-31', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('辽宁', province) ,
  city = COALESCE('沈阳', city) ,
  district = COALESCE('沈北新区', district) ,
  venue = COALESCE('道义南大街8-1号10门沈阳华强诺华庭酒店华强厅', venue) ,
  address = COALESCE('道义南大街8-1号10门沈阳华强诺华庭酒店华强厅', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=6085', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/11/6096c680-c0c2-4c5e-9f23-0b10d7190401.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(21, province_code) ,
  city_code = COALESCE(2101, city_code) ,
  district_code = COALESCE(210113, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(6085, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=11;

UPDATE conventions SET
  title = COALESCE('南京叁秋·明日方舟同人only·荆棘暗流', title) ,
  start_date = COALESCE('2025-10-17', start_date) ,
  end_date = COALESCE(NULL, end_date) ,
  province = COALESCE('江苏', province) ,
  city = COALESCE('南京', city) ,
  district = COALESCE('秦淮', district) ,
  venue = COALESCE('越界梦幻城', venue) ,
  address = COALESCE('越界梦幻城', address) ,
  longitude = COALESCE(NULL, longitude) ,
  latitude = COALESCE(NULL, latitude) ,
  description = COALESCE(NULL, description) ,
  organizer = COALESCE(NULL, organizer) ,
  source_url = COALESCE('https://www.allcpp.cn/allcpp/event/event.do?event=5525', source_url) ,
  poster_url = COALESCE('https://imagecdn3.allcpp.cn/upload/2025/7/d984f79a-dce1-474a-a6b4-7d23d1d300f1.jpg', poster_url) ,
  verified = COALESCE(verified, 0) ,
  tags = COALESCE('["明日方舟"]', tags) ,
  country = COALESCE('中国', country) ,
  country_code = COALESCE('CN', country_code) ,
  province_code = COALESCE(32, province_code) ,
  city_code = COALESCE(3201, city_code) ,
  district_code = COALESCE(320104, district_code) ,
  source = COALESCE('cpp', source) ,
  source_id = COALESCE(5525, source_id) ,
  imported_at = COALESCE('2026-08-04 03:49:50', imported_at) ,
  review_status = COALESCE(review_status, 'pending') ,
  submitted_by = COALESCE(NULL, submitted_by)
WHERE id=131;

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京·明日方舟only·焰火未熄', '2026-08-07', NULL, '北京', '北京', '朝阳', 'Thebone潮街 西区（独立展区）', 'Thebone潮街 西区（独立展区）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7129', 'https://imagecdn3.allcpp.cn/upload/2026/7/e347644a-7983-447c-8518-8244737458c3.jpg', 0, '["明日方舟","明日方舟only"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 7129, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【无因】上海明日方舟ONLY', '2026-08-07', '2026-08-08', '上海', '上海', '浦东新区', '正大广场', '正大广场', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6992', 'https://imagecdn3.allcpp.cn/upload/2026/6/f959f50f-a090-4ac5-8bfc-8bf01ce00d2d.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 6992, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('徐州·明日方舟同人only泰拉巡游-彭城假日', '2026-08-08', NULL, '江苏', '徐州', '鼓楼', '徐州市苏宁银河国际酒店 淮海东路29(彭城广场地铁站5号口旁）', '徐州市苏宁银河国际酒店 淮海东路29(彭城广场地铁站5号口旁）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7176', 'https://imagecdn3.allcpp.cn/upload/2026/7/c8664baa-9536-41f5-82a2-b64672d425e1.jpg', 0, '["明日方舟"]', '中国', 'CN', 32, 3203, 320302, 'cpp', 7176, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('[晋波澜]山西明日方舟ONLY03', '2026-08-14', NULL, '山西', '太原', '迎泽', '同至人购物中心8F', '同至人购物中心8F', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7165', 'https://imagecdn3.allcpp.cn/upload/2026/7/358168e6-6e2f-43f8-b809-61d0f6b315c9.png', 0, '["明日方舟"]', '中国', 'CN', 14, 1401, 140106, 'cpp', 7165, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY1.0-夏日派对', '2026-08-14', NULL, '上海', '上海', '浦东新区', '浦东新区融媒体中心', '浦东新区融媒体中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7100', 'https://imagecdn3.allcpp.cn/upload/2026/7/e113520f-b3da-41a2-8663-09ebfce37be7.png', 0, '["明日方舟","上海","上海明日方舟only"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 7100, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('临界·寻遗X明日方舟终末地ONLY', '2026-08-14', NULL, '江苏', '无锡', '新吴', '格乐利雅艺术中心', '格乐利雅艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7057', 'https://imagecdn3.allcpp.cn/upload/2026/6/37ef4956-5a43-4137-abc9-d165ebcc156e.png', 0, '["明日方舟","终末地"]', '中国', 'CN', 32, 3202, 320214, 'cpp', 7057, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙·首届明日方舟×终末地ONLY·跨越大地的相遇', '2026-08-15', NULL, '湖南', '长沙', '雨花', '中非经贸合作促进创新示范园7楼', '中非经贸合作促进创新示范园7楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7105', 'https://imagecdn3.allcpp.cn/upload/2026/7/c79281b0-3e49-42a6-b0ee-2c104b060737.png', 0, '["明日方舟","终末地"]', '中国', 'CN', 43, 4301, 430111, 'cpp', 7105, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('绫研文化·天津明日方舟ONLY5.0·瑶津漱玉', '2026-08-21', NULL, '天津', '天津', '南开', '品所中心', '品所中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7181', 'https://imagecdn3.allcpp.cn/upload/2026/7/f2654e1b-1fca-4915-8e66-e07befa2664d.png', 0, '["明日方舟","明日方舟only"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 7181, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('沈阳明日方舟only：空庭循迹', '2026-08-22', NULL, '辽宁', '沈阳', '于洪', '于洪碧桂园酒店', '于洪碧桂园酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7174', 'https://imagecdn3.allcpp.cn/upload/2026/7/d15c5d42-ea18-42ca-9559-91e9db19cf15.jpg', 0, '["明日方舟"]', '中国', 'CN', 21, 2101, 210114, 'cpp', 7174, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('正阳象限明日方舟ONLY6.0:「声筑京筵」', '2026-09-04', NULL, '北京', '北京', '朝阳', '全国农业展览馆', '全国农业展览馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7064', 'https://imagecdn3.allcpp.cn/upload/2026/6/c458972e-6d4b-47ea-9363-d966dcf268c3.png', 0, '["明日方舟","拉普兰德","酒神","傀影"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 7064, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('幕间：虹光序曲——广州傀暮only', '2026-09-05', NULL, '广东', '广州', '海珠', '赤岗西路286-288号 杨协成时尚工场', '赤岗西路286-288号 杨协成时尚工场', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7063', 'https://imagecdn3.allcpp.cn/upload/2026/6/adcb69a7-5bf6-44dd-8eae-9ba600356f82.jpg', 0, '["明日方舟","傀暮"]', '中国', 'CN', 44, 4401, 440105, 'cpp', 7063, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('「铳火序曲」西安明日方舟only', '2026-09-11', NULL, '陕西', '西安', '灞桥', '浐灞大道88号丝路国际文化艺术中心', '浐灞大道88号丝路国际文化艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6824', 'https://imagecdn3.allcpp.cn/upload/2026/5/da237a11-bcb9-4a97-86aa-2864eb85093e.png', 0, '["明日方舟"]', '中国', 'CN', 61, 6101, 610111, 'cpp', 6824, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉尘雾归航·明日方舟only1.0', '2026-09-25', NULL, '湖北', '武汉', '洪山', '洪山区烟霞路1号汉街万达广场三楼元气幻界', '洪山区烟霞路1号汉街万达广场三楼元气幻界', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7097', 'https://imagecdn3.allcpp.cn/upload/2026/7/9d23c375-e191-4b01-bea2-c25b344a7cb5.jpg', 0, '["明日方舟","同人展","only"]', '中国', 'CN', 42, 4201, 420111, 'cpp', 7097, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('醉弈秦川 西安明日方舟only', '2026-10-23', NULL, '陕西', '西安', '长安', '陕西省西安市长安区常宁宫园林酒店', '陕西省西安市长安区常宁宫园林酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7143', 'https://imagecdn3.allcpp.cn/upload/2026/7/d6ddcc1b-f271-49c0-a3af-d079e296d234.png', 0, '["醉弈秦川明日方舟only","明日方舟"]', '中国', 'CN', 61, 6101, 610116, 'cpp', 7143, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟「愚者」only', '2026-12-05', NULL, '广东', '广州', '海珠', '广东省广州市海珠区新港东路628号中岱交易广场b2层LIC灵感创新展馆', '广东省广州市海珠区新港东路628号中岱交易广场b2层LIC灵感创新展馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7192', 'https://imagecdn3.allcpp.cn/upload/2026/7/56d06066-ef61-48ff-8ab8-beeecd12133c.png', 0, '["明日方舟","明日方舟only","广州明日方舟only"]', '中国', 'CN', 44, 4401, 440105, 'cpp', 7192, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【开票啦！】寻味武陵：上海终末地Only', '2026-08-01', NULL, '上海', '上海', '嘉定', '环贸国际大厦·卡伦湾', '环贸国际大厦·卡伦湾', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6969', 'https://imagecdn3.allcpp.cn/upload/2026/6/0ea846f6-b0fa-4229-b775-ecc69345ce3b.png', 0, '["终末地","明日方舟","武陵"]', '中国', 'CN', 31, 3101, 310114, 'cpp', 6969, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南宁·猎潮幽影·明日方舟ONLY', '2026-08-01', NULL, '广西', '南宁', '青秀', '南宁市青秀区东悦巷11号', '南宁市青秀区东悦巷11号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4765', 'https://imagecdn3.allcpp.cn/upload/2026/2/24c23844-3e7e-4541-a968-d97793b733a8.png', 0, '["明日方舟","乌尔比安","幽灵鲨","斯卡蒂","歌蕾蒂娅"]', '中国', 'CN', NULL, 4501, 450103, 'cpp', 4765, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟only-泡泡游记（游轮场）', '2026-07-31', NULL, '上海', '上海', '黄浦', '十六铺二号码头', '十六铺二号码头', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7075', 'https://imagecdn3.allcpp.cn/upload/2026/6/fb60e28c-2a7a-4084-96cd-f6d1b6ef253e.jpg', 0, '["明日方舟","舟o","明日方舟only"]', '中国', 'CN', 31, 3101, 310101, 'cpp', 7075, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州·明日方舟only·荔枝味夏梦', '2026-07-25', NULL, '广东', '广州', '海珠', '广州市海珠区新港东路628号中岱交易广场（近新港东地铁站F口）', '广州市海珠区新港东路628号中岱交易广场（近新港东地铁站F口）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=7137', 'https://imagecdn3.allcpp.cn/upload/2026/7/c0785214-9007-4e9d-8dac-5b3ec9291ac6.jpg', 0, '["明日方舟","only","广州"]', '中国', 'CN', 44, 4401, 440105, 'cpp', 7137, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海ACF明日方舟创作者庆典2.0', '2026-05-02', '2026-05-03', '上海', '上海', '闵行', '虹桥品汇B栋', '虹桥品汇B栋', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6631', 'https://imagecdn3.allcpp.cn/upload/2026/4/02065c73-d212-44d7-846a-cf4675d47d92.png', 0, '["明日方舟","ACF明日方舟创作者庆典","明日方舟ONLY"]', '中国', 'CN', 31, 3101, 310112, 'cpp', 6631, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('第四届上海明日方舟Only 绒绒贝利', '2026-05-02', '2026-05-03', '上海', '上海', '黄浦', '南京西路新世界城11楼', '南京西路新世界城11楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6535', 'https://imagecdn3.allcpp.cn/upload/2026/3/3cab2f48-d8f7-452a-a873-0104da29f5f0.png', 0, '["明日方舟","明日方舟Only"]', '中国', 'CN', 31, 3101, 310101, 'cpp', 6535, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('宁波·潮甬青年文化季——潮聚甬州，青春无界', '2026-04-30', '2026-05-01', '浙江', '宁波', '鄞州', '宁波国际会议中心', '宁波国际会议中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6341', 'https://imagecdn3.allcpp.cn/upload/2026/4/1e98f702-8133-415e-b189-87a37903e278.jpg', 0, '["acgworld","崩坏星穹铁道","原神","明日方舟","绝区零","狐妖小红娘","国漫"]', '中国', 'CN', 33, 3302, 330212, 'cpp', 6341, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('Eutopia－北京明日方舟七周年前瞻直播观影会', '2026-04-24', NULL, '北京', '北京', '丰台', '北京大方瑞廷西郊酒店', '北京大方瑞廷西郊酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6623', 'https://imagecdn3.allcpp.cn/upload/2026/4/0a1d93f4-e7d8-458a-beda-9638e81090b6.png', 0, '["明日方舟"]', '中国', 'CN', 11, 1101, 110106, 'cpp', 6623, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('河北明日方舟only-烬潮挽歌', '2026-04-05', NULL, '河北', '石家庄', '长安', '石家庄市长安区体育北大街56号美丽华大酒店', '石家庄市长安区体育北大街56号美丽华大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6394', 'https://imagecdn3.allcpp.cn/upload/2026/3/dfbaa69f-a7d1-4f7b-8164-063eecb5b614.jpg', 0, '["明日方舟"]', '中国', 'CN', 13, 1301, 130102, 'cpp', 6394, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉明日方舟ONLY2.0·入明界园', '2026-03-20', NULL, '湖北', '武汉', '硚口', '武汉国际时尚中心8楼 中山大道388号', '武汉国际时尚中心8楼 中山大道388号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6272', 'https://imagecdn3.allcpp.cn/upload/2026/1/371868b9-0bd4-4ee5-bb92-aadb7237dbe8.png', 0, '["明日方舟","明日方舟ONLY","武汉明日方舟ONLY"]', '中国', 'CN', 42, 4201, 420104, 'cpp', 6272, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京•ArkOnly01~天使的星期日', '2026-03-07', NULL, '江苏', '南京', '江宁', '越秀路88号南京空港会展中心', '越秀路88号南京空港会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6109', 'https://imagecdn3.allcpp.cn/upload/2025/12/496bbcaa-f492-4987-9917-3670f8a9c57c.png', 0, '["明日方舟"]', '中国', 'CN', 32, 3201, 320115, 'cpp', 6109, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('重庆明日方舟ONLY-春日轻步宴', '2026-03-06', NULL, '重庆', '重庆', '江北', '鸿恩陶然大观园', '鸿恩陶然大观园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6400', 'https://imagecdn3.allcpp.cn/upload/2026/2/4a44ac9a-dc74-42e0-987b-e09c3f4f9198.png', 0, '["明日方舟","明日方舟终末地"]', '中国', 'CN', 50, 5001, 500105, 'cpp', 6400, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·次元LINK·明日方舟同人ONLY·岁聿云暮', '2026-02-19', NULL, '天津', '天津', '河东', '玺瑞宴会艺术中心', '玺瑞宴会艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6305', 'https://imagecdn3.allcpp.cn/upload/2026/1/8938f7c9-0605-40c1-9884-030ed2d00cad.jpg', 0, '["明日方舟","ONLY"]', '中国', 'CN', 12, 1201, 120102, 'cpp', 6305, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('only·南宁·第四届明日方舟only展【龙门X整合运动】首次双主题对抗——《赤霄映雪》', '2026-02-07', NULL, '广西', '南宁', '西乡塘', '水明漾宴会中心（邕武地铁站店）', '水明漾宴会中心（邕武地铁站店）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6061', 'https://imagecdn3.allcpp.cn/upload/2025/11/f727c8df-aa78-4514-a388-8e57980528e0.jpg', 0, '["明日方舟","only","同人","摊位","龙门","整合运动","cosplay","广西南宁"]', '中国', 'CN', NULL, 4501, 450107, 'cpp', 6061, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州·明日方舟ONLY·重山秘行', '2026-02-06', '2026-02-07', '浙江', '杭州', '余杭', '良渚芯云艺术中心', '良渚芯云艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5941', 'https://imagecdn3.allcpp.cn/upload/2025/12/10632fb3-6894-4c5e-b231-2ecc5f26224f.png', 0, '["明日方舟"]', '中国', 'CN', 33, 3301, 330110, 'cpp', 5941, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('福州明日方舟Only【舟茗榕境】', '2026-01-31', NULL, '福建', '福州', '仓山', '海峡文化艺术中心', '海峡文化艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6078', 'https://imagecdn3.allcpp.cn/upload/2025/11/c8eec155-6ff7-461b-b488-cf93e047c0c1.png', 0, '["明日方舟","明日方舟only","only"]', '中国', 'CN', 35, 3501, 350104, 'cpp', 6078, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('青岛明日方舟ONLY同人交流会4.0 罗德岛食堂历险记', '2026-01-30', NULL, '山东', '青岛', '李沧', '九龙泉酒店宴会厅（李村派出所旁）', '九龙泉酒店宴会厅（李村派出所旁）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5910', 'https://imagecdn3.allcpp.cn/upload/2025/10/57233645-d0a0-49b2-ad7f-ff265afe521f.png', 0, '["明日方舟","青岛","ONLY"]', '中国', 'CN', 37, 3702, 370213, 'cpp', 5910, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州明日方舟only「年丰岁稔」', '2026-01-23', NULL, '浙江', '杭州', '余杭', '浙江大学校友企业总部经济园二期C2-C3-1F大厅', '浙江大学校友企业总部经济园二期C2-C3-1F大厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6131', 'https://imagecdn3.allcpp.cn/upload/2025/12/86fbed3d-657d-401d-8ed0-45c475b67efd.jpg', 0, '["明日方舟","杭州","only"]', '中国', 'CN', 33, 3301, 330110, 'cpp', 6131, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY“雪途回响”', '2026-01-16', '2026-01-17', '上海', '上海', '浦东新区', '上海浦东新区“水口道场”（御北路456号天御商厦F5）', '上海浦东新区“水口道场”（御北路456号天御商厦F5）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6073', 'https://imagecdn3.allcpp.cn/upload/2025/12/980cffdd-76ae-42e8-89e3-01693af9299b.jpg', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 6073, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海·明日方舟ONLY·雏梅唤春', '2026-01-01', NULL, '上海', '上海', '宝山', '呼青路158号交运智慧湾科创园25号楼', '呼青路158号交运智慧湾科创园25号楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6097', 'https://imagecdn3.allcpp.cn/upload/2025/12/bc684bfa-8f3f-4f41-9d1f-b8d422f30221.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310113, 'cpp', 6097, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙·明日方舟茶话会·岁岁有余', '2025-12-31', NULL, '湖南', '长沙', '雨花', '汇金天虹购物中心L4叠谷花园', '汇金天虹购物中心L4叠谷花园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6147', 'https://imagecdn3.allcpp.cn/upload/2025/12/18873c44-5d28-46b4-8dc2-515b9e64607b.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430111, 'cpp', 6147, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟ONLY·【新生】', '2025-12-26', NULL, '广东', '广州', '荔湾', '健康方舟会展中心博览馆', '健康方舟会展中心博览馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5197', 'https://imagecdn3.allcpp.cn/upload/2025/9/99cca8e6-452d-4a71-a729-d02e3a045507.png', 0, '["明日方舟","only","广州","巴别塔"]', '中国', 'CN', 44, 4401, 440103, 'cpp', 5197, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('青岛明日方舟only龙门岁暮', '2025-12-19', NULL, '山东', '青岛', '李沧', '山东省青岛市李沧区书院路198号九龙泉大酒店宴会厅', '山东省青岛市李沧区书院路198号九龙泉大酒店宴会厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5898', 'https://imagecdn3.allcpp.cn/upload/2025/10/86428a9d-cd33-47ea-b42a-45f0404621f4.jpg', 0, '["明日方舟"]', '中国', 'CN', 37, 3702, 370213, 'cpp', 5898, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉·明日方舟ONLY—大炎江城博览会【炎博会·圣徒行记】', '2025-12-05', NULL, '湖北', '武汉', '汉阳', '玺合婚礼宴会(琴台花园店)', '玺合婚礼宴会(琴台花园店)', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5992', 'https://imagecdn3.allcpp.cn/upload/2025/11/9c87b096-99e1-47cb-953a-cc0e3060228e.png', 0, '["明日方舟","武汉","同人"]', '中国', 'CN', 42, 4201, 420105, 'cpp', 5992, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·明日方舟同人Olny·泰拉巡礼', '2025-11-28', NULL, '天津', '天津', '南开', '天佑城4F梦想空间', '天佑城4F梦想空间', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=6044', 'https://imagecdn3.allcpp.cn/upload/2025/11/09b578f2-42df-45f6-b7e6-f089389a78ff.jpg', 0, '["泰拉巡礼"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 6044, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟only｜迷城漫游', '2025-11-28', NULL, '上海', '上海', '闵行', '申武路189号丽宝广场1号楼T1A M层集合石潮玩中心', '申武路189号丽宝广场1号楼T1A M层集合石潮玩中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5842', 'https://imagecdn3.allcpp.cn/upload/2025/10/cfd12dd4-120d-4a57-b33a-737e7e9eb7f6.jpg', 0, '["明日方舟","手游","同人"]', '中国', 'CN', 31, 3101, 310112, 'cpp', 5842, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('揭幕时刻·厦门明日方舟ONLY', '2025-11-28', NULL, '福建', '厦门', '集美', '绿帝·绿空间（厦门市集美区园博南路）', '绿帝·绿空间（厦门市集美区园博南路）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5474', 'https://imagecdn3.allcpp.cn/upload/2025/7/6b3fa30b-65ef-46a5-b47b-1d60a7d3339a.png', 0, '["明日方舟"]', '中国', 'CN', 35, 3502, 350211, 'cpp', 5474, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南昌明日方舟ONLY·【未竟航程】', '2025-11-21', NULL, '江西', '南昌', '东湖', '民德路411号东方豪景花园酒店2F宴会厅', '民德路411号东方豪景花园酒店2F宴会厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5958', 'https://imagecdn3.allcpp.cn/upload/2025/11/4fe3e8a7-a687-43b9-9f8e-4c7fccdd24a3.png', 0, '["明日方舟","南昌","only","罗德岛","ONLY"]', '中国', 'CN', 36, 3601, 360102, 'cpp', 5958, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('ONLY · 宁波明日方舟同人ONLY展-惊心动魄！少女们的茶会', '2025-11-21', NULL, '浙江', '宁波', '海曙', '钰宴宴会艺术中心', '钰宴宴会艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5925', 'https://imagecdn3.allcpp.cn/upload/2025/10/9a2e2d4d-49b4-4acb-9cff-db27b49d62df.png', 0, '["明日方舟"]', '中国', 'CN', 33, 3302, 330203, 'cpp', 5925, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙·明日方舟ONLY·剑舞樱华', '2025-11-21', '2025-11-22', '湖南', '长沙', '雨花', '华晨世纪广场Funclub同人中心', '华晨世纪广场Funclub同人中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5788', 'https://imagecdn3.allcpp.cn/upload/2025/10/305630a7-a04c-4ed9-b8da-59f433ac4383.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430111, 'cpp', 5788, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('11/22杭州明日方舟ONLY 无终奇语', '2025-11-21', NULL, '浙江', '杭州', '拱墅', '杭州大厦购物城 中央商城', '杭州大厦购物城 中央商城', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5751', 'https://imagecdn3.allcpp.cn/upload/2025/9/0a2da45a-745a-451d-bc65-07a728b56597.jpg', 0, '["#明日方舟","#逻各斯","#ew","#泥岩","#妮芙"]', '中国', 'CN', 33, 3301, 330105, 'cpp', 5751, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京明日方舟ONLY——圣律骑迹', '2025-11-14', NULL, '江苏', '南京', '江宁', '上秦淮国际文化交流中心', '上秦淮国际文化交流中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5668', 'https://imagecdn3.allcpp.cn/upload/2025/9/54a3068f-bfe8-46ef-8e3a-fe2f4ff97902.jpg', 0, '["明日方舟","南京明日方舟only"]', '中国', 'CN', 32, 3201, 320115, 'cpp', 5668, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州·明日方舟ONLY·柑橘味福音', '2025-11-14', '2025-11-15', '广东', '广州', '荔湾', '广东省广州市荔湾区东沙大道16号健康方舟6楼会议会展中心', '广东省广州市荔湾区东沙大道16号健康方舟6楼会议会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5639', 'https://imagecdn3.allcpp.cn/upload/2025/9/59fd81cb-81bc-4304-a74e-79981c5f2db9.png', 0, '["only","明日方舟","同人"]', '中国', 'CN', 44, 4401, 440103, 'cpp', 5639, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨·第四届明日方舟同人only·银心煅雪', '2025-11-08', NULL, '黑龙江', '哈尔滨', '香坊', '公滨路40号卓琳酒店', '公滨路40号卓琳酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5904', 'https://imagecdn3.allcpp.cn/upload/2025/10/fbfc1a24-4f99-4114-a812-93be54118286.png', 0, '["明日方舟","only","鹰角网络","终末地"]', '中国', 'CN', 23, 2301, 230110, 'cpp', 5904, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('月夕茶话-南昌明日方舟茶话会', '2025-10-05', NULL, '江西', '南昌', '东湖', '中山路271号（万寿宫地铁2号口步行150米）中国银行二楼', '中山路271号（万寿宫地铁2号口步行150米）中国银行二楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5493', 'https://imagecdn3.allcpp.cn/upload/2025/7/93ce040d-bfa0-4f61-ba97-9d17bd258e05.png', 0, '["明日方舟","茶话会"]', '中国', 'CN', 36, 3601, 360102, 'cpp', 5493, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟only-岁入长荷去', '2025-10-04', NULL, '上海', '上海', '宝山', '上海市宝山区呼青路158号交运智慧湾科创园25号楼', '上海市宝山区呼青路158号交运智慧湾科创园25号楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5665', 'https://imagecdn3.allcpp.cn/upload/2025/8/4fa222f4-87bd-47bb-9ad1-b5c34f4de6c4.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310113, 'cpp', 5665, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟Only代号-PRTS', '2025-10-02', '2025-10-03', '上海', '上海', '嘉定', '泰美术馆', '泰美术馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5644', 'https://imagecdn3.allcpp.cn/upload/2025/8/9c0ae68b-83b5-4c37-a3bb-cd3ce32f7141.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310114, 'cpp', 5644, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·明日方舟同人Olny·泰拉巡礼', '2025-09-19', NULL, '天津', '天津', '和平', '天津市和平区华信半岛酒店30F', '天津市和平区华信半岛酒店30F', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5613', 'https://imagecdn3.allcpp.cn/upload/2025/8/bfb3f1b6-2f07-4ff7-b3e9-d8e1a2d430e2.jpg', 0, '["永远不能停下脚步","不要否定善行","道德和良知永远不会错","握着光辉满怀信心","这片大地的苦厄困不住我","勇敢地追求光明","积雪之下","总有春芽新绽","给予自身永恒的群星和无限的海洋","不必去羡慕他人","生命的意义在于不断前行和探索"]', '中国', 'CN', 12, 1201, 120101, 'cpp', 5613, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('正阳象限明日方舟 ONLY4.0:「京穗流年」', '2025-09-19', NULL, '北京', '北京', '朝阳', '全国农业展览馆', '全国农业展览馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5393', 'https://imagecdn3.allcpp.cn/upload/2025/7/895f6e9e-bba2-43a3-acac-a46bf9616344.png', 0, '["明日方舟","玛恩纳","黍"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 5393, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('海口明日方舟ONLY·碎浪逐梦', '2025-09-19', NULL, '海南', '海口', '琼山', '高登西街高兴里19栋次元展览馆', '高登西街高兴里19栋次元展览馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5275', 'https://imagecdn3.allcpp.cn/upload/2025/6/031424c9-feda-4176-ab65-bc82e8280b18.png', 0, '["明日方舟"]', '中国', 'CN', 46, 4601, 460107, 'cpp', 5275, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('时代·明日方舟主题茶会', '2025-09-19', NULL, '广东', '广州', '白云', '贝house艺术空间（广州市白云区云城东路339号 c 栋2楼）', '贝house艺术空间（广州市白云区云城东路339号 c 栋2楼）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4937', 'https://imagecdn3.allcpp.cn/upload/2025/4/7af7cc29-2f96-4aa7-bcc5-4b808c674e76.png', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 4937, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉明日方舟与狼共舞only', '2025-09-12', '2025-09-13', '湖北', '武汉', '江汉', '知音号游轮', '知音号游轮', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5605', 'https://imagecdn3.allcpp.cn/upload/2025/8/c1390026-f28c-4b28-aa61-c3368276e8b4.png', 0, '["武汉明日方舟only","明日方舟"]', '中国', 'CN', 42, 4201, 420103, 'cpp', 5605, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('西安·明日方舟同人ONLY[安魂夜话]', '2025-09-12', NULL, '陕西', '西安', '雁塔', '二环南路西段180号悦豪酒店', '二环南路西段180号悦豪酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5176', 'https://imagecdn3.allcpp.cn/upload/2025/9/037a7aae-d994-472c-b81c-23e313609fdc.jpg', 0, '["明日方舟","only","漫展","同人"]', '中国', 'CN', 61, 6101, 610113, 'cpp', 5176, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨明日方舟only·罗德岛假日Day2', '2025-08-23', NULL, '黑龙江', '哈尔滨', '南岗', '红旗大街艺汇家四楼B区展厅', '红旗大街艺汇家四楼B区展厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5350', 'https://imagecdn3.allcpp.cn/upload/2025/6/1b5b52b2-0ef2-4e4a-b4a4-86903f965e97.jpg', 0, '["明日方舟"]', '中国', 'CN', 23, 2301, 230103, 'cpp', 5350, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津明日方舟Only清津留形', '2025-08-22', NULL, '天津', '天津', '武清', 'NOYA诺雅国际宴会中心·婚礼堂(创意米兰生活广场店) 天津市武清区', 'NOYA诺雅国际宴会中心·婚礼堂(创意米兰生活广场店) 天津市武清区', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5611', 'https://imagecdn3.allcpp.cn/upload/2025/8/2a301ebb-ee3b-4b3d-88bd-27405f2fd966.jpg', 0, '["明日方舟","天津","明日方舟only","明日方舟ONLY","粥","莱茵生命","赫默","塞雷娅"]', '中国', 'CN', 12, 1201, 120114, 'cpp', 5611, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海8.23重燃多索雷斯明日方舟ONLY', '2025-08-22', NULL, '上海', '上海', '徐汇', '建国西路319号建西公馆', '建国西路319号建西公馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5379', 'https://imagecdn3.allcpp.cn/upload/2025/6/ecec5015-fdf4-434b-ab45-209df50049a9.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310104, 'cpp', 5379, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('迷宅-广州明日方舟only', '2025-08-22', NULL, '广东', '广州', '白云', '广州设计殿堂广州白云区鹤龙东路与黄边二横路交叉路口东北200米', '广州设计殿堂广州白云区鹤龙东路与黄边二横路交叉路口东北200米', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5305', 'https://imagecdn3.allcpp.cn/upload/2025/6/f124a5da-c627-428f-95da-82301252269b.png', 0, '["#明日方舟only","#明日方舟","#only","#广州only","#二次元","#漫展","#cosplay","#cos","#企鹅物流","#罗德岛"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 5305, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('重庆·第六届明日方舟ONLY同人展', '2025-08-15', NULL, '重庆', '重庆', '南岸', '南岸区烟雨路flow super live', '南岸区烟雨路flow super live', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5586', 'https://imagecdn3.allcpp.cn/upload/2025/8/9f521516-27c6-4d9b-ad18-c57703238657.png', 0, '["明日方舟","明日方舟ONLY"]', '中国', 'CN', 50, 5001, 500108, 'cpp', 5586, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('山西明日方舟ONLY02 醋荣共晋', '2025-08-15', NULL, '山西', '太原', '小店', '大禾宴汇（长风店）', '大禾宴汇（长风店）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5185', 'https://imagecdn3.allcpp.cn/upload/2025/7/bfa72011-03c7-4ff5-b52c-f11166b3aa52.jpg', 0, '["明日方舟"]', '中国', 'CN', 14, 1401, 140105, 'cpp', 5185, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('沈阳明日方舟only3.0：996罗德岛', '2025-08-09', NULL, '辽宁', '沈阳', '铁西', '北二东路17号荣富饭店五楼', '北二东路17号荣富饭店五楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5029', 'https://imagecdn3.allcpp.cn/upload/2025/5/208d08c5-00ae-4ae8-a992-7233e7123733.png', 0, '["明日方舟","罗德岛","巴别塔"]', '中国', 'CN', 21, 2101, 210106, 'cpp', 5029, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('舟趴3.0 海岸星光节 成都明日方舟ONLY', '2025-08-08', NULL, '四川', '成都', '武侯', '创业路30号成都诺亚8号酒店', '创业路30号成都诺亚8号酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5287', 'https://imagecdn3.allcpp.cn/upload/2025/6/0e7f3def-03e8-43ab-a3c6-f34a75bab732.png', 0, '["明日方舟","手游","同人","二次元","舟趴"]', '中国', 'CN', 51, 5101, 510107, 'cpp', 5287, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州界园游园行明日方舟only', '2025-08-02', NULL, '浙江', '杭州', '拱墅', '顺丰创新中心', '顺丰创新中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5403', 'https://imagecdn3.allcpp.cn/upload/2025/7/e152a1bb-86e4-4068-b4f9-da7fb98cbc67.png', 0, '["明日方舟","界园","界园游园行"]', '中国', 'CN', 33, 3301, 330105, 'cpp', 5403, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('汕头·明日方舟only·盐风茶会', '2025-08-02', NULL, '广东', '汕头', '龙湖', '维也纳3好酒店(鸥汀店)', '维也纳3好酒店(鸥汀店)', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4641', 'https://imagecdn3.allcpp.cn/upload/2025/4/9f238c5d-4eb3-4204-bda6-a249bc54c38f.jpg', 0, '["明日方舟only","茶话会","汕头"]', '中国', 'CN', 44, 4405, 440507, 'cpp', 4641, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('宁波8.2明日方舟only·盛夏新星', '2025-08-01', NULL, '浙江', '宁波', '江北', '江北区人民路183号绿地缤纷城B1甬家临展厅', '江北区人民路183号绿地缤纷城B1甬家临展厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5362', 'https://imagecdn3.allcpp.cn/upload/2025/7/fd5552e4-8f56-4ea2-9e2b-94d2d8ab2f22.jpg', 0, '["明日方舟","only"]', '中国', 'CN', 33, 3302, 330205, 'cpp', 5362, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('青岛明日方舟ONLY3.0·桑葚的奇妙大冒险', '2025-08-01', NULL, '山东', '青岛', '李沧', '九龙泉酒店宴会厅（李村派出所旁）', '九龙泉酒店宴会厅（李村派出所旁）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5174', 'https://imagecdn3.allcpp.cn/upload/2025/5/356719a9-0a35-4552-ba74-92d0d9d8f819.png', 0, '["明日方舟","同人","ONLY"]', '中国', 'CN', 37, 3702, 370213, 'cpp', 5174, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙明日方舟ONLY 3.0 暗沙鲸生', '2025-07-26', NULL, '湖南', '长沙', '开福', '顺天黄金海岸大酒店五楼', '顺天黄金海岸大酒店五楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4926', 'https://imagecdn3.allcpp.cn/upload/2025/4/9c2c6b01-faad-4b32-84d4-e2fdb479fa00.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430105, 'cpp', 4926, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('深圳明日方舟Only2.0·罗德岛趣味运动会', '2025-07-25', NULL, '广东', '深圳', '龙华', '龙华国际会议中心', '龙华国际会议中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5389', 'https://imagecdn3.allcpp.cn/upload/2025/7/2bac7fe2-8410-4449-ba57-a77b0a2b5d32.png', 0, '["明日方舟"]', '中国', 'CN', 44, 4403, 440309, 'cpp', 5389, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·LingY·明日方舟ONLY·稻黍诗篇', '2025-07-25', NULL, '天津', '天津', '南开', '爱知你我婚礼艺术中心', '爱知你我婚礼艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5358', 'https://imagecdn3.allcpp.cn/upload/2025/6/c3381d49-20cb-41dd-bd8a-c88cff0ba30f.png', 0, '["明日方舟","明日方舟only","黍"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 5358, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('济南明日方舟only缄默法则', '2025-07-25', NULL, '山东', '济南', '槐荫', '济南市槐荫区青岛路印象济南·泉世界4区3号楼、5号楼', '济南市槐荫区青岛路印象济南·泉世界4区3号楼、5号楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5052', 'https://imagecdn3.allcpp.cn/upload/2025/5/18ffcdae-0b22-4ce1-82bf-2d415129ebbf.png', 0, '["明日方舟","叙拉古","拉普兰德","德克萨斯"]', '中国', 'CN', 37, 3701, 370104, 'cpp', 5052, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【迷渊葬歌】郑州-明日方舟ONLY2.0', '2025-07-18', '2025-07-19', '河南', '郑州', '金水', '郑州市金水区泓禧棠婚礼艺术中心（宏明西路与索凌路交叉口东北60米）', '郑州市金水区泓禧棠婚礼艺术中心（宏明西路与索凌路交叉口东北60米）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5284', 'https://imagecdn3.allcpp.cn/upload/2025/6/ee404041-2e66-4fb9-a247-752682ac5870.jpg', 0, '["明日方舟only","粥o"]', '中国', 'CN', 41, 4101, 410105, 'cpp', 5284, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州明日方舟only【群星恒我】', '2025-07-18', NULL, '浙江', '杭州', '上城', '杭州市上城区凤起东路211号名人名家顺福店名家厅', '杭州市上城区凤起东路211号名人名家顺福店名家厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4343', 'https://imagecdn3.allcpp.cn/upload/2025/1/bda097f1-38bc-47e0-9a34-0d53166ee0be.png', 0, '["明日方舟","only","孤星","群星恒我"]', '中国', 'CN', 33, 3301, 330102, 'cpp', 4343, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟Only FM714旧梦电台', '2025-07-13', NULL, '上海', '上海', '青浦', 'REMIXX国际艺术中心', 'REMIXX国际艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5311', 'https://imagecdn3.allcpp.cn/upload/2025/6/b5976d97-f060-421b-ac08-b4e017228ecb.png', 0, '["明日方舟","明日方舟Only","逃离世界八小时"]', '中国', 'CN', 31, 3101, 310118, 'cpp', 5311, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南宁 · 第三届明日方舟Only展 【企鹅物流主题】  - 《暗流协议》', '2025-07-12', NULL, '广西', '南宁', '江南', '百益上河城-艺术中心', '百益上河城-艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5047', 'https://imagecdn3.allcpp.cn/upload/2025/5/d382da00-a21f-4c6c-9788-190ab2e6a230.jpg', 0, '["明日方舟","ONLY","漫展","COS","COSPLAY","企鹅物流","能天使","同人摊位"]', '中国', 'CN', NULL, 4501, 450105, 'cpp', 5047, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京明日方舟ONLY：象限征戈', '2025-06-27', NULL, '江苏', '南京', '栖霞', '杉湖东路9号可一书店', '杉湖东路9号可一书店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=5211', 'https://imagecdn3.allcpp.cn/upload/2025/6/06922cbe-cac6-494f-bf46-3819639684f7.jpg', 0, '["明日方舟"]', '中国', 'CN', 32, 3201, 320113, 'cpp', 5211, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('昆明永遇乐·明日方舟only', '2025-06-27', NULL, '云南', '昆明', '五华', '五华区学府路莲花池庭院剧场', '五华区学府路莲花池庭院剧场', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4960', 'https://imagecdn3.allcpp.cn/upload/2025/6/e298a5c2-96c9-4123-a109-90fbeed102bc.jpg', 0, '["明日方舟"]', '中国', 'CN', 53, 5301, 530102, 'cpp', 4960, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南昌明日方舟巴别塔主题同人ONLY', '2025-06-20', NULL, '江西', '南昌', '红谷滩', '融创茂啃趣馆', '融创茂啃趣馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4614', 'https://imagecdn3.allcpp.cn/upload/2025/5/735286bf-0d73-478d-ba30-d1ae3f232382.png', 0, '["明日方舟","巴别塔","only","同人展","罗德岛"]', '中国', 'CN', 36, 3601, 360113, 'cpp', 4614, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉·明日方舟Only·梦幻夏日', '2025-06-14', NULL, '湖北', '武汉', '汉阳', '月湖IN悦礼宴艺术中心', '月湖IN悦礼宴艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4969', 'https://imagecdn3.allcpp.cn/upload/2025/4/783f4d0c-48dd-4138-a1b7-1ad46573c0c8.jpg', 0, '["明日方舟","武汉漫展"]', '中国', 'CN', 42, 4201, 420105, 'cpp', 4969, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('衡阳·湘南明日方舟ONLY·铳鸣序章', '2025-05-31', NULL, '湖南', '衡阳', '石鼓', '北城明珠东500米(合江路北)湖南华侨城创展中心', '北城明珠东500米(合江路北)湖南华侨城创展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4797', 'https://imagecdn3.allcpp.cn/upload/2025/3/2e7ea42c-52e8-4b3c-a5f3-effa0747b955.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4304, 430407, 'cpp', 4797, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【明日方舟】行运一条龙cafe', NULL, NULL, '广东', '广州', '白云', '玩醒凯心', '玩醒凯心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4880', 'https://imagecdn3.allcpp.cn/upload/2025/4/2ebbd09e-0b26-4299-9ed2-9cccf699e0e4.jpg', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 4880, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·夜之遥·明日方舟同人only', '2025-05-23', NULL, '天津', '天津', '津南', '天津市津南区绿动box活力街区', '天津市津南区绿动box活力街区', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4940', 'https://imagecdn3.allcpp.cn/upload/2025/4/738fdc0c-1e9c-45b9-979f-9aecdae8fbe9.png', 0, '["明日方舟","同人only"]', '中国', 'CN', 12, 1201, 120112, 'cpp', 4940, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨·第三届明日方舟同人Only·卡子屯食遇记', '2025-05-17', NULL, '黑龙江', '哈尔滨', '香坊', '公滨路40号卓琳酒店', '公滨路40号卓琳酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4924', 'https://imagecdn3.allcpp.cn/upload/2025/4/eecd202d-bc59-4f9b-9199-9d2b26e0f01e.jpg', 0, '["明日方舟","同人","only","鹰角网络"]', '中国', 'CN', 23, 2301, 230110, 'cpp', 4924, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟Only骑士斗饿龙', '2025-05-02', NULL, '上海', '上海', '浦东新区', '东方万国宴会中心', '东方万国宴会中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4799', 'https://imagecdn3.allcpp.cn/upload/2025/3/fa6409ce-c87f-420d-a8f8-3e1304ffd89a.jpg', 0, '["明日方舟","上海明日方舟only"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 4799, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('ACF明日方舟创作者庆典', '2025-05-01', '2025-05-02', '上海', '上海', '长宁', '上海世贸展馆', '上海世贸展馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4850', 'https://imagecdn3.allcpp.cn/upload/2025/4/7d056099-5dba-47fd-ba70-5ce46196c77e.png', 0, '["明日方舟","明日方舟only"]', '中国', 'CN', 31, 3101, 310105, 'cpp', 4850, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('ONLY.昆明明日方舟ONLY-苦难年代', '2025-04-25', NULL, '云南', '昆明', '盘龙', '博悦宴会艺术中心(低碳中心C座)', '博悦宴会艺术中心(低碳中心C座)', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4598', 'https://imagecdn3.allcpp.cn/upload/2025/2/48847c47-ba8a-4aa7-856e-7cfaefe9bc82.jpg', 0, '["明日方舟","昆明舟O","ONLY","昆明漫展"]', '中国', 'CN', 53, 5301, 530103, 'cpp', 4598, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京叁秋·明日方舟同人only·愚夜狂欢', '2025-04-19', NULL, '江苏', '南京', '江宁', '清水亭东路99-9号', '清水亭东路99-9号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4410', 'https://imagecdn3.allcpp.cn/upload/2025/1/a6904a35-a07c-4225-84db-e0fea20c669b.jpg', 0, '["#明日方舟"]', '中国', 'CN', 32, 3201, 320115, 'cpp', 4410, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·LingY·明日方舟ONLY·渊蚀逆旅', '2025-04-18', NULL, '天津', '天津', '南开', '爱知你我婚礼艺术中心', '爱知你我婚礼艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4811', 'https://imagecdn3.allcpp.cn/upload/2025/3/7ea870c0-7fed-4374-b618-556e1d6e49af.png', 0, '["明日方舟ONLY","同人","明日方舟"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 4811, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY2.0|迷城漫游', '2025-04-18', NULL, '上海', '上海', '杨浦', '上海五角场百联又一城4层PARTY KING', '上海五角场百联又一城4层PARTY KING', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4519', 'https://imagecdn3.allcpp.cn/upload/2025/2/864a21fd-4a05-4f56-9b2d-ba123102ea39.png', 0, '["明日方舟","同人","游戏","手游"]', '中国', 'CN', 31, 3101, 310110, 'cpp', 4519, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('郑州·明日方舟only展·炉梦夜曲', '2025-04-11', NULL, '河南', '郑州', '管城', '管城回族区河南自贸试验区郑州片区(经开)航海东路1206号中原福塔1楼262号', '管城回族区河南自贸试验区郑州片区(经开)航海东路1206号中原福塔1楼262号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4714', 'https://imagecdn3.allcpp.cn/upload/2025/3/4bcbbba0-7262-4c4b-9db5-6d7683a63053.jpg', 0, '["明日方舟","明日方舟only"]', '中国', 'CN', 41, 4101, NULL, 'cpp', 4714, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州明日方舟ONLY·锈影新生', '2025-04-11', '2025-04-12', '浙江', '杭州', '拱墅', '大运河杭钢公园1号高炉', '大运河杭钢公园1号高炉', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4446', 'https://imagecdn3.allcpp.cn/upload/2025/1/9a33d0ba-44f4-4770-9f1b-30be8456df48.png', 0, '["明日方舟","杭州","浙江","维什戴尔","阿米娅","逻各斯","特蕾西娅"]', '中国', 'CN', 33, 3301, 330105, 'cpp', 4446, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('宁波明日方舟同人ONLY展-残魂尽', '2025-04-04', NULL, '浙江', '宁波', '鄞州', '浙江省宁波市鄞州区首南街道宁东路545号一号商铺w艺术中心', '浙江省宁波市鄞州区首南街道宁东路545号一号商铺w艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4617', 'https://imagecdn3.allcpp.cn/upload/2025/2/0b44705a-a6b2-4390-bb60-d3674b2bac44.png', 0, '["明日方舟","明日方舟only","宁波","巴别塔","残魂尽","宁波残魂尽明日方舟only"]', '中国', 'CN', 33, 3302, 330212, 'cpp', 4617, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟only·回响已逝', '2025-04-04', NULL, '上海', '上海', '闵行', '漕宝路1688号诺宝中心大酒店众花厅', '漕宝路1688号诺宝中心大酒店众花厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4507', 'https://imagecdn3.allcpp.cn/upload/2025/2/44317390-f3ba-41e2-a291-a6dcfd754f37.png', 0, '["明日方舟","已故角色"]', '中国', 'CN', 31, 3101, 310112, 'cpp', 4507, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉明日方舟only 大炎江城博览会', '2025-04-04', NULL, '湖北', '武汉', '东西湖', '湖北省武汉市东西湖区宏图路8号', '湖北省武汉市东西湖区宏图路8号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4459', 'https://imagecdn3.allcpp.cn/upload/2025/1/25bd0a2e-724a-40db-92ba-374964ba4e1a.png', 0, '["明日方舟","武汉"]', '中国', 'CN', 42, 4201, 420112, 'cpp', 4459, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('苏州明日方舟ONLY2.0——维多利亚来信', '2025-03-28', NULL, '江苏', '苏州', '吴中', '吴中白金汉爵大酒店', '吴中白金汉爵大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4153', 'https://imagecdn3.allcpp.cn/upload/2025/1/ffb99ede-4a27-443a-8f58-c7188b3c87a5.jpg', 0, '["明日方舟","同人展","ONLY"]', '中国', 'CN', 32, 3205, 320506, 'cpp', 4153, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('小隐茶梦 明日方舟主题茶会2.0', '2025-03-21', NULL, '江苏', '南京', '玄武', '龟山公园内Dr.COFFEE', '龟山公园内Dr.COFFEE', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4626', 'https://imagecdn3.allcpp.cn/upload/2025/2/6b0f9b7d-0993-4f26-8743-478b64152b7a.jpg', 0, '["明日方舟"]', '中国', 'CN', 32, 3201, 320102, 'cpp', 4626, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京明日方舟only 3.0 京春华章', '2025-03-21', NULL, '北京', '北京', '丰台', '大红门国际会展中心', '大红门国际会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4537', 'https://imagecdn3.allcpp.cn/upload/2025/2/f4a795f3-3a15-4ca1-a58c-2c6267516521.png', 0, '["明日方舟","logos","逻各斯","raidian"]', '中国', 'CN', 11, 1101, 110106, 'cpp', 4537, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉AF明日方舟only-兔兔茶话会', '2025-03-21', NULL, '湖北', '武汉', '江汉', '格蕾摩尔宴会中心', '格蕾摩尔宴会中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4423', 'https://imagecdn3.allcpp.cn/upload/2025/1/f8f67dcc-d7a0-46c7-baa5-e0be96f2b6c2.png', 0, '["明日方舟","阿米娅"]', '中国', 'CN', 42, 4201, 420103, 'cpp', 4423, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('西安明日方舟only2.0', '2025-03-21', NULL, '陕西', '西安', '莲湖', '西安市莲湖区劳动南路10号NONGCOFFEE弄咖啡（汉中大厦店）', '西安市莲湖区劳动南路10号NONGCOFFEE弄咖啡（汉中大厦店）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4338', 'https://imagecdn3.allcpp.cn/upload/2025/1/22e57e27-b475-4bf9-a9d7-1774d6428d65.jpg', 0, '["明日方舟"]', '中国', 'CN', 61, 6101, 610104, 'cpp', 4338, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海·水月澄闪茶会', '2025-03-21', NULL, '上海', '上海', '静安', '上海市静安区青云路332号一层吾家咖啡', '上海市静安区青云路332号一层吾家咖啡', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3686', 'https://imagecdn3.allcpp.cn/upload/2024/10/e3ec4fa1-1b1e-4186-9f56-5ca08c058e95.png', 0, '["明日方舟","水月","澄闪"]', '中国', 'CN', 31, 3101, 310106, 'cpp', 3686, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海·明日方舟only·无缅', '2025-03-14', NULL, '上海', '上海', '浦东新区', '上海东方万国宴会中心', '上海东方万国宴会中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4026', 'https://imagecdn3.allcpp.cn/upload/2025/1/992979f7-a1bc-4d09-aa20-57a9361c6e03.png', 0, '["明日方舟","整合运动"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 4026, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【天时地利】广州明日方舟ONLY', '2025-03-14', '2025-03-15', '广东', '广州', '白云', '白云区人和园（近龙归地铁站）', '白云区人和园（近龙归地铁站）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3740', 'https://imagecdn3.allcpp.cn/upload/2024/12/c661c215-756a-4ab1-b648-8c02b351613c.png', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 3740, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙明日方舟only 晨曦载曜', '2025-02-28', NULL, '湖南', '长沙', '长沙县', '长沙国际会展中心北登录厅2楼', '长沙国际会展中心北登录厅2楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4548', 'https://imagecdn3.allcpp.cn/upload/2025/2/9019589d-5158-4ec5-976a-8c53f1001952.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430121, 'cpp', 4548, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY·闲时逸话', '2025-02-28', NULL, '上海', '上海', '宝山', '上海市宝山区呼青路158号交运智慧湾科创园25号楼', '上海市宝山区呼青路158号交运智慧湾科创园25号楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4309', 'https://imagecdn3.allcpp.cn/upload/2024/12/76472e2e-c4fa-47e2-9f2d-42ff0c380632.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310113, 'cpp', 4309, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('山西首场明日方舟ONLY 晋春芜', '2025-02-21', NULL, '山西', '太原', '迎泽', '开化寺街87号华宇购物中心7层', '开化寺街87号华宇购物中心7层', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4262', 'https://imagecdn3.allcpp.cn/upload/2024/12/e2b52139-0e97-46b7-9743-5e2cfb91ef91.jpg', 0, '["明日方舟"]', '中国', 'CN', 14, 1401, 140106, 'cpp', 4262, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('舟趴2.0 岛与塔 成都明日方舟ONLY', '2025-02-14', NULL, '四川', '成都', '武侯', '创业路30号成都诺亚8号酒店', '创业路30号成都诺亚8号酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4142', 'https://imagecdn3.allcpp.cn/upload/2024/11/e819b691-4364-42aa-85fd-2d18c8343a29.jpg', 0, '["明日方舟","同人","摊位"]', '中国', 'CN', 51, 5101, 510107, 'cpp', 4142, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广西 · 第二届明日方舟Only展 - 《绿洲 · 秘研纪》', '2025-02-08', NULL, '广西', '南宁', '西乡塘', '百益上河城-二期-1-2-3层', '百益上河城-二期-1-2-3层', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4103', 'https://imagecdn3.allcpp.cn/upload/2024/11/942ffe3f-32ec-4d47-b020-fc29848f9cce.jpg', 0, '["明日方舟","cos","Cosplay","广西","南宁","柳州","明日方舟only"]', '中国', 'CN', NULL, 4501, 450107, 'cpp', 4103, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('台州明日方舟only同人展-骑士与乐章', '2025-02-08', NULL, '浙江', '台州', '路桥', '台州市路桥区腾达路99号 台州和平国际饭店', '台州市路桥区腾达路99号 台州和平国际饭店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4023', 'https://imagecdn3.allcpp.cn/upload/2024/12/d08af618-409d-44a3-aa1a-f7d84e8aa03c.jpg', 0, '["明日方舟","only","同人","卡西米尔","莱塔尼亚"]', '中国', 'CN', 33, 3310, 331004, 'cpp', 4023, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY|迷城漫游', '2025-01-18', NULL, '上海', '上海', '杨浦', '上海五角场百联又一城4层PARTY KING', '上海五角场百联又一城4层PARTY KING', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4240', 'https://imagecdn3.allcpp.cn/upload/2024/12/f3622193-9bdc-497d-a9c5-d399714bcd1a.png', 0, '["明日方舟","同人","游戏"]', '中国', 'CN', 31, 3101, 310110, 'cpp', 4240, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('沈阳明日方舟ONLY：椒辞岁序', '2025-01-18', NULL, '辽宁', '沈阳', '铁西', '铁西区北二东路17号荣富饭店4楼荣润厅', '铁西区北二东路17号荣富饭店4楼荣润厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3985', 'https://imagecdn3.allcpp.cn/upload/2024/10/12df9cb9-2916-4a13-9b4e-2aeafecbc198.jpg', 0, '["明日方舟"]', '中国', 'CN', 21, 2101, 210106, 'cpp', 3985, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('青岛·明日方舟Only同人交流会·青书化韵', '2025-01-18', NULL, '山东', '青岛', '李沧', '九龙泉酒店-宴会厅', '九龙泉酒店-宴会厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3745', 'https://imagecdn3.allcpp.cn/upload/2024/9/8facdda9-588d-4e14-bc17-2a0a5a77999c.png', 0, '["明日方舟"]', '中国', 'CN', 37, 3702, 370213, 'cpp', 3745, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('厦门明日方舟ONLY▪罗德岛汤圆大作战', '2025-01-17', NULL, '福建', '厦门', '思明', '华侨大厦大酒店（新华路70-74号）', '华侨大厦大酒店（新华路70-74号）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3980', 'https://imagecdn3.allcpp.cn/upload/2024/11/662a77c9-46e1-43fb-aead-87ab59f3824a.png', 0, '["明日方舟"]', '中国', 'CN', 35, 3502, 350203, 'cpp', 3980, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京·明日方舟only ——莱茵生活日常', '2025-01-11', NULL, '江苏', '南京', '江宁', '江苏省南京市江宁区双龙大道1222号六楼同曦艺术馆', '江苏省南京市江宁区双龙大道1222号六楼同曦艺术馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3593', 'https://imagecdn3.allcpp.cn/upload/2024/8/bbc3aa6c-0f7d-4b22-a268-2f5b4fa8e252.jpg', 0, '["明日方舟","明日方舟only","南京","明日方舟同人"]', '中国', 'CN', 32, 3201, 320115, 'cpp', 3593, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙明日方舟ONLY2.0年关湘筵', '2025-01-10', NULL, '湖南', '长沙', '岳麓', '美澜东方艺术中心', '美澜东方艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3971', 'https://imagecdn3.allcpp.cn/upload/2024/11/1e39769f-63fa-44b1-9508-de99af7a3848.png', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430104, 'cpp', 3971, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('福州明日方舟only-招财进宝', '2025-01-10', NULL, '福建', '福州', '鼓楼', '福州市美伦大饭店', '福州市美伦大饭店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3757', 'https://imagecdn3.allcpp.cn/upload/2024/9/9f133307-566c-4fd3-ae67-fa47b08395c0.png', 0, '["明日方舟","only"]', '中国', 'CN', 35, 3501, 350102, 'cpp', 3757, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('深圳明日方舟ONLY·雪域天路', '2025-01-03', NULL, '广东', '深圳', '南山', '凯宾斯基酒店', '凯宾斯基酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3927', 'https://imagecdn3.allcpp.cn/upload/2024/10/521a535e-9e38-4de7-bab8-643c2504583b.png', 0, '["明日方舟","ONLY","谢拉格","深圳"]', '中国', 'CN', 44, 4403, 440305, 'cpp', 3927, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('重庆明日方舟ONLY5.0', '2024-12-31', '2025-01-01', '重庆', '重庆', '南岸', '重庆市南岸区重庆国际会展中心会议楼3楼', '重庆市南岸区重庆国际会展中心会议楼3楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=4259', 'https://imagecdn3.allcpp.cn/upload/2024/12/32ada66e-35cf-40e8-8a13-ab01873dc056.jpg', 0, '["明日方舟","卡西米尔"]', '中国', 'CN', 50, 5001, 500108, 'cpp', 4259, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟BGonly', '2024-12-20', NULL, '广东', '广州', '天河', '明日方舟BG国宴厅', '明日方舟BG国宴厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3253', 'https://imagecdn3.allcpp.cn/upload/2024/6/97cc2575-c865-4cdf-800f-3a5ef6ab3c99.png', 0, '["明日方舟","bg"]', '中国', 'CN', 44, 4401, 440106, 'cpp', 3253, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·LingY·明日方舟ONLY·朔雪夕砚', '2024-12-06', NULL, '天津', '天津', '南开', '爱知你我婚礼艺术中心', '爱知你我婚礼艺术中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3968', 'https://imagecdn3.allcpp.cn/upload/2024/10/1969a2f3-446a-49d5-acd8-46e58f79aedd.png', 0, '["夕","黍","同人","令","年"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 3968, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY 静夜霓虹', '2024-11-30', NULL, '上海', '上海', '浦东新区', '上海浦东新区新金桥路1599号东方万国宴会中心', '上海浦东新区新金桥路1599号东方万国宴会中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3906', 'https://imagecdn3.allcpp.cn/upload/2024/11/df3b0bac-711a-4d8c-aa10-9864e579e0f7.jpg', 0, '["明日方舟","同人","ONLY","方舟","舟","粥","能天使","德克萨斯"]', '中国', 'CN', 31, 3101, 310115, 'cpp', 3906, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南昌·岁酉山河炎国明日方舟only展', '2024-11-29', NULL, '江西', '南昌', '东湖', '南昌东方豪景花园酒店二楼宴会厅', '南昌东方豪景花园酒店二楼宴会厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3726', 'https://imagecdn3.allcpp.cn/upload/2024/9/abbe64ab-4517-42ad-b065-cbcb63febefe.png', 0, '["明日方舟","only","同人展会","方舟only","大炎","岁兽"]', '中国', 'CN', 36, 3601, 360102, 'cpp', 3726, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('第三届天津complex明日方舟only·巴别塔之旅', '2024-11-15', NULL, '天津', '天津', '和平', '天津市和平区南市街道福安大街与禄安大街交叉口(金街地铁站D口步行130米)禧悦酒店', '天津市和平区南市街道福安大街与禄安大街交叉口(金街地铁站D口步行130米)禧悦酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3874', 'https://imagecdn3.allcpp.cn/upload/2024/10/0f17fc59-7755-4f28-b0ae-d679b417d37b.png', 0, '["明日方舟","粥"]', '中国', 'CN', 12, 1201, 120101, 'cpp', 3874, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨·第二届明日方舟同人Only·炎游百景', '2024-11-09', NULL, '黑龙江', '哈尔滨', '道里', '埃德蒙顿路南方花园西北侧约70米悦筵宴会酒店', '埃德蒙顿路南方花园西北侧约70米悦筵宴会酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3837', 'https://imagecdn3.allcpp.cn/upload/2024/10/8f6d9f05-8e47-471c-bd7c-cdec6d756a41.png', 0, '["明日方舟","同人","only","鹰角"]', '中国', 'CN', 23, 2301, 230102, 'cpp', 3837, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州明日方舟ONLY-圣城晚照', '2024-11-09', NULL, '浙江', '杭州', '萧山', 'XPACE湾区数字园', 'XPACE湾区数字园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3691', 'https://imagecdn3.allcpp.cn/upload/2024/9/fc9ffcc2-03ae-4f7b-b869-185f7b3bfe79.jpeg', 0, '["明日方舟","明日方舟同人"]', '中国', 'CN', 33, 3301, 330109, 'cpp', 3691, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【风华粤韵】广州明日方舟ONLY', '2024-11-08', NULL, '广东', '广州', '白云', '黄边设计殿堂', '黄边设计殿堂', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3586', 'https://imagecdn3.allcpp.cn/upload/2024/8/92c1e796-335b-4b2a-870c-f1f34415b8a5.png', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 3586, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('成都·明日方舟半周年特典（免费）', '2024-11-01', '2024-11-02', '四川', '成都', '成华', '成都印象城6楼CCCC发电场', '成都印象城6楼CCCC发电场', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3966', 'https://imagecdn3.allcpp.cn/upload/2024/10/87337248-d980-4012-b5c6-8ac0e8440c8a.jpg', 0, '["明日方舟ONLY","随机宅舞","特典活动"]', '中国', 'CN', 51, 5101, 510108, 'cpp', 3966, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海·明日方舟龙门主题茶会·猫鼠游戏', '2024-11-01', NULL, '上海', '上海', '闵行', '沈杜公路禅光竹房茶舍', '沈杜公路禅光竹房茶舍', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3523', 'https://imagecdn3.allcpp.cn/upload/2024/8/020d5ba2-cc05-47fe-98d9-c03ea97e8e2f.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310112, 'cpp', 3523, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京明日方舟only 2.0 京台夕照', '2024-11-01', NULL, '北京', '北京', '丰台', '大红门国际会展中心', '大红门国际会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3500', 'https://imagecdn3.allcpp.cn/upload/2024/8/4fc8dd2e-7e58-4e13-81e5-1867513a7b68.jpg', 0, '["明日方舟","佩佩","左乐","风笛","明日方舟only","北京"]', '中国', 'CN', 11, 1101, 110106, 'cpp', 3500, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY创作交流会——兔子屯大冒险', '2024-11-01', '2024-11-02', '上海', '上海', '宝山', '中成智谷c5&c6', '中成智谷c5&c6', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3429', 'https://imagecdn3.allcpp.cn/upload/2024/7/00a08d07-c530-427d-a98b-a44ceaba79aa.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, 310113, 'cpp', 3429, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京·明日方舟only同人展', '2024-10-25', '2024-10-26', '北京', '北京', '朝阳', '超级蜂巢b1层', '超级蜂巢b1层', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3251', 'https://imagecdn3.allcpp.cn/upload/2024/6/538a1e90-ed38-4789-8c6a-da41fc48b4e6.jpg', 0, '["明日方舟"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 3251, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津海森奇梦明日方舟only', '2024-10-02', NULL, '天津', '天津', '河西', '天津友谊北路百合华堂', '天津友谊北路百合华堂', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3674', 'https://imagecdn3.allcpp.cn/upload/2024/9/015b1093-07e7-410b-8bfd-c5417f46d7e5.jpg', 0, '["明日方舟only"]', '中国', 'CN', 12, 1201, 120103, 'cpp', 3674, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京明日方舟only-厮守序言', '2024-10-02', NULL, '北京', '北京', '朝阳', '北投购物公园', '北投购物公园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3589', 'https://imagecdn3.allcpp.cn/upload/2024/8/d6b5fe7c-7e80-4304-a7aa-2fae2b25f410.jpg', 0, '["明日方舟"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 3589, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('执炬明炎-广州明日方舟ONLY', '2024-10-02', NULL, '广东', '广州', '白云', '中国广州', '中国广州', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2892', 'https://imagecdn3.allcpp.cn/upload/2024/5/3871e202-ad2f-4123-8fcf-e6a1c3b69f93.png', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, 440111, 'cpp', 2892, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('10.2宁波明日方舟ONLY', '2024-10-01', NULL, '浙江', '宁波', '海曙', '天成酒店', '天成酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3482', 'https://imagecdn3.allcpp.cn/upload/2024/8/2b81c4b5-1cec-47d9-8299-2608da6beea2.jpg', 0, '["明日方舟"]', '中国', 'CN', 33, 3302, 330203, 'cpp', 3482, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('苏州首届明日方舟ONLY——瑶台霁宴', '2024-09-15', '2024-09-16', '江苏', '苏州', '相城', '苏州市相城区小外滩街元和塘美术馆', '苏州市相城区小外滩街元和塘美术馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3408', 'https://imagecdn3.allcpp.cn/upload/2024/7/c1dad310-b45b-4fc9-870d-e62a942c6204.png', 0, '["明日方舟","only","苏州"]', '中国', 'CN', 32, 3205, 320507, 'cpp', 3408, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津·LingY·明日方舟only', '2024-09-14', NULL, '天津', '天津', '南开', '宜宾道16号内9号图克创意空间', '宜宾道16号内9号图克创意空间', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3351', 'https://imagecdn3.allcpp.cn/upload/2024/8/445998c8-4174-46c3-b039-e02b0428689e.png', 0, '["明日方舟","only","年","夕","令","黍","同人"]', '中国', 'CN', 12, 1201, 120104, 'cpp', 3351, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('EXA·北京国产ONLY', '2024-08-16', NULL, '北京', '北京', '朝阳', '北苑东路88号蓝地时尚庄园', '北苑东路88号蓝地时尚庄园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3096', 'https://imagecdn3.allcpp.cn/upload/2024/7/69744476-18e6-4e06-a35d-c5f7461df11c.jpg', 0, '["全职高手","盗墓笔记","Vtuber","原创","国漫","明日方舟","时光代理人","大理寺日志","第五人格","重返未来1999"]', '中国', 'CN', 11, 1101, 110105, 'cpp', 3096, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('青岛·明日方舟Only-骑士之火', '2024-08-03', NULL, '山东', '青岛', '李沧', '九龙泉酒店-宴会厅', '九龙泉酒店-宴会厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2687', 'https://imagecdn3.allcpp.cn/upload/2024/4/4ccfee63-b14e-49ba-bae4-3a4a616afd9f.png', 0, '["明日方舟"]', '中国', 'CN', 37, 3702, 370213, 'cpp', 2687, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('8.3杭州明日方舟2024音律联觉·不觅浪尘线下影院包场团建', '2024-07-30', NULL, '浙江', '杭州', '滨江', '四号线地铁口电影院', '四号线地铁口电影院', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3119', 'https://imagecdn3.allcpp.cn/upload/2024/5/0f4907b2-0b78-4946-9241-b3f924a60974.png', 0, '["#明日方舟","#音律联觉","#不觅浪尘"]', '中国', 'CN', 33, 3301, 330108, 'cpp', 3119, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('济南第一届Arknights Only-大地巡游', '2024-07-27', NULL, '山东', '济南', NULL, '济南市历下文体中心', '济南市历下文体中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2183', 'https://imagecdn3.allcpp.cn/upload/2024/2/6a57212a-470f-4301-bf87-59172a61e97d.png', 0, '["明日方舟","济南","山东","Arknights"]', '中国', 'CN', 37, 3701, NULL, 'cpp', 2183, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('深圳·CGO2明日方舟同人展·海阳之约', '2024-07-26', NULL, '广东', '深圳', '南山', '深圳前海壹方汇', '深圳前海壹方汇', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3090', 'https://imagecdn3.allcpp.cn/upload/2024/6/3c3247dc-ecdd-480f-b73f-407df0b7de5e.jpg', 0, '["明日方舟"]', '中国', 'CN', 44, 4403, 440305, 'cpp', 3090, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('嘉兴明日方舟ONLY同人交流会——我在炎国吃粽子', '2024-07-20', NULL, '浙江', '嘉兴', '秀洲', '嘉兴秀洲区昌盛中路237号希尔顿花园酒店', '嘉兴秀洲区昌盛中路237号希尔顿花园酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2858', 'https://imagecdn3.allcpp.cn/upload/2024/4/e0425edb-5da7-4db6-ae84-ff331ab25f90.png', 0, '["明日方舟"]', '中国', 'CN', 33, 3304, 330411, 'cpp', 2858, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('沈阳明日方舟only：乾钧槐序', '2024-07-19', NULL, '辽宁', '沈阳', '于洪', '沈阳市于洪区黄河北大街78号', '沈阳市于洪区黄河北大街78号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3015', 'https://imagecdn3.allcpp.cn/upload/2024/5/a9367f4f-778e-4725-bb6a-32d095c819da.jpg', 0, '["明日方舟"]', '中国', 'CN', 21, 2101, 210114, 'cpp', 3015, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('长沙首届明日方舟ONLY-星罗远旅', '2024-07-19', NULL, '湖南', '长沙', '开福', '五一广场慕奕H酒店7楼', '五一广场慕奕H酒店7楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3013', 'https://imagecdn3.allcpp.cn/upload/2024/5/e0c9c479-d84a-496d-987b-2b052fac2634.JPG', 0, '["明日方舟"]', '中国', 'CN', 43, 4301, 430105, 'cpp', 3013, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州·第四届ArknightsOnly·狼与黑荆棘（明日方舟Only）', '2024-07-19', NULL, '浙江', '杭州', '拱墅', '顺丰创新中心B栋', '顺丰创新中心B栋', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2989', 'https://imagecdn3.allcpp.cn/upload/2024/5/092f2103-0777-45a4-a292-913d6a157b87.jpg', 0, '["明日方舟","杭州","only","Arknights","ako"]', '中国', 'CN', 33, 3301, 330105, 'cpp', 2989, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广西首届明日方舟ONLY展南宁站  —  花庭圣梦', '2024-07-13', NULL, '广西', '南宁', '西乡塘', '利泰国际大酒店', '利泰国际大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2900', 'https://imagecdn3.allcpp.cn/upload/2024/5/3412537d-0eb2-45b2-84d1-a3d2181a873e.jpg', 0, '["Only","漫展","同人","摊位","Coser","明日方舟","拉特兰"]', '中国', 'CN', NULL, 4501, 450107, 'cpp', 2900, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('第二届天津complex明日方舟 ONLY', '2024-07-12', NULL, '天津', '天津', '北辰', '桥园公园创意园-A座-盘山道卓越天成国际幼儿园右侧', '桥园公园创意园-A座-盘山道卓越天成国际幼儿园右侧', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3178', 'https://imagecdn3.allcpp.cn/upload/2024/6/5206ccc5-9e6e-485c-b322-9c650ef4726b.png', 0, '["明日方舟"]', '中国', 'CN', 12, 1201, 120113, 'cpp', 3178, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('成都·舟趴之尚蜀夏日趴·明日方舟only', '2024-07-05', NULL, '四川', '成都', '成华', '天府国际动漫城', '天府国际动漫城', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=3069', 'https://imagecdn3.allcpp.cn/upload/2024/5/82a266f6-c4cb-487d-a1c0-3a7ac4821a59.jpg', 0, '["明日方舟"]', '中国', 'CN', 51, 5101, 510108, 'cpp', 3069, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州（原上海）明日方舟only-昔火惊沙', '2024-07-05', NULL, '浙江', '杭州', '临平', '临平瑞莱克斯酒店2F东瑞厅', '临平瑞莱克斯酒店2F东瑞厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2004', 'https://imagecdn3.allcpp.cn/upload/2024/6/84ff2b45-b133-471b-a576-6cd50360a4b0.png', 0, '["明日方舟"]', '中国', 'CN', 33, 3301, 330113, 'cpp', 2004, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('苏州明日方舟ONLY#2024~佑桑柔', '2024-06-15', NULL, '江苏', '苏州', '虎丘', '城际路21号汇融广场假日酒店宴会厅三楼', '城际路21号汇融广场假日酒店宴会厅三楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2754', 'https://imagecdn3.allcpp.cn/upload/2024/5/4a80b82d-fafb-4d81-b029-979343ae8b45.jpg', 0, '["ONLY","明日方舟","同人","苏州"]', '中国', 'CN', 32, 3205, 320505, 'cpp', 2754, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('南京·明日方舟only', '2024-05-25', NULL, '江苏', '南京', '江宁', '江苏省南京市江宁区双龙大道1222号六楼同曦艺术馆', '江苏省南京市江宁区双龙大道1222号六楼同曦艺术馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2843', 'https://imagecdn3.allcpp.cn/upload/2024/5/7058a041-70d9-4c1a-9005-58ea63eeacc4.png', 0, '["明日方舟","明日方舟only","南京","同人"]', '中国', 'CN', 32, 3201, 320115, 'cpp', 2843, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨·Arknights Only·愚人邀约（明日方舟Only同人展会）', '2024-05-18', NULL, '黑龙江', '哈尔滨', '道里', '安广街道71号龙门商务酒店宴会楼', '安广街道71号龙门商务酒店宴会楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2693', 'https://imagecdn3.allcpp.cn/upload/2024/4/b1ca450e-8d5c-43b5-9680-df9acd059728.png', 0, '["明日方舟","同人","哈尔滨","only","ako"]', '中国', 'CN', 23, 2301, 230102, 'cpp', 2693, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('成都明日方舟Only·悠然小憩', NULL, NULL, '四川', '成都', NULL, '成都市金牛区蜀蓉路116号锦蓉酒店七楼锦城厅', '成都市金牛区蜀蓉路116号锦蓉酒店七楼锦城厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2186', 'https://imagecdn3.allcpp.cn/upload/2024/1/51bc4f4e-d838-4940-b1bc-b615db10246d.jpg', 0, '["明日方舟","成都漫展"]', '中国', 'CN', 51, 5101, NULL, 'cpp', 2186, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('春日茶歇 明日方舟主题茶会', '2024-04-19', NULL, '江苏', '南京', NULL, '玄武区龟山公园内Dr.coffee', '玄武区龟山公园内Dr.coffee', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2366', 'https://imagecdn3.allcpp.cn/upload/2024/2/ff57823b-c073-4af6-bf52-df31457e0289.jpg', 0, '["明日方舟"]', '中国', 'CN', 32, 3201, NULL, 'cpp', 2366, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州·Arknights Only·夜航星（明日方舟Only)', '2024-04-19', NULL, '广东', '广州', NULL, '广州颐和大酒店（白云区同泰路颐和山庄内）', '广州颐和大酒店（白云区同泰路颐和山庄内）', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1990', 'https://imagecdn3.allcpp.cn/upload/2024/3/33ef7102-7664-4122-911f-2fad3ab4dbb9.png', 0, '["明日方舟","明日方舟only","广州","ArknightsOnly","莳萝籽工坊","AKO"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 1990, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('天津首届COMPLEX明日方舟Only', '2024-04-12', NULL, '天津', '天津', '河北', '天津市河北区民生路89号', '天津市河北区民生路89号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2650', 'https://imagecdn3.allcpp.cn/upload/2024/3/664e003f-5661-40fd-8371-676b6010634b.jpg', 0, '["明日方舟","粥（？）"]', '中国', 'CN', 12, 1201, 120105, 'cpp', 2650, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('成都·Arknights Only·特里蒙假日（明日方舟only）', '2024-03-29', NULL, '四川', '成都', NULL, '四川省成都市芙蓉岛公园一号盒子', '四川省成都市芙蓉岛公园一号盒子', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2403', 'https://imagecdn3.allcpp.cn/upload/2024/2/5c678012-649f-4cf4-b76f-a108b63d374c.jpg', 0, '["明日方舟"]', '中国', 'CN', 51, 5101, NULL, 'cpp', 2403, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('我在泰拉吃披萨—上海明日方舟ONLY', '2024-03-29', NULL, '上海', '上海', NULL, '诺宝中心兰晶剧场', '诺宝中心兰晶剧场', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2090', 'https://imagecdn3.allcpp.cn/upload/2023/12/b31407ed-6002-4cef-b631-05ef015a8940.png', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 2090, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【北京】明日方舟only展·春和京明', '2024-03-22', NULL, '北京', '北京', NULL, '北京市朝阳区超级蜂巢E座', '北京市朝阳区超级蜂巢E座', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2255', 'https://imagecdn3.allcpp.cn/upload/2024/1/7a873a7d-67bf-4073-a060-0c4410a60a35.jpg', 0, '["明日方舟","北京","明日方舟only","博士","明日方舟同人展"]', '中国', 'CN', 11, 1101, NULL, 'cpp', 2255, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('明日方舟&桌游ONLY茶会', '2024-02-17', NULL, '广东', '广州', NULL, '广州市海珠区中海江泰里营销中心', '广州市海珠区中海江泰里营销中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1994', 'https://imagecdn3.allcpp.cn/upload/2024/1/4c2e80f4-d36f-4c39-bbc4-4cab65ac8c52.png', 0, '["茶会","沙塔游研社","独立桌游","明日方舟同人桌游","明日方舟"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 1994, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('哈尔滨明日方舟only01觅空行动', '2024-01-27', NULL, '黑龙江', '哈尔滨', NULL, '南岗区秋林国际会议中心10楼龙凤吉祥厅', '南岗区秋林国际会议中心10楼龙凤吉祥厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2103', 'https://imagecdn3.allcpp.cn/upload/2024/1/7808435c-d4f4-4387-9a6f-9f73d75cc413.png', 0, '["明日方舟"]', '中国', 'CN', 23, 2301, NULL, 'cpp', 2103, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('厦门·第三届Arknights Only·静旅渊行(明日方舟only)', '2024-01-26', '2024-01-27', '福建', '厦门', NULL, '厦门国际博览中心1号馆', '厦门国际博览中心1号馆', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1978', 'https://imagecdn3.allcpp.cn/upload/2023/12/90faed1a-361f-41b7-a663-d0dfd8ba618b.jpg', 0, '["明日方舟","福建","厦门","ArknightsOnly","Arknights"]', '中国', 'CN', 35, 3502, NULL, 'cpp', 1978, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('杭州明日方舟only—烁阳岁宴', '2024-01-19', NULL, '浙江', '杭州', NULL, '梦马汽车小镇1号厅', '梦马汽车小镇1号厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=2086', 'https://imagecdn3.allcpp.cn/upload/2024/1/6f157a03-e320-464f-9100-5fd9b6c4caa5.jpg', 0, '["明日方舟","only","杭州"]', '中国', 'CN', 33, 3301, NULL, 'cpp', 2086, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('合肥only明日方舟', '2023-12-30', NULL, '安徽', '合肥', NULL, '银瑞林国际大酒店', '银瑞林国际大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1859', 'https://imagecdn3.allcpp.cn/upload/2023/11/17a20fcf-7b9c-41d1-8da4-1e38bce1fa35.jpg', 0, '["明日方舟only"]', '中国', 'CN', 34, 3401, NULL, 'cpp', 1859, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【旅夜安梦】上海异客中心主题茶会', '2023-12-23', NULL, '上海', '上海', NULL, '金豆咖啡·Kimbean时光花园店', '金豆咖啡·Kimbean时光花园店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1975', 'https://imagecdn3.allcpp.cn/upload/2023/11/17e801ac-6283-4e27-9667-ffcef20818f9.jpg', 0, '["明日方舟","异客"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 1975, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('【北京】明日方舟线下同好交流会', '2023-12-22', NULL, '北京', '北京', NULL, '北京市丰台区大红门国际会展中心', '北京市丰台区大红门国际会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1945', 'https://imagecdn3.allcpp.cn/upload/2023/11/48bf7027-9db8-42ef-9f99-d10519a471ed.jpg', 0, '["明日方舟","明日方舟only","北京","明日方舟同好交流会"]', '中国', 'CN', 11, 1101, NULL, 'cpp', 1945, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY2.0·澄冬花火', '2023-12-22', '2023-12-23', '上海', '上海', NULL, '上海市宝山区蕰川路6号智慧湾科创园', '上海市宝山区蕰川路6号智慧湾科创园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1893', 'https://imagecdn3.allcpp.cn/upload/2023/11/96e4a8de-ffa2-4bc5-8189-775190bc0531.jpg', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 1893, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('2023魔都明日方舟ONLY 蔚蓝夏色', '2023-08-05', NULL, '上海', '上海', NULL, '宝丰联大酒店 上海市虹口区逸仙路270号', '宝丰联大酒店 上海市虹口区逸仙路270号', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1123', 'https://imagecdn3.allcpp.cn/upload/2023/5/656e8721-3c11-4194-b48e-bee5dfbf359a.jpg', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 1123, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('厦门·第二届Arknights only·鹭屿寻踪（明日方舟only）', '2023-07-30', NULL, '福建', '厦门', NULL, 'WOKESHOW星巢越中心 杏林街道杏林湾运营中心8号楼', 'WOKESHOW星巢越中心 杏林街道杏林湾运营中心8号楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1316', 'https://imagecdn3.allcpp.cn/upload/2023/4/b5066f0b-c31e-43c5-ae04-08abea5bff0f.png', 0, '["Arknights Only","Arknights","福建","厦门","明日方舟"]', '中国', 'CN', 35, 3502, NULL, 'cpp', 1316, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海明日方舟ONLY——我在泰拉捡树枝', '2023-07-15', NULL, '上海', '上海', NULL, '上海市闵行区漕宝路1688号上海诺宝中心酒店众花厅', '上海市闵行区漕宝路1688号上海诺宝中心酒店众花厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1313', 'https://imagecdn3.allcpp.cn/upload/2023/6/87ffcae6-9d86-4566-8cec-3ad56d92285a.jpg', 0, '["明日方舟only"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 1313, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京EXA同人展游戏only', '2023-06-22', NULL, '北京', '北京', NULL, '北京大红门国际会展中心', '北京大红门国际会展中心', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1346', 'https://imagecdn3.allcpp.cn/upload/2023/5/27d02194-f55f-4d50-bd32-cc76d6b7c3aa.jpg', 0, '["游戏","手游","端游","NS","PS","steam","乙游","塞尔达","明日方舟","东方project","艾尔登法环","光与夜之恋","代号鸢","阴阳师","原神","崩坏","无期迷途","恋与制作人","未定事件簿","时空绘旅人","独立游戏","桌游","跑团","游戏王"]', '中国', 'CN', 11, 1101, NULL, 'cpp', 1346, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟茶话会SP', '2023-05-02', NULL, '广东', '广州', NULL, '天河区T.I.T创意园 mini tiger咖啡厅', '天河区T.I.T创意园 mini tiger咖啡厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1315', 'https://imagecdn3.allcpp.cn/upload/2023/4/9730e13a-4dfd-4648-a560-e5e504dbd6c3.png', 0, '["明日方舟","茶话会","广州"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 1315, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟茶话会', '2023-04-07', NULL, '广东', '广州', NULL, '天河区T.I.T创意园 mini tiger咖啡厅', '天河区T.I.T创意园 mini tiger咖啡厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1273', 'https://imagecdn3.allcpp.cn/upload/2023/3/0c104362-2b3e-4f16-b8f3-05a92a7e3d85.jpg', 0, '["明日方舟","茶话会","广州"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 1273, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟茶话会', '2023-02-24', NULL, '广东', '广州', NULL, '天河区T.I.T创意园 MINI TIGER咖啡厅', '天河区T.I.T创意园 MINI TIGER咖啡厅', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1228', 'https://imagecdn3.allcpp.cn/upload/2023/2/6090f597-9f15-4ce7-9e73-24f55553b5a8.jpg', 0, '["明日方舟","茶话会","广州"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 1228, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('2022深圳明日方舟only·海嗣清除计划', '2022-10-01', NULL, '广东', '深圳', NULL, '龙岗区坂田街道吉华路696号坂田天虹商场 4F', '龙岗区坂田街道吉华路696号坂田天虹商场 4F', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=1147', 'https://imagecdn3.allcpp.cn/upload/2022/8/adcfa7a3-212b-49d8-a4c6-b5cf8638c86b.jpg', 0, '["明日方舟"]', '中国', 'CN', 44, 4403, NULL, 'cpp', 1147, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('重庆only明日方舟展', '2021-01-29', NULL, '重庆', '重庆', NULL, '璧山俊豪中央大街', '璧山俊豪中央大街', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=910', 'https://imagecdn3.allcpp.cn/upload/2020/8/45022648-8666-475d-811c-d03bc13392fe.jpg', 0, '["明日方舟"]', '中国', 'CN', 50, 5001, NULL, 'cpp', 910, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('上海 明日方舟 同好会', '2019-12-27', '2019-12-28', '上海', '上海', NULL, '上海市人民大道221号 人民广场迪美B1 方里城市市集', '上海市人民大道221号 人民广场迪美B1 方里城市市集', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=847', 'https://imagecdn3.allcpp.cn/upload/2019/11/01b4cd97-7ed5-4b0f-8e44-1a6de7b44ec5.jpg', 0, '["明日方舟","同好会","同人","社团","only"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 847, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('2019广州明日方舟only—罗德岛岁末游园会', '2019-11-23', NULL, '广东', '广州', NULL, '广东省广州市厦滘岭南国际电子商务产业园', '广东省广州市厦滘岭南国际电子商务产业园', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=830', 'https://imagecdn3.allcpp.cn/upload/2019/10/1ba99af2-5b27-46d6-85aa-c00c2f22da6b.jpg', 0, '["明日方舟"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 830, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('宁波明日方舟ONLY', '2019-11-08', NULL, '浙江', '宁波', NULL, '宁波市桑田路333号南铂泰富广场酒店', '宁波市桑田路333号南铂泰富广场酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=822', 'https://imagecdn3.allcpp.cn/upload/2019/9/91f18a56-953c-4138-b2c5-7551a0b857a1.jpg', 0, '["明日方舟","ONLY展","同人展"]', '中国', 'CN', 33, 3302, NULL, 'cpp', 822, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('北京GA明日方舟only', '2019-10-18', NULL, '北京', '北京', NULL, '北京市东城区北三环东路36号环球贸易中心D座B1层09 S1Club', '北京市东城区北三环东路36号环球贸易中心D座B1层09 S1Club', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=735', 'https://imagecdn3.allcpp.cn/upload/2019/9/0c55410c-5296-4032-a356-abf3900e84fa.jpg', 0, '["明日方舟","阿米娅","博士","银灰","能天使","手游","塔防"]', '中国', 'CN', 11, 1101, NULL, 'cpp', 735, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('武汉明日方舟only', '2019-10-02', NULL, '湖北', '武汉', NULL, '硚口区解放大道1131号长江大酒店', '硚口区解放大道1131号长江大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=791', 'https://imagecdn3.allcpp.cn/upload/2019/8/974ac30e-0527-4b9d-9e32-002502496d5c.jpg', 0, '["明日方舟","罗德岛"]', '中国', 'CN', 42, 4201, NULL, 'cpp', 791, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('魔都明日方舟招募大会_明日方舟ONLY', '2019-10-02', NULL, '上海', '上海', NULL, '上海市宝丰联大酒店', '上海市宝丰联大酒店', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=749', 'https://imagecdn3.allcpp.cn/upload/2019/6/cb2fe4ec-f9dd-4598-8fa2-f3b5ba8db59a.jpg', 0, '["明日方舟"]', '中国', 'CN', 31, 3101, NULL, 'cpp', 749, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('广州明日方舟茶话会', '2019-08-24', NULL, '广东', '广州', NULL, '广州市番禺区厦滘地铁站岭南电商文化产业园综合楼二楼', '广州市番禺区厦滘地铁站岭南电商文化产业园综合楼二楼', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=748', 'https://imagecdn3.allcpp.cn/upload/2019/6/6895057c-7d5f-419f-88f0-94c044f15622.png', 0, '["明日方舟","同人","茶话会"]', '中国', 'CN', 44, 4401, NULL, 'cpp', 748, '2026-08-04 03:49:50', 'pending', NULL);

INSERT INTO conventions (title, start_date, end_date, province, city, district, venue, address, longitude, latitude, description, organizer, source_url, poster_url, verified, tags, country, country_code, province_code, city_code, district_code, source, source_id, imported_at, review_status, submitted_by) VALUES ('西安-龙门警署例会-方舟Only', '2019-07-05', NULL, '陕西', '西安', NULL, '长安区北长安街111号第壹咖啡', '长安区北长安街111号第壹咖啡', NULL, NULL, NULL, NULL, 'https://www.allcpp.cn/allcpp/event/event.do?event=758', 'https://imagecdn3.allcpp.cn/upload/2019/6/c149a8bb-e038-4e6e-ad97-c1ae60507eaf.png', 0, '["明日方舟","Only","明日方舟Only","西安","陕西"]', '中国', 'CN', 61, 6101, NULL, 'cpp', 758, '2026-08-04 03:49:50', 'pending', NULL);
