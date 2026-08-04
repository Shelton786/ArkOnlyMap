-- 重复活动合并（第 3 版查重）：同城市 10 簇 + 跨城市标错 1 例（#109 开封→实为徐州#134）
-- 保留 cpp 完整记录，COALESCE 补空字段后删除重复行；共删 11 条，286→275
UPDATE conventions SET
  title=COALESCE(title, '明日方舟ONLY同人展【无因】'),
  start_date=COALESCE(start_date, '2026-08-08'),
  province=COALESCE(province, '上海市'),
  city=COALESCE(city, '上海'),
  venue=COALESCE(venue, '正大广场'),
  longitude=COALESCE(longitude, 121.544346),
  latitude=COALESCE(latitude, 31.221461),
  description=COALESCE(description, '状态：预售中；共8位嘉宾（详情见活动链接）'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1004180&noTitleBar=1'),
  verified=COALESCE(verified, 0),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '31'),
  city_code=COALESCE(city_code, '3101'),
  district_code=COALESCE(district_code, '310115'),
  district=COALESCE(district, '浦东新区')
WHERE id=133;
DELETE FROM conventions WHERE id=106;
UPDATE conventions SET
  title=COALESCE(title, '徐州明日方舟同人ONLY 泰拉漫游·彭城假日'),
  start_date=COALESCE(start_date, '2026-08-09'),
  province=COALESCE(province, '江苏省'),
  city=COALESCE(city, '徐州市'),
  longitude=COALESCE(longitude, 117.283752),
  latitude=COALESCE(latitude, 34.204224),
  description=COALESCE(description, '官方群号：751722322'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '32'),
  city_code=COALESCE(city_code, '3203')
WHERE id=134;
DELETE FROM conventions WHERE id=81;
UPDATE conventions SET
  title=COALESCE(title, '明日方舟同人only泰拉巡游-彭城假日'),
  start_date=COALESCE(start_date, '2026-08-09'),
  province=COALESCE(province, '河南省'),
  city=COALESCE(city, '开封市'),
  venue=COALESCE(venue, '徐州市苏宁银河国际酒店'),
  longitude=COALESCE(longitude, 114.348356),
  latitude=COALESCE(latitude, 34.788473),
  description=COALESCE(description, '状态：预售中；暂无嘉宾信息'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1003855&noTitleBar=1'),
  verified=COALESCE(verified, 0),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '41'),
  city_code=COALESCE(city_code, '4102'),
  district_code=COALESCE(district_code, '410204'),
  district=COALESCE(district, '鼓楼区')
WHERE id=134;
DELETE FROM conventions WHERE id=109;
UPDATE conventions SET
  title=COALESCE(title, '首届明日方舟×终末地同人ONLY展·跨越大地的相遇'),
  start_date=COALESCE(start_date, '2026-08-16'),
  province=COALESCE(province, '湖南省'),
  city=COALESCE(city, '长沙市'),
  venue=COALESCE(venue, '中非经贸合作促进创新示范园'),
  longitude=COALESCE(longitude, 113.03853),
  latitude=COALESCE(latitude, 28.135795),
  description=COALESCE(description, '状态：预售中；共3位嘉宾（详情见活动链接）'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1004166&noTitleBar=1'),
  verified=COALESCE(verified, 0),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '43'),
  city_code=COALESCE(city_code, '4301'),
  district_code=COALESCE(district_code, '430111'),
  district=COALESCE(district, '雨花区')
WHERE id=138;
DELETE FROM conventions WHERE id=121;
UPDATE conventions SET
  title=COALESCE(title, '沈阳明日方舟only5.0：空庭循迹'),
  start_date=COALESCE(start_date, '2026-08-23'),
  province=COALESCE(province, '辽宁省'),
  city=COALESCE(city, '沈阳市'),
  venue=COALESCE(venue, '沈阳于洪碧桂园凤凰酒店'),
  address=COALESCE(address, '于洪碧桂园凤凰酒店'),
  longitude=COALESCE(longitude, 123.344908),
  latitude=COALESCE(latitude, 41.751975),
  description=COALESCE(description, '官方群号：872049186
主催QQ：3387761870
社团报名群：cpp申摊
进度：6.27开始申摊'),
  organizer=COALESCE(organizer, '惊蛰'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '21'),
  city_code=COALESCE(city_code, '2101'),
  district_code=COALESCE(district_code, '210114'),
  district=COALESCE(district, '于洪区')
WHERE id=140;
DELETE FROM conventions WHERE id=85;
UPDATE conventions SET
  title=COALESCE(title, '西安明日方舟ONLY-铳火序曲'),
  start_date=COALESCE(start_date, '2026-09-12'),
  province=COALESCE(province, '陕西省'),
  city=COALESCE(city, '西安市'),
  venue=COALESCE(venue, '西安浐灞丝路国际文化艺术中心美术馆'),
  address=COALESCE(address, '西安浐灞丝路国际文化艺术中心美术馆'),
  longitude=COALESCE(longitude, 109.042503),
  latitude=COALESCE(latitude, 34.317242),
  description=COALESCE(description, '官方群号：795293359
主催QQ：1940445253
社团报名群：cpp申摊'),
  organizer=COALESCE(organizer, '页石'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1000944&noTitleBar=1'),
  poster_url=COALESCE(poster_url, 'https://i1.hdslb.com/bfs/openplatform/202605/mmAmeUdp1778488428_1778488428742.jpg@400h_70q_progressive.jpg'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '61'),
  city_code=COALESCE(city_code, '6101')
WHERE id=143;
DELETE FROM conventions WHERE id=88;
UPDATE conventions SET
  title=COALESCE(title, '西安明日方舟only-醉弈秦川'),
  start_date=COALESCE(start_date, '2026-10-24'),
  province=COALESCE(province, '陕西省'),
  city=COALESCE(city, '西安市'),
  venue=COALESCE(venue, '常宁宫园林酒店'),
  longitude=COALESCE(longitude, 108.939645),
  latitude=COALESCE(latitude, 34.343207),
  description=COALESCE(description, '官方群号：922924272
主催QQ：1402589793'),
  organizer=COALESCE(organizer, '塞西莉娅'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '61'),
  city_code=COALESCE(city_code, '6101'),
  district_code=COALESCE(district_code, '610116'),
  district=COALESCE(district, '长安区')
WHERE id=145;
DELETE FROM conventions WHERE id=90;
UPDATE conventions SET
  title=COALESCE(title, '猎潮幽影-明日方舟同人only'),
  start_date=COALESCE(start_date, '2026-08-02'),
  province=COALESCE(province, '广西壮族自治区'),
  city=COALESCE(city, '南宁市'),
  venue=COALESCE(venue, '南宁K国际酒店(会展中心地铁站店)'),
  longitude=COALESCE(longitude, 108.495204),
  latitude=COALESCE(latitude, 22.785833),
  description=COALESCE(description, '状态：预售中；暂无嘉宾信息'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1002837&noTitleBar=1'),
  verified=COALESCE(verified, 0),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '45'),
  city_code=COALESCE(city_code, '4501'),
  district_code=COALESCE(district_code, '450103'),
  district=COALESCE(district, '青秀区')
WHERE id=148;
DELETE FROM conventions WHERE id=124;
UPDATE conventions SET
  title=COALESCE(title, '明日方舟同人only《荔枝味夏梦》'),
  start_date=COALESCE(start_date, '2026-07-26'),
  province=COALESCE(province, '广东省'),
  city=COALESCE(city, '广州市'),
  venue=COALESCE(venue, 'LIC灵感创新展馆'),
  address=COALESCE(address, '灵感创新展馆'),
  longitude=COALESCE(longitude, 113.358325),
  latitude=COALESCE(latitude, 23.098375),
  description=COALESCE(description, '状态：预售中；暂无嘉宾信息'),
  source_url=COALESCE(source_url, 'https://mall.bilibili.com/neul-next/ticket-renovation/detail.html?id=1003559&noTitleBar=1'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country=COALESCE(country, '中国'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '44'),
  city_code=COALESCE(city_code, '4401'),
  district_code=COALESCE(district_code, '440105'),
  district=COALESCE(district, '海珠区')
WHERE id=150;
DELETE FROM conventions WHERE id=122;
UPDATE conventions SET
  title=COALESCE(title, '河北·石家庄第一届明日方舟ONLY烬潮挽歌'),
  start_date=COALESCE(start_date, '2026-04-06'),
  province=COALESCE(province, '河北省'),
  city=COALESCE(city, '石家庄市'),
  longitude=COALESCE(longitude, 114.514976),
  latitude=COALESCE(latitude, 38.042007),
  description=COALESCE(description, '官方群号：1044296193
社团报名群：qq群申摊'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '13'),
  city_code=COALESCE(city_code, '1301')
WHERE id=155;
DELETE FROM conventions WHERE id=33;
UPDATE conventions SET
  title=COALESCE(title, '南京ArkOnly01•天使的星期日'),
  start_date=COALESCE(start_date, '2026-03-08'),
  province=COALESCE(province, '江苏省'),
  city=COALESCE(city, '南京市'),
  address=COALESCE(address, '南京空港会展中心（空港温德姆花园酒店）'),
  longitude=COALESCE(longitude, 118.829375),
  latitude=COALESCE(latitude, 31.789125),
  description=COALESCE(description, '主催QQ：2042427701
社团报名群：cpp申摊'),
  organizer=COALESCE(organizer, '紫音'),
  poster_url=COALESCE(poster_url, 'https://imagecdn3.allcpp.cn/upload/2025/12/98259cae-cff7-4408-95ce-1c2783136684.png?image_process=format,jpg'),
  verified=COALESCE(verified, 0),
  tags=COALESCE(tags, '[]'),
  review_status=COALESCE(review_status, 'approved'),
  submission_type=COALESCE(submission_type, 'new'),
  organizer_claim_status=COALESCE(organizer_claim_status, 'none'),
  country_code=COALESCE(country_code, 'CN'),
  province_code=COALESCE(province_code, '32'),
  city_code=COALESCE(city_code, '3201')
WHERE id=157;
DELETE FROM conventions WHERE id=19;
