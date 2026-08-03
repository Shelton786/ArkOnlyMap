// 规范化感知的查重扫描：先用 geo_codes 纠正错位的省/市/区字段并回填编码，
// 再按「规范化城市 + 日期」分组找重复。同时统计需要回填的记录数。
import fs from 'node:fs';
import { loadGeo, resolveCode, codeToNames } from './scripts/ingest/geo.mjs';

const GEO = JSON.parse(fs.readFileSync('./public/data/geo_codes.json', 'utf8'));
loadGeo(GEO);

const data = JSON.parse(fs.readFileSync('./conv_full.tmp.json', 'utf8'));

// 名称匹配助手
const has = (idx, n) => !!(n && (idx[n] || idx[String(n).replace(/(省|市|自治区|特别行政区|地区|自治州|盟|县|区|市辖区)$/, '')]));
const isProv = (n) => has(GEO.provinceIndex, n);
const isCity = (n) => has(GEO.cityIndex, n);
const isArea = (n) => has(GEO.areaIndex, n) || Object.keys(GEO.areaByCity || {}).some((k) => k.endsWith('|' + String(n).replace(/(区|县|市辖区)$/, '')));

// 规范化单条记录的地点字段（纠正错位 + 回填编码）
function normalizeLoc(rec) {
  let { province, city, district } = rec;
  // 纠正：city 实为区名 -> 降级到 district
  if (city && isArea(city) && !isCity(city)) {
    district = district || city;
    city = null;
  }
  // 纠正：province 实为城市 -> 降级到 city
  if (province && isCity(province) && !isProv(province)) {
    city = city || province;
    province = null;
  }
  // 仍缺失 province 时，从 city/district 推导
  let codes = resolveCode({ province, city, district });
  if (!codes.province_code && (codes.city_code || codes.district_code)) {
    const c = codes.district_code || (codes.city_code + '00');
    codes.province_code = String(c).slice(0, 2);
  }
  if (!codes.city_code && codes.district_code) codes.city_code = String(codes.district_code).slice(0, 4);

  // 规范文字名（用编码反查，保证与国标一致）
  let np = province, nc = city, nd = district;
  if (codes.district_code) {
    const nm = codeToNames(codes.district_code);
    if (nm) { np = nm.province_name; nc = nm.city_name; nd = nm.district_name; }
  } else if (codes.city_code) {
    const ct = GEO.cities.find((c) => c.code === codes.city_code);
    np = GEO.provinces.find((p) => p.code === codes.province_code)?.name || np;
    nc = ct ? ct.name : nc;
    nd = null;
  }
  return { province: np, city: nc, district: nd, ...codes };
}

// 规范化全部记录
const norm = data.map((r) => ({ ...r, _n: normalizeLoc(r) }));

// 统计需要回填/纠正的记录数
let needFix = 0;
const fixList = [];
for (const r of norm) {
  const n = r._n;
  const changed =
    (n.province_code && !r.province_code) ||
    (n.city_code && !r.city_code) ||
    (n.district_code && !r.district_code) ||
    (n.city && r.city && n.city !== r.city) ||
    (n.province && r.province && n.province !== r.province) ||
    (n.district && !r.district && r.city && isArea(r.city)); // city 实为区，需纠正
  if (changed) { needFix++; fixList.push(r); }
}
console.log(`=== 需要规范化回填的记录: ${needFix} / ${data.length} ===\n`);
for (const r of fixList.slice(0, 40)) {
  const n = r._n;
  console.log(`  id=${r.id} "${r.title}"`);
  console.log(`    原: province=${r.province}|city=${r.city}|district=${r.district} 编码[${r.province_code||'-'}/${r.city_code||'-'}/${r.district_code||'-'}]`);
  console.log(`    新: province=${n.province}|city=${n.city}|district=${n.district} 编码[${n.province_code||'-'}/${n.city_code||'-'}/${n.district_code||'-'}]`);
}

// 按「规范化城市 + 日期」分组找重复
const strip = (s) => (s || '').replace(/\s+/g, '').replace(/[【】\[\]（）()·・、,，。！!~～\-—_/]/g, '').toLowerCase();
const BOILER = ['明日方舟','终末地','舟x地o','舟友','无锡舟','上海舟','北京舟','广州舟','深圳舟','only','同人展','同人only','同人','展会','活动','交流','展','场','特别','主题','沉浸式','party','part','应援','线下','主办方','官方','第二','2.0','3.0','4.0','5.0'];
const core = (s) => { let t = strip(s); for (const w of BOILER) t = t.split(w).join(''); return t; };
function bigrams(s){ const t=strip(s); const set=new Set(); for(let i=0;i<t.length-1;i++) set.add(t.slice(i,i+2)); if(t.length===1) set.add(t); return set; }
function jac(a,b){ const A=typeof a==='string'?bigrams(a):a; const B=typeof b==='string'?bigrams(b):b; if(!A.size||!B.size) return 0; let x=0; for(const v of A) if(B.has(v)) x++; return x/(A.size+B.size-x); }

const byCD = {};
for (const r of norm) {
  const key = (r._n.city || r._n.province || '?') + '|' + (r.start_date || '?');
  (byCD[key] ||= []).push(r);
}
console.log(`\n=== 规范化后同城同日期分组数: ${Object.values(byCD).filter((g)=>g.length>1).length} ===\n`);

const cands = [];
for (const [k, g] of Object.entries(byCD)) {
  if (g.length < 2) continue;
  for (let i=0;i<g.length;i++) for (let j=i+1;j<g.length;j++){
    const a=g[i], b=g[j];
    const jc = jac(core(a.title)||a.title, core(b.title)||b.title);
    const ca=core(a.title), cb=core(b.title);
    const coreHit = ca.length>=2 && (strip(b.title).includes(ca)||strip(a.title).includes(cb));
    let venueHit=false;
    if(a.venue&&b.venue){ const vj=jac(a.venue,b.venue); venueHit = vj>=0.5 || (a.venue.length>=3&&(a.venue.includes(b.venue)||b.venue.includes(a.venue))); }
    const score=Math.max(jc, coreHit?0.7:0, venueHit?0.6:0);
    if((jc>=0.34||coreHit||venueHit)&&(ca||cb)) cands.push({k,a,b,jc:+jc.toFixed(2),coreHit,venueHit,ca,cb,score:+score.toFixed(2)});
  }
}
cands.sort((x,y)=>y.score-x.score);
console.log(`=== 规范化后候选重复对: ${cands.length} ===\n`);
for(const c of cands){
  console.log(`[score=${c.score} jac=${c.jc}${c.coreHit?' 核心词重合':''}${c.venueHit?' 同场馆':''}] ${c.k}`);
  console.log(`   A id=${c.a.id} [${c.a.source||'手动'}] ${c.a.title} | venue:${c.a.venue||'-'}`);
  console.log(`   B id=${c.b.id} [${c.b.source||'手动'}] ${c.b.title} | venue:${c.b.venue||'-'}`);
  console.log('');
}
console.log('DONE');
