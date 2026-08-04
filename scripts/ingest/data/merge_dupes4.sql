-- 重复活动合并（第 4 版查重：版本号归一化 + 同城市·日期冲突分支）。共删 3 条：#8 #24 #69。
-- 依据：analyze_dupes3.js 升级版（normCore 版本号归一化 e3/03/3.0 等价）+ 用户人工确认。
-- 注意：日期冲突对的 keeper 日期为权威值，禁止从被删方回填日期列（被删方日期是错的）。

-- 1) 青岛明日方舟ONLY同人交流会4.0：保留 cpp #163，删除旧手工录入 #8（同城市同日期 2026-01-31）
DELETE FROM conventions WHERE id=8;

-- 2) 武汉明日方舟ONLY2.0·入明界园：保留 cpp #156（日期已修正为 2026-03-21），删除旧手工录入 #24
DELETE FROM conventions WHERE id=24;

-- 3) 晋波澜 ONLY03：保留 bilibili #101（经 bilibili 售票页核实权威日期 2026-08-15，单日场），
--    补回旧录入 #69 的主办方"馄饨"，并按售票页补全地址/区；删除 #69。
UPDATE conventions SET
  organizer=COALESCE(organizer, '馄饨'),
  address=COALESCE(address, '朝阳街39号'),
  district=COALESCE(district, '迎泽区'),
  end_date=NULL
WHERE id=101;
DELETE FROM conventions WHERE id=69;
