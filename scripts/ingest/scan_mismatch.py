import json, re
from collections import Counter

raw = open("scripts/ingest/data/_dump_all.json", encoding="utf-8").read()
i = raw.find('"results"')
b = raw.find('[', i)
depth=0; in_str=False; esc=False; end=b
for j in range(b,len(raw)):
    ch=raw[j]
    if in_str:
        if esc: esc=False
        elif ch=='\\': esc=True
        elif ch=='"': in_str=False
        continue
    if ch=='"': in_str=True
    elif ch=='[': depth+=1
    elif ch==']':
        depth-=1
        if depth==0: end=j; break
rows=json.loads(raw[b:end+1])

# 构造基础城市名集合（去"市"）
city_bases=set()
for r in rows:
    c=r.get("city") or ""
    cb=c[:-1] if c.endswith("市") else c
    if cb: city_bases.add(cb)
# 省份基础名
prov_bases=set()
for r in rows:
    p=r.get("province") or ""
    pb=p[:-1] if p.endswith("省") else p
    # 直辖市/自治区
    pb=p.rstrip("市").rstrip("自治区") if p else p
    if pb: prov_bases.add(pb)
# 直辖市特殊处理
direct={"北京","上海","天津","重庆"}

print("=== 扫描：标题中出现的城市名 ≠ city 字段 ===")
title_mismatch=[]
for r in rows:
    t=r.get("title") or ""
    c=r.get("city") or ""
    cb=c[:-1] if c.endswith("市") else c
    hits=[x for x in city_bases if x in t]
    if hits:
        # 取标题里第一个出现的城市
        first=min(hits, key=lambda x: t.find(x))
        if first!=cb and cb not in hits:
            title_mismatch.append((r['id'], cb, first, t))
for id_,cb,first,t in title_mismatch:
    print(f"  · id={id_} city='{cb}' 但标题含城市'{first}': {t!r}")

print("\n=== 扫描：address/venue 中含 'X市'/'X省' 与 city/province 不符 ===")
addr_mismatch=[]
for r in rows:
    a=(r.get("address") or "")+(r.get("venue") or "")
    c=r.get("city") or ""
    cb=c[:-1] if c.endswith("市") else c
    p=(r.get("province") or "")
    pb=p[:-1] if p.endswith("省") else p
    pb=p.rstrip("市") if (p.endswith("市")) else pb
    # 在地址里找 市
    m_city=re.findall(r'([\u4e00-\u9fa5]{2,4}?)市', a)
    m_prov=re.findall(r'([\u4e00-\u9fa5]{2,4}?)省', a)
    bad=False; info=[]
    for mc in m_city:
        if mc!=cb and mc not in direct:
            bad=True; info.append(f"地址市'{mc}'≠city'{cb}'")
    for mp in m_prov:
        if mp!=pb:
            bad=True; info.append(f"地址省'{mp}'≠prov'{pb}'")
    if bad:
        addr_mismatch.append((r['id'], r.get("city"), r.get("province"), a[:40], info))
for id_,c,p,a,info in addr_mismatch:
    print(f"  · id={id_} city='{c}' prov='{p}' addr='{a}...' -> {'; '.join(info)}")

print(f"\n标题城市不符: {len(title_mismatch)} 条 | 地址城市不符: {len(addr_mismatch)} 条")
