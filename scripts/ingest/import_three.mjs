// 临时：仅录入 3 个 CPP 新活动（7276/7259/7190）。
// 设计：detail 页抓 poster/标题/标签/主办方；定位字段强制用列表接口(cpp_now.json)的
// province/city/district（detail 页裸地址无法解析城市）。不碰其余 9 条已存在记录。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadGeo, resolveCode, codeToNames } from './geo.mjs';
import { fetchDetail, toRawRecord, msToDate } from './cpp.mjs';
import { normalize } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const GEO_PATH = path.join(ROOT, 'public', 'data', 'geo_codes.json');
const SQL_PATH = path.join(__dirname, 'data', 'ingest.sql');
const DB = 'arknights-only-map';

loadGeo(JSON.parse(fs.readFileSync(GEO_PATH, 'utf8')));

// 列表接口给出的干净定位（来源 cpp_now.json）
const now = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'cpp_now.json'), 'utf8'));
const locById = Object.fromEntries(now.map((r) => [r.source_id, r]));

const COLS = ['title','start_date','end_date','province','city','district','venue','address',
  'longitude','latitude','description','organizer','source_url','poster_url','verified','tags',
  'country','country_code','province_code','city_code','district_code','source','source_id','imported_at','review_status','submitted_by'];

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}
function toSql(r) {
  const placeholders = COLS.map((c) => {
    const v = r[c];
    if (c === 'verified') return v != null ? Number(v) : 0;
    if (c === 'longitude' || c === 'latitude') return v != null ? Number(v) : 'NULL';
    if (v === null || v === undefined) return 'NULL';
    return `'${String(v).replace(/'/g, "''")}'`;
  });
  const update = COLS.filter((c) => !['source', 'source_id', 'submitted_by', 'id'].includes(c))
    .map((c) => `${c}=excluded.${c}`).join(', ');
  return `INSERT INTO conventions (${COLS.join(', ')}) VALUES (${placeholders.join(', ')}) ` +
    `ON CONFLICT(source, source_id) DO UPDATE SET ${update};`;
}

const ids = ['7276', '7259', '7190'];
const records = [];
for (const eid of ids) {
  const html = await fetchDetail(eid);
  const rec = toRawRecord(eid, html, {});
  if (!rec || rec.__excluded) { console.error(`✗ [${eid}] 被排除或无标题，跳过`); continue; }
  const loc = locById[eid];
  if (!loc) { console.error(`✗ [${eid}] 在 cpp_now.json 找不到定位，跳过`); continue; }
  // 强制用列表接口的干净定位
  rec.province = loc.province || null;
  rec.city = loc.city || null;
  rec.district = loc.district || null;
  rec.review_status = 'approved';
  const c = normalize(rec, 'cpp');
  records.push(c);
  console.error(`✓ [${eid}] ${c.title} ｜ ${c.province}/${c.city}/${c.district} ｜ code=${c.province_code}/${c.city_code}/${c.district_code}`);
}

if (!records.length) { console.error('无记录可写'); process.exit(1); }
const sqls = records.map(toSql);
fs.mkdirSync(path.dirname(SQL_PATH), { recursive: true });
fs.writeFileSync(SQL_PATH, sqls.join('\n'));
console.error(`生成 ${sqls.length} 条 SQL -> ${SQL_PATH}`);

// ---- 写远程 D1 ----
const wrangler = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const node = process.execPath;
const { execFileSync } = await import('node:child_process');
const out = execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--file=' + SQL_PATH], { encoding: 'utf8' });
console.error('写入输出：' + out.split('\n').filter((l) => /success|changes|rows|error/i.test(l)).slice(0, 6).join(' | '));

// ---- 自动补坐标（仅这 3 条缺坐标）----
function loadEnv() {
  try {
    const txt = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  } catch (e) {}
}
const AMAP_KEY = (loadEnv(), process.env.AMAP_WEB_KEY || '');
const AMAP_SECRET = process.env.AMAP_WEB_SECRET || '';
function buildAmapParams(obj) {
  const p = new URLSearchParams();
  Object.keys(obj).forEach((k) => { if (obj[k] != null && obj[k] !== '') p.set(k, obj[k]); });
  if (AMAP_SECRET) {
    const sorted = Object.keys(obj).filter((k) => obj[k] != null && obj[k] !== '').sort().map((k) => `${k}=${obj[k]}`).join('&');
    p.set('sig', crypto.createHash('md5').update(sorted + AMAP_SECRET).digest('hex'));
  }
  return p;
}
const sleepGeo = (ms) => new Promise((r) => setTimeout(r, ms));
async function geocodeOne(address, city) {
  const strategies = [address, (city ? city + ' ' : '') + (address || ''), city].filter(Boolean);
  for (const addr of strategies) {
    let attempt = 0;
    while (attempt <= 4) {
      try {
        const params = buildAmapParams({ key: AMAP_KEY, address: addr, city: city || '', output: 'JSON' });
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
        const data = await resp.json();
        if (data.status === '1' && data.geocodes && data.geocodes.length) {
          const [lng, lat] = (data.geocodes[0].location || '').split(',').map(Number);
          if (!Number.isNaN(lng) && !Number.isNaN(lat)) return { longitude: lng, latitude: lat };
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) {
          attempt++; await sleepGeo(1000 * attempt); continue;
        } else return null;
      } catch (e) { attempt++; await sleepGeo(1000 * attempt); }
    }
  }
  return null;
}

if (!AMAP_KEY) { console.error('（跳过补坐标：无 AMAP_WEB_KEY）'); process.exit(0); }
const q = `SELECT id, address, city, district FROM conventions WHERE source='cpp' AND source_id IN (${ids.map((i) => `'${i}'`).join(',')}) AND (longitude IS NULL OR latitude IS NULL);`;
const raw = execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--command', q], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
const rows = (() => { const i = raw.indexOf('['); if (i < 0) return []; const d = JSON.parse(raw.slice(i)); let a = d[0] && d[0].results; if (Array.isArray(a)) { if (a.length && Array.isArray(a[0] && a[0].results)) return a[0].results; return a; } return []; })();
console.error(`补坐标：缺坐标 ${rows.length} 条`);
const outSql = [];
for (const r of rows) {
  const addr = [r.district, r.address].filter(Boolean).join(' ');
  const loc = await geocodeOne(addr, r.city);
  if (loc) outSql.push(`UPDATE conventions SET longitude=${loc.longitude}, latitude=${loc.latitude} WHERE id=${r.id};`);
  else console.error(`  ! 无法编码 #${r.id}（${r.city}/${r.address}）`);
  await sleepGeo(200);
}
if (outSql.length) {
  const f = path.join(__dirname, 'data', 'geocode_auto.sql');
  fs.writeFileSync(f, outSql.join('\n'));
  execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--file=' + f], { encoding: 'utf8' });
  console.error(`✅ 补坐标完成：${outSql.length}/${rows.length} 条`);
} else console.error('（无成功编码）');
