#!/usr/bin/env node
// 第三版查重（修正）：
//  - 同城市内按归一化核心名模糊相似（LCS 比例≥0.85，日期差≤3天）聚簇 → 几乎必为真重复
//  - 跨城市高相似（≥0.92，日期差≤2天）单独列为"疑似城市标错"待人工复核对（不自动并入同城市簇，
//    因为同一品牌活动常在多城同期举办，如 HAPPY ZOO 在北京/上海/杭州同期，属不同场次非重复）
//  - 对"通用类型词"核心（茶话会/交流会…）要求严格精确匹配，避免不同届次被并入
// 依赖 scripts/ingest/data/all_events.json + public/data/geo_codes.json
const fs = require('fs');

const rows = JSON.parse(fs.readFileSync('scripts/ingest/data/all_events.json', 'utf8'));
const g = JSON.parse(fs.readFileSync('public/data/geo_codes.json', 'utf8'));

const geoNames = new Set();
for (const arr of ['provinces', 'cities', 'areas']) {
  for (const x of (g[arr] || [])) {
    const n = x.name;
    if (!n) continue;
    geoNames.add(n);
    for (const suf of ['省', '市', '区', '县', '自治区', '特别行政区', '壮族自治区', '回族自治区', '维吾尔自治区', '自治州', '地区', '盟']) {
      if (n.endsWith(suf)) geoNames.add(n.slice(0, -suf.length));
    }
  }
}
const GENERIC = ['明日方舟', '同人', '联动', '展会', '活动', '同好', '集会', '专场', '庆典', '盛典', '漫展', '嘉年华', '主题', '聚会', 'only', '同人only', '的', '暨', '展'];
const TYPE_WORDS = ['茶话会', '茶会', '交流会', '同好会', '观影会', '嘉年华', '漫展', '博览会', '展会', '派对', '聚会', '游园会', '桌游', '招募大会', '线下交流会', '主题茶会', '运动会', '盛典', '庆典', '沙龙', '分享会'];

function normCore(title) {
  if (!title) return '';
  let s = title.toLowerCase().replace(/only/g, '');
  s = s.replace(/[^\u4e00-\u9fff0-9a-z]/g, '');
  for (const w of GENERIC) s = s.split(w).join('');
  for (const gn of [...geoNames].sort((a, b) => b.length - a.length)) if (gn.length >= 2) s = s.split(gn).join('');
  return s;
}
function normCity(c) {
  if (!c) return '';
  c = c.trim();
  for (const suf of ['省', '市', '自治区', '特别行政区', '壮族自治区', '回族自治区', '维吾尔自治区', '自治州', '地区', '盟', '区', '县']) if (c.endsWith(suf)) c = c.slice(0, -suf.length);
  return c;
}
function isGenericCore(c) { return c.length < 3 || TYPE_WORDS.some(t => c.includes(t)); }

for (const r of rows) { r._core = normCore(r.title); r._city = normCity(r.city); }

function pd(s) { const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; }
function sim(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.98;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return 2 * dp[m][n] / (m + n);
}

const N = rows.length;
const sameCityEdges = [];
const crossCityPairs = [];
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const a = rows[i], b = rows[j];
    const sc = sim(a._core, b._core);
    const sameCity = a._city && a._city === b._city;
    const da = pd(a.start_date), db = pd(b.start_date);
    const dd = (da && db) ? Math.abs((da - db) / 86400000) : 999;
    const ga = isGenericCore(a._core), gb = isGenericCore(b._core);
    if (sameCity && dd <= 3) {
      const needExact = ga && gb;
      if ((needExact && a._core === b._core) || (!needExact && sc >= 0.85)) sameCityEdges.push([i, j, +sc.toFixed(3), dd]);
    } else if (sc >= 0.92 && dd <= 2) {
      crossCityPairs.push([i, j, +sc.toFixed(3), dd]);
    }
  }
}

// 同城市并查集
const parent = Array.from({ length: N }, (_, i) => i);
const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
for (const [i, j] of sameCityEdges) parent[find(i)] = find(j);
const clusters = {};
for (let k = 0; k < N; k++) (clusters[find(k)] ||= []).push(k);
const sameCityClusters = Object.values(clusters).filter(v => v.length >= 2).sort((a, b) => b.length - a.length);

function show(r) { return `#${r.id} | ${r.start_date || '?'} | ${r.city || '?'}/${r.province || '?'} | ${r.source || 'null'} | core='${r._core}' | ${r.title}`; }

console.log(`同城市重复簇: ${sameCityClusters.length}  （涉及 ${sameCityClusters.reduce((s, v) => s + v.length, 0)} 条）`);
const outSame = sameCityClusters.map((cl, idx) => ({ cluster: idx + 1, members: cl.map(k => ({ id: rows[k].id, title: rows[k].title, start: rows[k].start_date, city: rows[k].city, province: rows[k].province, source: rows[k].source, lon: rows[k].longitude, lat: rows[k].latitude, core: rows[k]._core })) }));
for (const cl of sameCityClusters) {
  console.log(`\n=== 同城市簇 #${sameCityClusters.indexOf(cl) + 1} (${cl.length} 条) ===`);
  for (const k of cl) console.log('  ' + show(rows[k]));
}
console.log(`\n跨城市疑似标错对: ${crossCityPairs.length}`);
const outCross = crossCityPairs.map(([i, j, sc, dd]) => ({ a: { id: rows[i].id, title: rows[i].title, city: rows[i].city, start: rows[i].start_date }, b: { id: rows[j].id, title: rows[j].title, city: rows[j].city, start: rows[j].start_date }, sim: sc, dayDiff: dd }));
for (const [i, j, sc, dd] of crossCityPairs) {
  console.log(`  [sim=${sc} d=${dd}] ${show(rows[i])}  <->  ${show(rows[j])}`);
}
fs.writeFileSync('scripts/ingest/data/dup_candidates3.json', JSON.stringify({ sameCityClusters: outSame, crossCityPairs: outCross }, null, 2), 'utf8');
console.log('\n已写出 scripts/ingest/data/dup_candidates3.json');
