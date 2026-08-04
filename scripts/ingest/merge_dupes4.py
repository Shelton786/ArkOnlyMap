#!/usr/bin/env python3
# 第 4 版查重合并（依据 analyze_dupes3.js 升级版 + 版本号归一化后的 dup_candidates3.json）：
#  - 同城市簇（日期差≤3天）：保留 cpp 完整记录，COALESCE 补空字段后删除重复行
#  - 同城市·日期冲突中确属同一场（同届次、同年、仅日期/写法差异）的人工指定对：
#      #69↔#101 晋波澜（保留 bilibili #101，权威日期 2026-08-15；补回 #69 的主办方"馄饨"，
#                       并按 bilibili 售票页核实补全地址"朝阳街39号"/区"迎泽区"）
#      #24↔#156 武汉 ONLY2.0·入明界园（保留 cpp #156，已修正日期 2026-03-21）
#  - 其余日期冲突对（不同届次/跨年/单字"会"误报）经复核为真实不同场次，不合并。
import json

ROWS = {r['id']: r for r in json.load(open('scripts/ingest/data/all_events.json', encoding='utf-8'))}
CAND = json.load(open('scripts/ingest/data/dup_candidates3.json', encoding='utf-8'))

merges = {}  # keep_id -> [del_ids]
def add(keep, dels):
    merges.setdefault(keep, [])
    for d in dels:
        if d != keep and d not in merges[keep]:
            merges[keep].append(d)

for cl in CAND['sameCityClusters']:
    members = cl['members']
    keep = next((m['id'] for m in members if m['source'] == 'cpp'), members[0]['id'])
    add(keep, [m['id'] for m in members if m['id'] != keep])

add(101, [69])   # 晋波澜：保留 bilibili 权威记录
add(156, [24])   # 武汉 ONLY2.0·入明界园：保留 cpp 已修正日期

# 这些"日期冲突"对的 keeper 日期已权威，禁止从被删方回填日期列（被删方日期是错的）
NO_DATE_FILL = {101, 156}
# 经 bilibili 售票页核实的权威补充字段（id=101 晋波澜）；并置空 end_date（单日场）
SPECIAL = {
    101: {'address': '朝阳街39号', 'district': '迎泽区', 'end_date': None},
}

SKIP = {'id', 'source', 'source_id', 'created_at', 'updated_at', 'imported_at'}

def lit(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

sql = []
sql.append("-- 重复活动合并（第 4 版查重：版本号归一化 + 同城市·日期冲突分支）")
sql.append("-- 同城市簇(≤3天)保留cpp + 人工指定同届次同年冲突对；共删 N 条")
total_del = 0
for keep, dels in merges.items():
    kr = ROWS[keep]
    for d in dels:
        dr = ROWS.get(d)
        if dr is None:
            # 被删方已从导出中移除（已应用过），仅保留 DELETE 语句
            sql.append(f"DELETE FROM conventions WHERE id={d};")
            total_del += 1
            continue
        sets = []
        for col, val in dr.items():
            if col in SKIP or val is None:
                continue
            if keep in NO_DATE_FILL and col in ('start_date', 'end_date'):
                continue
            sets.append(f"  {col}=COALESCE({col}, {lit(val)})")
        if sets:
            sql.append(f"UPDATE conventions SET\n" + ",\n".join(sets) + f"\nWHERE id={keep};")
        sql.append(f"DELETE FROM conventions WHERE id={d};")
        total_del += 1
    if keep in SPECIAL:
        sp = SPECIAL[keep]
        sets = [f"  {col}=COALESCE({col}, {lit(v)})" for col, v in sp.items()]
        sql.append(f"UPDATE conventions SET\n" + ",\n".join(sets) + f"\nWHERE id={keep};")

sql[1] = sql[1].replace('N', str(total_del))
open('scripts/ingest/data/merge_dupes4.sql', 'w', encoding='utf-8').write('\n'.join(sql) + '\n')
print('merges (keep->dels):', merges)
print('total deletions:', total_del)
print('wrote scripts/ingest/data/merge_dupes4.sql')
