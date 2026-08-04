#!/usr/bin/env python3
# 依据 analyze_dupes3.js 产出的 dup_candidates3.json 生成合并 SQL：
#  - 同城市簇：保留 cpp 记录（信息最全），COALESCE 补空字段后删除重复行
#  - 跨城市标错：#109（开封/河南，实为徐州彭城假日，坐标落在开封）并入 #134 后删除
# 共删 11 条（286→275）。
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

add(134, [109])  # 跨城市标错：开封实为徐州

SKIP = {'id', 'source', 'source_id', 'created_at', 'updated_at', 'imported_at'}

def lit(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

sql = []
sql.append("-- 重复活动合并（第 3 版查重）：同城市 10 簇 + 跨城市标错 1 例（#109 开封→实为徐州#134）")
sql.append("-- 保留 cpp 完整记录，COALESCE 补空字段后删除重复行；共删 11 条，286→275")
for keep, dels in merges.items():
    kr = ROWS[keep]
    for d in dels:
        dr = ROWS[d]
        sets = []
        for col, val in dr.items():
            if col in SKIP or val is None:
                continue
            sets.append(f"  {col}=COALESCE({col}, {lit(val)})")
        if sets:
            sql.append(f"UPDATE conventions SET\n" + ",\n".join(sets) + f"\nWHERE id={keep};")
        sql.append(f"DELETE FROM conventions WHERE id={d};")

open('scripts/ingest/data/merge_dupes3.sql', 'w', encoding='utf-8').write('\n'.join(sql) + '\n')
print('merges (keep->dels):', merges)
print('total deletions:', sum(len(v) for v in merges.values()))
print('wrote scripts/ingest/data/merge_dupes3.sql')
