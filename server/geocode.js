'use strict';
/**
 * 高德地理编码：地址 -> 经纬度
 * 使用「Web 服务」Key（AMAP_WEB_KEY），与前端 JS API Key 是不同类型。
 * 支持单条(geocode)与批量(geocodeBatch)两种模式；批量一次最多 10 个地址，
 * 可大幅降低 QPS 压力。若未配置 AMAP_WEB_KEY，则全部返回 null。
 * 文档：https://lbs.amap.com/api/webservice/guide/api/georegeo
 */
const crypto = require('crypto');

// Web 服务 Key（服务端 REST 用）。兼容旧变量名：优先 AMAP_WEB_KEY，其次 AMAP_REST_KEY。
const WEB_KEY = process.env.AMAP_WEB_KEY || process.env.AMAP_REST_KEY || '';
// 数字签名私钥（可选）。仅当你在控制台为该 Key 开启了「数字签名」时才需要填。
const WEB_SECRET = process.env.AMAP_WEB_SECRET || '';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildParams(obj) {
  const params = new URLSearchParams();
  Object.keys(obj).forEach((k) => {
    if (obj[k] != null && obj[k] !== '') params.set(k, obj[k]);
  });
  // 数字签名：sig = md5(按 key 升序拼接的参数串 + 私钥)
  if (WEB_SECRET) {
    const sorted = Object.keys(obj)
      .filter((k) => obj[k] != null && obj[k] !== '')
      .sort()
      .map((k) => `${k}=${obj[k]}`)
      .join('&');
    const sig = crypto.createHash('md5').update(sorted + WEB_SECRET).digest('hex');
    params.set('sig', sig);
  }
  return params;
}

function parseLocation(loc) {
  if (!loc) return null;
  const [lng, lat] = loc.split(',').map(Number);
  if (Number.isNaN(lng) || Number.isNaN(lat)) return null;
  return { longitude: lng, latitude: lat };
}

// 单条地理编码
async function geocode(address, city) {
  if (!WEB_KEY || !address) return null;
  const params = buildParams({ key: WEB_KEY, address, city, output: 'JSON' });
  const url = `https://restapi.amap.com/v3/geocode/geo?${params.toString()}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (data.status === '1' && data.geocodes && data.geocodes.length) {
    return parseLocation(data.geocodes[0].location);
  }
  return parseLocation(null);
}

/**
 * 批量地理编码（一次请求最多 10 个地址）
 * @param {Array<{address:string,city?:string}>} items
 * @param {{maxBatch?:number, retries?:number}} opts
 * @returns {Array<{longitude:number,latitude:number}|null>} 与输入顺序一一对应
 */
async function geocodeBatch(items, { maxBatch = 10, retries = 4 } = {}) {
  const out = new Array(items.length).fill(null);
  if (!WEB_KEY || !items.length) return out;
  for (let i = 0; i < items.length; i += maxBatch) {
    const chunk = items.slice(i, i + maxBatch);
    const addressStr = chunk.map((c) => c.address).join('|');
    let attempt = 0, success = false;
    while (!success && attempt <= retries) {
      try {
        const params = buildParams({ key: WEB_KEY, address: addressStr, batch: 'true', output: 'JSON' });
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
        const data = await resp.json();
        if (data.status === '1' && Array.isArray(data.geocodes)) {
          data.geocodes.forEach((g, idx) => {
            const pos = parseLocation(g && g.location);
            if (pos) out[i + idx] = pos;
          });
          success = true;
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED_THE_LIMIT/.test(data.info || '')) {
          // QPS 超限：退避后重试
          attempt++;
          await sleep(1500 * attempt);
        } else {
          // 其它错误（如地址无法解析）：放弃此批，不重试
          success = true;
        }
      } catch (e) {
        attempt++;
        await sleep(1500 * attempt);
      }
    }
    await sleep(500); // 批次间稍作间隔
  }
  return out;
}

module.exports = { geocode, geocodeBatch, hasKey: () => Boolean(WEB_KEY) };
