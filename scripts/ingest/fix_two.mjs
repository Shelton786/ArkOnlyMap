// 一次性修复脚本（2026-10-31）：
// ① id=326 长沙「杰斯顿的多索雷斯一日游」缺坐标（连地址都空）→ 先从 CPP 源站找回真实场馆，再高德补坐标
// ② id=37 南京「叁秋·探蕊寻香」district 疑错（鼓楼 vs 玄武）→ 用高德逆地理编码验证库内坐标实际所在区县
// 产物：data/fix_two_result.json（本脚本自己写盘，不走 shell 重定向）
import fs from 'fs';
import crypto from 'crypto';
import { fetchSearchList } from './cpp.mjs';

const env = {};
try {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch (e) {}
const KEY = env.AMAP_WEB_KEY || env.AMAP_REST_KEY || '';
const SECRET = env.AMAP_WEB_SECRET || '';

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
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
        const data = await resp.json();
        if (data.status === '1' && data.geocodes && data.geocodes.length) {
          const g = data.geocodes[0];
          const [lng, lat] = (g.location || '').split(',').map(Number);
          if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
            result = { lng, lat, level: g.level, formatted: g.formatted_address, adcode: g.adcode, used: addr };
            break;
          }
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) {
          attempt++; await sleep(1000 * attempt); continue;
        } else break;
      } catch (e) { attempt++; await sleep(1000 * attempt); }
    }
    if (result) return result;
  }
  return null;
}

async function regeo(lng, lat) {
  for (let attempt = 0; attempt <= 4; attempt++) {
    try {
      const params = buildParams({ key: KEY, location: `${lng},${lat}`, output: 'JSON', extensions: 'base' });
      const resp = await fetch(`https://restapi.amap.com/v3/geocode/regeo?${params.toString()}`);
      const data = await resp.json();
      if (data.status === '1' && data.regeocode) {
        const ac = data.regeocode.addressComponent || {};
        return {
          adcode: ac.adcode, province: ac.province, city: ac.city,
          district: ac.district, township: ac.township,
          formatted: data.regeocode.formatted_address,
        };
      }
      if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED/.test(data.info || '')) { await sleep(1000 * (attempt + 1)); continue; }
      return { error: data.info };
    } catch (e) { await sleep(1000 * (attempt + 1)); }
  }
  return { error: 'retry exhausted' };
}

const out = {};
// ① CPP 已全量排查（明日方舟 286 条含往期 + 多关键词）：无「杰斯顿的多索雷斯一日游」，
//    真实场馆不可考。按 fill_missing_coords.mjs 既有策略：无地址时用城市名兜底 geocode。
try {
  const geo = await geocodeOne('长沙', '长沙');
  out.geocode326 = geo ? { ...geo, note: '城市中心兜底（CPP 源站无此活动，真实场馆不可考）' } : { error: 'geocode failed' };
} catch (e) {
  out.geocode326 = { error: String(e.message || e) };
}

// ② 逆地理编码验证 id=37 坐标所在区县（库内 118.810761,32.08083）
out.regeo37 = await regeo(118.810761, 32.08083);

fs.writeFileSync('data/fix_two_result.json', JSON.stringify(out, null, 2), 'utf8');
console.log('done');
