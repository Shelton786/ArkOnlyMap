-- 0007：主办认领记录申请人，修复「通过认领后活动被归到管理员而非认领人」的问题。
-- 认领申请时写入 organizer_claim_user_id；审核通过时把活动归给该认领人。
ALTER TABLE conventions ADD COLUMN organizer_claim_user_id INTEGER REFERENCES users(id);
