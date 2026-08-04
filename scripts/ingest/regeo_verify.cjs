const { execFileSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const NODE = 'C:/Users/13984/.workbuddy/binaries/node/versions/22.22.2/node.exe';
const WR = 'node_modules/wrangler/bin/wrangler.js';

// 读取 .env 里的 AMAP_WEB_KEY / SECRET
const env = {};
try {
  const txt = fs.readFileSync('.env', 'utf8');
  for (const line of txt.split('\n')) {
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

async function regeo(lng, lat) {
  const params = buildParams({ key: KEY, location: `${lng},${lat}`, output: 'JSON', extensions: 'base', poi: 0 });
  const url = `https://restapi.amap.com/v3/geocode/regeo?${params.toString()}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.status === '1' && data.regeocode && data.regeocode.addressComponent) {
    const c = data.regeocode.addressComponent;
    return { province: c.province, city: c.city, district: c.district, adcode: c.adcode };
  }
  return null;
}

// 加载导出
async function main() {
  const rows = JSON.parse(fs.readFileSync('scripts/ingest/data/all_events.json', 'utf8'));
  const todo = rows.filter(r => r.longitude != null && r.latitude != null);

  const out = [];
  let i = 0;
  for (const r of todo) {
    let res = null;
    for (let attempt = 0; attempt <= 3; attempt++) {
      try { res = await regeo(r.longitude, r.latitude); break; }
      catch (e) { await sleep(800 * (attempt + 1)); }
    }
    out.push({ id: r.id, title: r.title, recorded_province: r.province, recorded_city: r.city,
               recorded_district: r.district, lng: r.longitude, lat: r.latitude,
               rgeo: res });
    i++;
    if (i % 20 === 0) console.error(`已处理 ${i}/${todo.length}`);
    await sleep(120);
  }

  fs.writeFileSync('scripts/ingest/data/regeo_result.json', JSON.stringify(out, null, 2), 'utf8');

  // 统计省份不一致
  const str = (v) => Array.isArray(v) ? (v[0] || '') : (v == null ? '' : String(v));
  let provMismatch = 0, cityMismatch = 0;
  const examples = [];
  for (const o of out) {
    if (!o.rgeo) continue;
    const rec = (o.recorded_province || '').replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
    const rg = str(o.rgeo.province).replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
    if (rec && rg && rec !== rg) { provMismatch++; if (examples.length < 25) examples.push(o); }
    else {
      const rc = (o.recorded_city || '').replace(/市|地区|自治州|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
      const rgc = str(o.rgeo.city).replace(/市|地区|自治州|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
      if (rc && rgc && rc !== rgc) cityMismatch++;
    }
  }
  console.log(`反向地理编码完成: ${out.length} 条`);
  console.log(`省份不一致(坐标落在错误省份): ${provMismatch}`);
  console.log(`城市不一致(坐标省份对但城市标错): ${cityMismatch}`);
  console.log('--- 省份不一致样例 ---');
  for (const o of examples) {
    console.log(`  #${o.id} 记录省=${o.recorded_province} 记录市=${o.recorded_city} | 实际省=${str(o.rgeo.province)} 实际市=${str(o.rgeo.city)} 实际区=${str(o.rgeo.district)}`);
    console.log(`      标题=${o.title} coord=(${o.lng},${o.lat})`);
  }
  // 额外：列出全部城市不一致
  console.log('--- 全部城市不一致(坐标省份对但城市标错)，供修正城市标签 ---');
  for (const o of out) {
    if (!o.rgeo) continue;
    const rec = (o.recorded_province || '').replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
    const rg = str(o.rgeo.province).replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
    if (rec && rg && rec === rg) {
      const rc = (o.recorded_city || '').replace(/市|地区|自治州|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
      const rgc = str(o.rgeo.city).replace(/市|地区|自治州|壮族自治区|回族自治区|维吾尔自治区|自治区/, '');
      if (rc && rgc && rc !== rgc) {
        console.log(`  #${o.id} 记录市=${o.recorded_city} -> 实际市=${str(o.rgeo.city)} (记录省=${o.recorded_province}) | ${o.title}`);
      }
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
