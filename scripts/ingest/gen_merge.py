import json, re
from datetime import date

COLS = ["title","start_date","end_date","province","city","district","venue","address",
        "longitude","latitude","description","organizer","source_url","poster_url","verified",
        "tags","country","country_code","province_code","city_code","district_code","source",
        "source_id","imported_at","review_status","submitted_by"]
# 优先保留现有值的列(不被 cpp 降级)
PREFER_EXISTING = {"review_status","verified"}

def split_values(s):
    toks=[]; i=0; n=len(s); cur=None; in_str=False
    while i<n:
        c=s[i]
        if not in_str:
            if c==" ": i+=1; continue
            if c=="'": in_str=True; cur=""; i+=1; continue
            j=i
            while j<n and s[j]!=",": j+=1
            toks.append(s[i:j].strip()); i=j+1; continue
        else:
            if c=="'" and i+1<n and s[i+1]=="'": cur+="'"; i+=2; continue
            if c=="'":
                toks.append(cur); cur=None; in_str=False; i+=1
                while i<n and s[i]!=",": i+=1
                i+=1; continue
            cur+=c; i+=1
    return toks

def pdate(s):
    try:
        y,m,d=map(int,s.split("-")); return date(y,m,d)
    except Exception:
        return None

def sql_literal(v):
    if v=="NULL": return "NULL"
    if re.fullmatch(r"-?\d+(\.\d+)?", v): return v
    return "'" + v.replace("'","''") + "'"

def norm(t):
    return re.sub(r'[\s·•·\-—:：,.，。、()（）\[\]【】]','',t).lower()

# 读取现有 DB 导出
raw=open('existing_raw2.json',encoding='utf-8').read()
d=json.loads(raw[raw.index('['):])
rows=d[0]['results']
ex_index={}
for r in rows:
    ex_index.setdefault(norm(r['title']),[]).append(dict(id=r['id'],sd=pdate(r['start_date']),src=r['source']))

# 读取用户编辑后的 incoming SQL
sql=open('scripts/ingest/data/ingest.sql',encoding='utf-8').read()
lines=[l for l in sql.splitlines() if l.strip().upper().startswith('INSERT')]

update_sqls=[]; insert_sqls=[]; matched=[]; used_ids=set()
for ln in lines:
    ln=ln.strip()
    head, rest = ln.split(" VALUES ", 1)
    colstr = head[head.index("(")+1 : head.rindex(")")]
    cols=[c.strip() for c in colstr.split(",")]
    assert cols==COLS, f"列顺序变化! 实际={cols}"
    # 先剥掉 ON CONFLICT(...) 后缀, 避免内部括号干扰
    rest = rest.split(" ON CONFLICT", 1)[0].strip()
    if rest.endswith(";"): rest = rest[:-1]
    valstr = rest[rest.index("(")+1 : rest.rindex(")")]
    toks=split_values(valstr)
    assert len(toks)==len(COLS), f"token数 {len(toks)} != {len(COLS)}"
    rec=dict(zip(COLS,toks))
    nt=norm(rec['title'])
    best=None
    for e in ex_index.get(nt,[]):
        if e['id'] in used_ids: continue
        if e['sd'] is None: continue
        dd=abs((pdate(rec['start_date'])-e['sd']).days)
        if dd<=3 and (best is None or dd<best[1]):
            best=(e,dd)
    if best:
        e=best[0]; used_ids.add(e['id'])
        sets=[]
        for col in COLS:
            v=sql_literal(rec[col])
            if col in PREFER_EXISTING:
                sets.append(f"  {col} = COALESCE({col}, {v})")
            else:
                sets.append(f"  {col} = COALESCE({v}, {col})")
        upd="UPDATE conventions SET\n"+" ,\n".join(sets)+f"\nWHERE id={e['id']};\n"
        update_sqls.append(upd)
        matched.append((e['id'], e['src'], rec['title'], rec['start_date'], rec['source_id']))
    else:
        ins="INSERT INTO conventions ("+", ".join(COLS)+") VALUES ("+", ".join(sql_literal(t) for t in toks)+");\n"
        insert_sqls.append(ins)

out="-- 合并写入: 匹配现有行则 UPDATE(补充), 否则 INSERT\n-- 生成于 2026-08-04 自动去重合并\n"
out+="\n".join(update_sqls)+"\n"+"\n".join(insert_sqls)
open('scripts/ingest/data/apply.sql','w',encoding='utf-8').write(out)

print(f"incoming 总行: {len(lines)}")
print(f"匹配现有(UPDATE): {len(update_sqls)}")
print(f"纯新增(INSERT): {len(insert_sqls)}")
print(f"被匹配消耗的现有id数: {len(used_ids)}")
print("\n--- 匹配明细(现有id|原source|标题|cpp日期|cpp_sid) ---")
for x in matched:
    print(f"  #{x[0]}[{x[1]}] {x[2]} -> {x[3]} (sid {x[4]})")
