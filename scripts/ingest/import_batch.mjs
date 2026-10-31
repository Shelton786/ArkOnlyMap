// CPP 定向导入：只录入指定 id 的新活动，不触碰库内其余记录（避免全量重导清空简介/主办方）。
// 定位强制用列表接口的省/市/区（详情页裸地址常解析不出城市），海报优先手机端大图。
// id 来源：命令行参数 > data/ids.txt > data/cpp_fresh.json
//
// ⚠️ 两阶段（node 已无法派生 node 子进程，wrangler 必须由 PowerShell 侧执行）：
//   1) node import_batch.mjs <id...>        → 生成 data/ingest_batch.sql（待执行）
//      PowerShell: wrangler d1 execute --remote --file data/ingest_batch.sql
//   2) node import_batch.mjs --geocode      → 生成 data/geocode_auto.sql（待执行）
//      PowerShell: wrangler d1 execute --remote --file data/geocode_auto.sql
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadGeo } from './geo.mjs';
import { fetchDetail, toRawRecord, fetchMobilePoster } from './cpp.mjs';
import { normalize } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const GEO_PATH = path.join(ROOT, 'public', 'data', 'geo_codes.json');
const SQL_PATH = path.join(__dirname, 'data', 'ingest_batch.sql');
const PENDING = path.join(__dirname, 'data', '_pending_ids.json');
const GEOCODE_SQL = path.join(__dirname, 'data', 'geocode_auto.sql');
const GEO_ONLY = process.argv.includes('--geocode');

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

// ---- 阶段 2：补坐标（读阶段 1 落下的 _pending_ids.json，生成 geocode_auto.sql）----
if (GEO_ONLY) {
  if (!fs.existsSync(PENDING)) { console.error('✗ 缺少 data/_pending_ids.json，请先跑阶段 1'); process.exit(1); }
  const pending = JSON.parse(fs.readFileSync(PENDING, 'utf8'));
  console.error(`待补坐标 ${pending.length} 条`);

  const loadEnv = () => {
    try {
      for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
      }
    } catch (e) {}
  };
  loadEnv();
  const AMAP_KEY = process.env.AMAP_WEB_KEY || '';
  const AMAP_SECRET = process.env.AMAP_WEB_SECRET || '';
  if (!AMAP_KEY) { console.error('（跳过补坐标：无 AMAP_WEB_KEY）'); process.exit(0); }

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
    // 单条带正确城市，避免 geocodeBatch 共享 city 参数导致省市区乱配
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

  const outSql = [];
  for (const r of pending) {
    const addr = [r.district, r.address].filter(Boolean).join(' ');
    const loc = await geocodeOne(addr, r.city);
    if (loc) {
      outSql.push(`UPDATE conventions SET longitude=${loc.longitude}, latitude=${loc.latitude} WHERE source='cpp' AND source_id='${r.source_id}';`);
      console.error(`  ✓ [${r.source_id}] ${r.city}/${addr} → ${loc.longitude},${loc.latitude}`);
    } else {
      console.error(`  ! 无法编码 [${r.source_id}]（${r.city}/${addr}）`);
    }
    await sleepGeo(200);
  }
  fs.writeFileSync(GEOCODE_SQL, outSql.join('\n'), 'utf8');
  console.error(`生成 ${outSql.length}/${pending.length} 条补坐标 SQL -> ${GEOCODE_SQL}`);
  process.exit(0);
}

// 导入 CPP 新活动。id 来源（优先级）：命令行参数 > data/ids.txt > data/cpp_fresh.json
// 例：node import_batch.mjs 7133      或     node import_batch.mjs（自动读 cpp_fresh.json）
function resolveIds() {
  const argv = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
  if (argv.length) return argv;
  const idsFile = path.join(__dirname, 'data', 'ids.txt');
  if (fs.existsSync(idsFile)) {
    const fromFile = fs.readFileSync(idsFile, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => /^\d+$/.test(s));
    if (fromFile.length) return fromFile;
  }
  const freshFile = path.join(__dirname, 'data', 'cpp_fresh.json');
  if (fs.existsSync(freshFile)) {
    const fromFresh = JSON.parse(fs.readFileSync(freshFile, 'utf8')).map((r) => String(r.source_id));
    if (fromFresh.length) return fromFresh;
  }
  console.error('✗ 未指定 id（命令行 / data/ids.txt / data/cpp_fresh.json 均为空）');
  process.exit(1);
}
const ids = resolveIds();
console.error(`待导入 id：${ids.join(', ')}`);
const records = [];
for (const eid of ids) {
  const html = await fetchDetail(eid);
  const rec = toRawRecord(eid, html, {});
  if (!rec || rec.__excluded) { console.error(`✗ [${eid}] 被排除或无标题，跳过`); continue; }
  const loc = locById[eid];
  if (!loc) { console.error(`✗ [${eid}] 在 cpp_now.json 找不到定位，跳过`); continue; }
  rec.province = loc.province || null;
  rec.city = loc.city || null;
  rec.district = loc.district || null;
  rec.review_status = 'approved';
  // 手机端海报优先：优先用列表的 appLogoPicUrl，缺失则抓 /m/e/<id>.do
  let mobile = loc.appLogoPicUrl
    ? (loc.appLogoPicUrl.startsWith('http') ? loc.appLogoPicUrl : 'https://imagecdn3.allcpp.cn/upload' + loc.appLogoPicUrl)
    : null;
  if (!mobile) { try { mobile = await fetchMobilePoster(eid); } catch {} }
  if (mobile) rec.poster_url = mobile;
  const c = normalize(rec, 'cpp');
  records.push(c);
  console.error(`✓ [${eid}] ${c.title} ｜ ${c.province}/${c.city}/${c.district} ｜ code=${c.province_code}/${c.city_code}/${c.district_code}`);
}

if (!records.length) { console.error('✗ 无有效记录，终止'); process.exit(1); }
fs.mkdirSync(path.dirname(SQL_PATH), { recursive: true });
fs.writeFileSync(SQL_PATH, records.map(toSql).join('\n'), 'utf8');
// 记住待补坐标的定位信息（下一阶段用；新插入的行必定无坐标，无需再查库）
fs.writeFileSync(path.join(__dirname, 'data', '_pending_ids.json'), JSON.stringify(
  records.map((c) => ({ source_id: c.source_id, city: c.city, district: c.district, address: c.address || c.venue })),
), 'utf8');
console.error(`生成 ${records.length} 条 SQL -> ${SQL_PATH}`);
process.exit(0);

