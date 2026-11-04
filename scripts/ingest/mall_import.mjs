// 商城页面数据入库：候选 71 条分流处理
//   ① 有 B站 source_id（扫描命中）→ 用 bili_scan.json 详情数据（坐标/简介/海报详情接口全有）
//   ② 无 source_id → 商城页面数据 + 高德地理编码补坐标 + mall-<hash> 幂等键
// 两阶段：node 生成 SQL → PowerShell 跑 wrangler
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');
const SQL_PATH = path.join(DATA, 'mall_import.sql');

const reviewStatus = process.argv.includes('--pending') ? 'pending' : 'approved';

const COLS = ['title','start_date','end_date','province','city','district','venue','address',
  'longitude','latitude','description','organizer','source_url','poster_url','verified','tags',
  'country','country_code','province_code','city_code','district_code','source','source_id','imported_at','review_status','submitted_by'];

function sqlLit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

// ---------- 归一化工具（与 _past_todo.mjs 一致） ----------
function normTitle(t) {
  return (t || '')
    .toLowerCase()
    .replace(/[\s\-_—－·・.。,，!！?？:：;；'"“”‘’()（）\[\]【】]/g, '')
    .replace(/arknights|明日方舟|终末地/g, '')
    .replace(/only|同人|展|only1|第一届|第1届/g, '')
    .replace(/\d+(\.\d+)?/g, '');
}
function normCity(c) {
  // 注意：必须用后缀 alternation，不能用字符类——字符类 [..维吾尔..] 会误删“尔”（哈尔滨→哈滨）
  return (c || '').replace(/(特别行政区|壮族回族自治区|维吾尔自治区|自治区|省|市)$/, '');
}
function decodeEntities(s) {
  if (!s) return s;
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function daysDiff(a, b) {
  if (!a || !b) return 999;
  return Math.abs((new Date(a) - new Date(b)) / 86400000);
}

// ---------- 日期区间解析 ----------
function parseMallDate(dateStr) {
  // "2026.11.07" | "2026.02.10 - 04.26" | "2024.01.27 - 01.28"
  const s = dateStr.replace(/\s+/g, ' ').trim();
  const range = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s*-\s*(?:(\d{4})\.)?(\d{2})\.(\d{2})$/);
  if (range) {
    const start = `${range[1]}-${range[2]}-${range[3]}`;
    const endY = range[4] || range[1];
    const end = `${endY}-${range[5]}-${range[6]}`;
    return { start, end };
  }
  const single = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (single) return { start: `${single[1]}-${single[2]}-${single[3]}`, end: null };
  return null;
}

// ---------- 省映射：从库内学 + 硬编码兜底 ----------
const dbRows = extractJsonArray(fs.readFileSync(path.join(DATA, 'db_all_bili.txt'), 'utf8'))[0].results;
const cityToProvince = new Map();
for (const r of dbRows) {
  if (r.city && r.province) cityToProvince.set(normCity(r.city), r.province);
}
const HARDCODE = {
  '台州': '浙江', '温州': '浙江', '嘉兴': '浙江', '无锡': '江苏', '镇江': '江苏', '潍坊': '山东',
  '赣州': '江西', '芜湖': '安徽', '汕头': '广东', '淄博': '山东', '柳州': '广西', '洛阳': '河南',
  '襄阳': '湖北', '株洲': '湖南', '绵阳': '四川', '德阳': '四川', '株州': '湖南', '金华': '浙江',
  '绍兴': '浙江', '台洲': '浙江', '泉州': '福建', '漳州': '福建', '莆田': '福建', '宜昌': '湖北',
  '衡阳': '湖南', '柳州地区': '广西', '桂林': '广西', '三亚': '海南', '儋州': '海南',
};
function provinceOf(city) {
  const nc = normCity(city);
  return cityToProvince.get(nc) || HARDCODE[nc] || null;
}

// ---------- 高德地理编码（单条带城市，memory 铁律） ----------
const loadEnv = () => {
  try {
    for (const line of fs.readFileSync(path.join(__dirname, '..', '..', '.env'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  } catch (e) {}
};
loadEnv();
const AMAP_KEY = process.env.AMAP_WEB_KEY || '';
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
  if (!AMAP_KEY) return null;
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
          break; // status OK 但无结果 → 换下一个策略（城市兜底）
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) {
          attempt++; await sleepGeo(1000 * attempt); continue; // QPS 超限 → 重试本策略
        } else break; // 其他错误（ENGINE_RESPONSE_DATA_ERROR 等）→ 换策略
      } catch (e) { attempt++; await sleepGeo(1000 * attempt); }
    }
  }
  return null;
}

// ---------- 数据加载 ----------
const mallItems = JSON.parse(fs.readFileSync(path.join(DATA, '_mall_items_posters.json'), 'utf8'));
const mallByTitle = new Map();
for (const m of mallItems) {
  m.d = m.date.replace(/\./g, '-').split(' - ')[0];
  mallByTitle.set(m.title, m);
}
const candidates = JSON.parse(fs.readFileSync(path.join(DATA, 'past_candidates.json'), 'utf8'));
let scanHits = [];
try {
  scanHits = JSON.parse(fs.readFileSync(path.join(DATA, 'bili_scan.json'), 'utf8')).records || [];
} catch {}
console.error(`候选 ${candidates.length} 条，扫描命中池 ${scanHits.length} 条`);

function findScan(title, date) {
  for (const s of scanHits) {
    if (normTitle(s.title) === normTitle(title) && daysDiff(s.startDate, date) <= 3) return s;
  }
  return null;
}

// ---------- 主流程 ----------
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
const rows = [];
const noGeo = [];
let fromScan = 0, fromMall = 0;

for (const c of candidates) {
  const d = parseMallDate(c.date);
  if (!d) { console.error(`✗ 日期解析失败：${c.date} ${c.title}`); continue; }
  const scan = findScan(c.title, d.start);
  let row;
  if (scan) {
    // ① 有 ID：用扫描详情数据
    fromScan++;
    const singleDay = !scan.endDate || scan.endDate === scan.startDate;
    row = {
      title: scan.title || c.title,
      start_date: scan.startDate || d.start,
      end_date: singleDay ? null : scan.endDate,
      province: scan.province || provinceOf(c.city),
      city: scan.city || normCity(c.city),
      district: scan.district || null,
      venue: scan.venue || c.venue || null,
      address: scan.address || c.venue || null,
      longitude: scan.longitude != null ? Number(scan.longitude) : null,
      latitude: scan.latitude != null ? Number(scan.latitude) : null,
      description: scan.description || null,
      organizer: scan.organizer || null,
      source_url: scan.url || null,
      poster_url: scan.poster_url || c.posterRemote || null,
      verified: 1,
      tags: scan.tags && scan.tags.length ? JSON.stringify(scan.tags) : null,
      country: '中国', country_code: 'CN', province_code: null, city_code: null, district_code: null,
      source: 'bilibili', source_id: String(scan.source_id),
      imported_at: now, review_status: reviewStatus, submitted_by: null,
    };
  } else {
    // ② 无 ID：商城数据 + 高德坐标
    fromMall++;
    const city = normCity(c.city);
    const mallItem = mallByTitle.get(c.title);
    const posterFile = path.basename(c.poster || mallItem?.poster || '').replace(/@[^@]*$/, '');
    const hash = posterFile.replace(/\.[^.]+$/, '');
    const geo = await geocodeOne(c.venue, city);
    if (!geo) noGeo.push(`${c.date} ${c.city} ${c.title} (${c.venue})`);
    row = {
      title: decodeEntities(c.title),
      start_date: d.start,
      end_date: d.end,
      province: provinceOf(city),
      city: city,
      district: null,
      venue: decodeEntities(c.venue) || null,
      address: decodeEntities(c.venue) || null,
      longitude: geo ? geo.longitude : null,
      latitude: geo ? geo.latitude : null,
      description: null,
      organizer: null,
      source_url: null,
      poster_url: (mallItem && mallItem.posterRemote) || c.posterRemote || null,
      verified: 1,
      tags: null,
      country: '中国', country_code: 'CN', province_code: null, city_code: null, district_code: null,
      source: 'bilibili', source_id: `mall-${hash}`,
      imported_at: now, review_status: reviewStatus, submitted_by: null,
    };
    await sleepGeo(250); // 高德 QPS 退避
  }
  rows.push(row);
}

if (!rows.length) { console.error('✗ 无有效记录，终止'); process.exit(1); }

const stmts = rows.map((r) => {
  const vals = COLS.map((c) => sqlLit(r[c]));
  const update = COLS.filter((c) => !['source', 'source_id', 'submitted_by'].includes(c))
    .map((c) => `${c}=excluded.${c}`).join(', ');
  return `INSERT INTO conventions (${COLS.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT(source, source_id) DO UPDATE SET ${update};`;
});

fs.writeFileSync(SQL_PATH, stmts.join('\n'), 'utf8');

console.error(`\n待导入 ${rows.length} 条（review_status=${reviewStatus}）：B站详情 ${fromScan}，商城页面 ${fromMall}`);
console.error(`坐标缺失 ${noGeo.length} 条:`);
for (const x of noGeo) console.error('  ✗', x);
rows.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
console.error('\n清单:');
for (const r of rows) {
  console.error(`  [${r.source_id}] ${r.start_date}${r.end_date ? '~' + r.end_date : ''} ${r.city} ${r.title} ｜ 坐标 ${r.longitude != null ? '有' : '无'} ｜ 海报 ${r.poster_url ? '有' : '无'}`);
}
console.error(`\n生成 SQL -> ${SQL_PATH}`);
console.error('下一步（PowerShell）：& node_modules/.bin/wrangler.cmd d1 execute arknights-only-map --remote --file scripts/ingest/data/mall_import.sql');
