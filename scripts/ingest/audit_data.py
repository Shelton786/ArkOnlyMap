import json, re, sys
from collections import defaultdict, Counter

path = "scripts/ingest/data/_dump_all.json"
raw = open(path, encoding="utf-8").read()
# 定位第一个 "results" 之后的 [，用括号平衡扫描到匹配的 ]
i = raw.find('"results"')
if i < 0:
    sys.exit("未找到 results")
b = raw.find('[', i)
depth = 0
in_str = False
esc = False
end = b
for j in range(b, len(raw)):
    ch = raw[j]
    if in_str:
        if esc: esc = False
        elif ch == '\\': esc = True
        elif ch == '"': in_str = False
        continue
    if ch == '"': in_str = True
    elif ch == '[': depth += 1
    elif ch == ']':
        depth -= 1
        if depth == 0:
            end = j
            break
rows = json.loads(raw[b:end+1])

print(f"总记录数: {len(rows)}")

# ---- 1. 城市名 '市' 后缀不一致 ----
city_raw = defaultdict(Counter)   # norm_city -> Counter(原始city)
for r in rows:
    c = r.get("city") or ""
    nc = c[:-1] if c.endswith("市") else c
    city_raw[nc][c] += 1

print("\n=== [1] 城市名后缀不一致（同一城市存在 'X' 与 'X市' 两种写法）===")
inconsistent = {k:v for k,v in city_raw.items() if len(v) > 1}
if not inconsistent:
    print("  无")
else:
    tot = 0
    for nc, ctr in sorted(inconsistent.items()):
        variants = ", ".join(f"{k}({v})" for k,v in ctr.items())
        print(f"  · 规范'{nc}': {variants}")
        tot += sum(ctr.values())
    print(f"  >> 受影响记录: {tot} 条，涉及 {len(inconsistent)} 个城市的写法不统一")

# ---- 2. 省份名 '省' 后缀不一致 ----
prov_raw = defaultdict(Counter)
for r in rows:
    p = r.get("province") or ""
    np_ = p[:-1] if p.endswith("省") else p
    prov_raw[np_][p] += 1
print("\n=== [2] 省份名后缀不一致（'省' 字是否带）===")
pincon = {k:v for k,v in prov_raw.items() if len(v) > 1}
if not pincon:
    print("  无（省份要么都带省要么都不带）")
else:
    for np_, ctr in sorted(pincon.items()):
        print(f"  · 规范'{np_}': " + ", ".join(f"{k}({v})" for k,v in ctr.items()))
# 列出到底哪些 province 带省、哪些不带（整体观感）
allprov = Counter((r.get("province") or "(空)") for r in rows)
print("  省份取值分布:", dict(allprov))

# ---- 3. province 为空 ----
print("\n=== [3] province 为空的记录 ===")
empty_prov = [r for r in rows if not (r.get("province") or "").strip()]
if not empty_prov:
    print("  无")
else:
    for r in empty_prov:
        print(f"  · id={r['id']} title={r['title']!r} city={r.get('city')!r}")

# ---- 4. tags 格式 ----
print("\n=== [4] tags 字段格式 ===")
tag_json, tag_plain, tag_null, tag_other = 0,0,0,0
examples = []
for r in rows:
    t = r.get("tags")
    if t is None or t == "":
        tag_null += 1; continue
    if isinstance(t, str) and t.strip().startswith("["):
        tag_json += 1
    else:
        tag_plain += 1
        if len(examples) < 8:
            examples.append((r['id'], t))
print(f"  JSON数组字符串: {tag_json}  | 逗号/纯文本: {tag_plain}  | 空: {tag_null}")
if examples:
    print("  纯文本样例:")
    for i,t in examples:
        print(f"    id={i}: {t!r}")

# ---- 5. 日期格式 & 倒挂 ----
print("\n=== [5] 日期格式 / 倒挂 ===")
date_re = re.compile(r'^\d{4}-\d{2}-\d{2}$')
bad_fmt, inverted, end_null, end_eq_start = [], [], 0, 0
for r in rows:
    s, e = r.get("start_date"), r.get("end_date")
    if s and not date_re.match(s): bad_fmt.append((r['id'], s, 'start'))
    if e and not date_re.match(e): bad_fmt.append((r['id'], e, 'end'))
    if s and e:
        if e < s: inverted.append((r['id'], s, e))
        elif e == s: end_eq_start += 1
    if not e and s: end_null += 1
print(f"  格式异常: {len(bad_fmt)}")
for x in bad_fmt[:20]: print(f"    id={x[0]} {x[2]}={x[1]!r}")
print(f"  倒挂(end<start): {len(inverted)}")
for x in inverted[:20]: print(f"    id={x[0]} {x[1]}~{x[2]}")
print(f"  end_date 为 NULL: {end_null} 条（其中单日活动未填结束日）")
print(f"  end_date == start_date（单日明确填了结束日）: {end_eq_start} 条")

# ---- 6. 标题错别字 Only ----
print("\n=== [6] 标题中 'Only' 的拼写异常（Olny/Onyl/Olly 等）===")
typo = []
for r in rows:
    t = r.get("title") or ""
    for bad in ["Olny","Onyl","Olly","Oly","Ony","Ol ny"]:
        if bad in t:
            typo.append((r['id'], t)); break
for i,t in typo: print(f"  · id={i}: {t!r}")
if not typo: print("  无")

# ---- 7. 同规范城市 + 同日期 的真正重复（排除不同届次）----
print("\n=== [7] 同(规范城市 + 起止日期) 的疑似真重复 ===")
key = defaultdict(list)
for r in rows:
    c = r.get("city") or ""
    nc = c[:-1] if c.endswith("市") else c
    key[(nc, r.get("start_date"), r.get("end_date"))].append(r)
dups = {k:v for k,v in key.items() if len(v) > 1}
if not dups:
    print("  无（所有同标题同城市都是不同日期，系不同届次/场次，非重复）")
else:
    for k,v in dups.items():
        ids = ", ".join(str(x['id']) for x in v)
        print(f"  · {k}: ids={ids}")

# ---- 8. end_date 为 NULL 且非单日？ 单日活动 end null 不强制，但列出比例 ----
print("\n=== [8] 城市-省份逻辑快速校验（city 已规范化后）===")
# 直辖市城市不应有省前缀省份，粗略提示
direct = {"北京","上海","天津","重庆"}
mismatch = []
for r in rows:
    c = r.get("city") or ""
    nc = c[:-1] if c.endswith("市") else c
    p = (r.get("province") or "").rstrip("省")
    if nc in direct and p and p != nc:
        mismatch.append((r['id'], nc, p))
for i,nc,p in mismatch[:30]:
    print(f"  · id={i} 城市'{nc}' 但省份'{p}'（直辖市省份应等于城市或为空）")
if not mismatch: print("  未发现明显直辖市-省份矛盾")
