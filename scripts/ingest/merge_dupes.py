import json

rows = {r['id']: r for r in json.load(open('scripts/ingest/data/all_events.json', encoding='utf-8'))}

# (保留id, [待删除的重复id...])  ——基于 analyze_dupes2 复核结果
MERGE = [
    (166, [2]),
    (165, [5, 6]),
    (158, [18]),
    (154, [40]),
    (151, [41]),
    (152, [43]),
    (59,  [60]),
    (147, [74]),
    (141, [86]),
    (139, [95]),
    (132, [100]),
    (136, [107]),
]

# 仅使用 dump 中实际存在的列（dump 来自 SELECT *）
COLS = [c for c in rows[next(iter(rows))].keys() if c != 'id']

def q(v):
    if v is None: return 'NULL'
    s = str(v).replace("'", "''")
    return f"'{s}'"

sql = '-- 重复活动合并：保留信息更全的记录，COALESCE 补充旧行字段后删除重复行\n'
sql += '-- 基于 analyze_dupes2 复核，跳过 #13 误报\n'
kept_ids = set()
for keep, dels in MERGE:
    kept_ids.add(keep)
    kr = rows[keep]
    merged = dict(kr)
    for d in dels:
        dr = rows[d]
        for c in COLS:
            if merged.get(c) in (None, '') and dr.get(c) not in (None, ''):
                merged[c] = dr[c]
    sets = ', '.join(f"{c}={q(merged[c])}" for c in COLS)
    sql += f"UPDATE conventions SET {sets} WHERE id={keep};\n"
    for d in dels:
        sql += f"DELETE FROM conventions WHERE id={d};\n"

open('scripts/ingest/data/merge_dupes.sql', 'w', encoding='utf-8').write(sql)

# 统计
del_total = sum(len(d) for _, d in MERGE)
print(f"合并簇: {len(MERGE)}，删除重复行: {del_total}，保留后总数预计: {len(rows)-del_total}")
for keep, dels in MERGE:
    print(f"  保留 #{keep} <- 删除 {dels}")
