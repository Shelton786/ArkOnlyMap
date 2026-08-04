import json, re
from datetime import date

rows = json.load(open('scripts/ingest/data/all_events.json', encoding='utf-8'))

def norm(t):
    t = (t or '').lower()
    return re.sub(r'[\s·•·\-—:：,.，。、()（）\[\]【】"\'/\\]', '', t)

GENERIC = ['明日方舟','方舟','终末地','arknights','only','同人','展会','展','活动','联合','主办',
           '限定','主题','嘉年华','祭','典','市集','专场','特别','场','巡回','巡演','茶会','交流会',
           '上海','北京','广州','深圳','成都','杭州','武汉','南京','西安','重庆','苏州','无锡','长沙',
           '厦门','天津','青岛','合肥','郑州','福州','济南','宁波','珠海','佛山','东莞','常州','南通',
           '昆明','贵阳','南宁','太原','南昌','兰州','石家庄','海口','三亚','香港','台北','沈阳','大连',
           '长春','哈尔滨','泉州','温州','金华','嘉兴','绍兴','台州','烟台','潍坊','保定','洛阳','桂林',
           '湛江','中山','惠州','江门','汕头','银川','西宁','乌鲁木齐','合肥','临沂','烟台','潍坊','保定',
           '徐州','扬州','常州','南通','盐城','泰州','镇江','连云港','淮安','宿迁','湖州','丽水','衢州',
           '芜湖','蚌埠','淮南','马鞍山','安庆','阜阳','六安','宣城','铜陵','滁州','池州','黄山','亳州',
           '廊坊','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','衡水','廊坊','大同','阳泉',
           '长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁','包头','乌海','赤峰','通辽','鄂尔多斯',
           '呼伦贝尔','巴彦淖尔','乌兰察布','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦',
           '铁岭','朝阳','葫芦岛','吉林','四平','辽源','通化','白山','松原','白城','延边','齐齐哈尔','鸡西',
           '鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化','大兴安岭','淮北','巢湖']

def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0]*(m+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for j in range(1, m+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]+1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    i, j, s = n, m, ''
    while i>0 and j>0:
        if a[i-1]==b[j-1]:
            s = a[i-1]+s; i-=1; j-=1
        elif dp[i-1][j] >= dp[i][j-1]:
            i-=1
        else:
            j-=1
    return s

def is_generic(sub):
    t = sub
    for g in GENERIC:
        t = t.replace(g, '')
    return t == ''

def pdate(s):
    try:
        y,m,d = map(int, s.split('-')); return date(y,m,d)
    except: return None

# 同城市分组
groups = {}
for r in rows:
    groups.setdefault(norm(r.get('city') or ''), []).append(r)

pairs = []
for city, items in groups.items():
    if len(items) < 2: continue
    for a in range(len(items)):
        for b in range(a+1, len(items)):
            na, nb = norm(items[a]['title']), norm(items[b]['title'])
            if not na or not nb or na == nb: continue
            da, db = pdate(items[a]['start_date']), pdate(items[b]['start_date'])
            if da is None or db is None: continue
            if abs((da-db).days) > 2: continue   # 日期差 > 2 天跳过
            sub = lcs(na, nb)
            contain = (na in nb) or (nb in na)
            if contain or (len(sub) >= 4 and not is_generic(sub)):
                pairs.append((items[a], items[b], sub, contain))

# 连通分量
ids = {r['id'] for r in rows}
adj = {i: set() for i in ids}
for a, b, sub, contain in pairs:
    adj[a['id']].add(b['id']); adj[b['id']].add(a['id'])

seen = set(); clusters = []
for r in rows:
    i = r['id']
    if i in seen: continue
    stack=[i]; comp=[]
    while stack:
        x=stack.pop()
        if x in seen: continue
        seen.add(x); comp.append(x)
        for y in adj[x]:
            if y not in seen: stack.append(y)
    if len(comp) > 1:
        clusters.append(comp)

print(f"候选重复簇: {len(clusters)}")
for ci, comp in enumerate(clusters):
    print("="*80)
    print(f"簇 #{ci+1} (成员 {len(comp)}):")
    for i in comp:
        r = next(x for x in rows if x['id']==i)
        print(f"  #{r['id']} [{r['source']}] {r['start_date']} {r['city']}/{r['district']} | {r['title']}")
        print(f"      addr={r['address']} coord=({r['longitude']},{r['latitude']}) claim={r.get('organizer_claim_user_id')}")
