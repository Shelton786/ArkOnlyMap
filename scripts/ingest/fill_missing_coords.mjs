import fs from 'fs';
import crypto from 'crypto';

const env = {};
try {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch (e) {}
const KEY = env.AMAP_WEB_KEY || env.AMAP_REST_KEY || '';
const SECRET = env.AMAP_WEB_SECRET || '';
if (!KEY) { console.error('缺少 AMAP_WEB_KEY'); process.exit(1); }

function buildParams(obj) {
  const p = new URLSearchParams();
  Object.keys(obj).forEach(k => { if (obj[k] != null && obj[k] !== '') p.set(k, obj[k]); });
  if (SECRET) {
    const sorted = Object.keys(obj).filter(k => obj[k] != null && obj[k] !== '')
      .sort().map(k => `${k}=${obj[k]}`).join('&');
    p.set('sig', crypto.createHash('md5').update(sorted + SECRET).digest('hex'));
  }
  return p;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function geocodeOne(address, city) {
  const strategies = [address, (city ? city + ' ' : '') + (address || ''), city].filter(Boolean);
  for (const addr of strategies) {
    let attempt = 0, result = null;
    while (attempt <= 4) {
      try {
        const params = buildParams({ key: KEY, address: addr, city: city || '', output: 'JSON' });
        const url = `https://restapi.amap.com/v3/geocode/geo?${params.toString()}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.status === '1' && data.geocodes && data.geocodes.length) {
          const g = data.geocodes[0];
          const [lng, lat] = (g.location || '').split(',').map(Number);
          if (!Number.isNaN(lng) && !Number.isNaN(lat)) { result = { lng, lat }; break; }
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) {
          attempt++; await sleep(1000 * attempt); continue;
        } else break;
      } catch (e) { attempt++; await sleep(1000 * attempt); }
    }
    if (result) return result;
  }
  return null;
}

const rows = JSON.parse(fs.readFileSync('scripts/ingest/data/all_events.json', 'utf8'));
const miss = rows.filter(r => r.longitude == null || r.latitude == null);

let sql = '-- 补充缺坐标活动：无地址用「城市+区」编码，有地址用完整地址，兜底城市中心\n';
let ok = 0, fail = [];
for (const r of miss) {
  const city = r.city || '';
  const addr = r.address || r.district || city;
  let res = await geocodeOne(addr, city);
  if (!res) { fail.push(r.id); continue; }
  sql += `UPDATE conventions SET longitude=${res.lng}, latitude=${res.lat} WHERE id=${r.id};\n`;
  ok++;
}
fs.writeFileSync('scripts/ingest/data/fill_missing_coords.sql', sql, 'utf8');
console.log(`补坐标成功: ${ok} 条，失败: ${fail.length} 条 -> ${fail}`);
