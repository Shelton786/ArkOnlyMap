import fs from 'fs';
import crypto from 'crypto';
import { loadGeo, resolveCode, codeToNames } from './geo.mjs';

// ---- 读取 .env 高德密钥 ----
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
const strip = t => (t || '').replace(/省|市|地区|自治州|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
const asStr = v => Array.isArray(v) ? (v[0] || '') : (v == null ? '' : String(v));

// ---- 单条正向地理编码（带 city 提示），含 QPS 退避重试 + 多级兜底地址 ----
async function geocodeOne(address, city) {
  // 三级地址策略：区+地址 → 仅地址 → 仅城市（城市中心兜底）
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
          if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
            result = { longitude: lng, latitude: lat,
                       province: g.province, city: g.city, district: g.district };
            break;
          }
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) {
          attempt++; await sleep(1000 * attempt); continue; // 限流退避重试
        } else {
          break; // 地址无法解析：换下一级策略
        }
      } catch (e) {
        attempt++; await sleep(1000 * attempt);
      }
    }
    if (result) return result;
  }
  return null;
}

// ---- 加载数据 ----
loadGeo(JSON.parse(fs.readFileSync('public/data/geo_codes.json', 'utf8')));
const rows = JSON.parse(fs.readFileSync('scripts/ingest/data/all_events.json', 'utf8'));
const regeo = JSON.parse(fs.readFileSync('scripts/ingest/data/regeo_result.json', 'utf8'));
const regeoById = {};
for (const o of regeo) regeoById[o.id] = o;

const coordUpdates = [];   // {id, lng, lat}  坐标错位，需重编码
const labelUpdates = [];   // {id, province, city, district, province_code, city_code, district_code} 城市标错
const manual = [];         // 重编码后省份仍不符，需人工

for (const r of rows) {
  const o = regeoById[r.id];
  if (!o || !o.rgeo) continue;
  const recProv = strip(r.province);
  const rgProv = strip(asStr(o.rgeo.province));
  const recCity = strip(r.city);
  const rgCity = strip(asStr(o.rgeo.city));

  if (recProv && rgProv && recProv !== rgProv) {
    // 坐标落在错误省份：用记录的正确城市重新编码
    const fullAddr = [r.district, r.address].filter(Boolean).join(' ');
    const hintCity = r.city;
    let res = null;
    for (let attempt = 0; attempt <= 3; attempt++) {
      try { res = await geocodeOne(fullAddr, hintCity); if (res) break; }
      catch (e) { await sleep(800 * (attempt + 1)); }
      await sleep(400);
    }
    if (!res) { manual.push({ id: r.id, reason: '重编码无结果', title: r.title, city: r.city }); continue; }
    const gotProv = strip(res.province);
    if (gotProv && recProv && gotProv !== recProv) {
      manual.push({ id: r.id, reason: `重编码后仍落${gotProv}(期望${recProv})`, title: r.title,
                    city: r.city, got: [res.longitude, res.latitude] });
      continue;
    }
    coordUpdates.push({ id: r.id, lng: res.longitude, lat: res.latitude });
  } else if (recCity && rgCity && recCity !== rgCity) {
    // 省份对但城市名标错：坐标正确，仅修正城市/区县名称与行政编码
    const cityName = asStr(o.rgeo.city);
    const districtName = asStr(o.rgeo.district);
    const codes = resolveCode({ province: r.province, city: cityName, district: districtName });
    labelUpdates.push({ id: r.id, province: r.province, city: cityName, district: districtName,
                        province_code: codes.province_code, city_code: codes.city_code,
                        district_code: codes.district_code });
  }
}

// ---- 生成 SQL ----
let sql = '-- 坐标修复：135 条错位活动用单条 geocode(带城市) 重编码；4 条城市标错仅修正名称/编码\n';
sql += `-- 生成于 2026-08-04，基于 regeo_result.json 校验\n`;
for (const c of coordUpdates) {
  sql += `UPDATE conventions SET longitude=${c.lng}, latitude=${c.lat} WHERE id=${c.id};\n`;
}
for (const l of labelUpdates) {
  const city = (l.city || '').replace(/'/g, "''");
  const dist = (l.district || '').replace(/'/g, "''");
  const prov = (l.province || '').replace(/'/g, "''");
  sql += `UPDATE conventions SET province='${prov}', city='${city}', district='${dist}', ` +
         `province_code=${l.province_code || 'NULL'}, city_code=${l.city_code || 'NULL'}, ` +
         `district_code=${l.district_code || 'NULL'} WHERE id=${l.id};\n`;
}
fs.writeFileSync('scripts/ingest/data/fix_coords.sql', sql, 'utf8');
fs.writeFileSync('scripts/ingest/data/fix_manual.json', JSON.stringify(manual, null, 2), 'utf8');

console.log(`坐标重编码更新: ${coordUpdates.length} 条`);
console.log(`城市名/编码修正: ${labelUpdates.length} 条`);
console.log(`需人工处理: ${manual.length} 条`);
for (const m of manual) console.log(`  #${m.id} ${m.reason} | ${m.title} (记录城市 ${m.city})`);
