-- 修复 id=96「天津明日方舟音律联觉观影会」主办归属
-- 背景：该活动 organizer_user_id 误挂到 Doc（uid 1，站长），实际主办为提交者俄刻柴（uid 8，AM-40395385，role=organizer）
-- 审计：Doc 名下仅此一个活动，改动无连带影响；俄刻柴已是 organizer 角色，无需升降级
-- 惯例：不动 updated_at（同 retitle.sql）
UPDATE conventions SET organizer_user_id = 8 WHERE id = 96;
