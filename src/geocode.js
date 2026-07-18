/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * 高德地理编码：地址 -> 经纬度（Cloudflare Workers / Pages 适配版）
 * 使用「Web 服务」Key（AMAP_WEB_KEY），与前端 JS API Key 是不同类型。
 * 支持单条(geocode)与批量(geocodeBatch)；批量一次最多 10 个地址，降低 QPS 压力。
 * env 通过参数传入（来自 c.env），不依赖全局 process.env。
 *
 * 文档：https://lbs.amap.com/api/webservice/guide/api/georegeo
 */
import { createHash } from 'node:crypto';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildParams(obj, secret) {
  const params = new URLSearchParams();
  Object.keys(obj).forEach((k) => {
    if (obj[k] != null && obj[k] !== '') params.set(k, obj[k]);
  });
  // 数字签名：sig = md5(按 key 升序拼接的参数串 + 私钥)
  if (secret) {
    const sorted = Object.keys(obj)
      .filter((k) => obj[k] != null && obj[k] !== '')
      .sort()
      .map((k) => `${k}=${obj[k]}`)
      .join('&');
    const sig = createHash('md5').update(sorted + secret).digest('hex');
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
async function geocode(address, city, env = {}) {
  const key = env.AMAP_WEB_KEY || env.AMAP_REST_KEY || '';
  const secret = env.AMAP_WEB_SECRET || '';
  if (!key || !address) return null;
  const params = buildParams({ key, address, city, output: 'JSON' }, secret);
  const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
  const data = await resp.json();
  if (data.status === '1' && data.geocodes && data.geocodes.length) {
    return parseLocation(data.geocodes[0].location);
  }
  return null;
}

/**
 * 批量地理编码（一次请求最多 10 个地址）
 * @param {Array<{address:string,city?:string}>} items
 * @param {object} env 含 AMAP_WEB_KEY / AMAP_WEB_SECRET
 * @param {{maxBatch?:number, retries?:number}} opts
 * @returns {Array<{longitude:number,latitude:number}|null>} 与输入顺序一一对应
 */
async function geocodeBatch(items, env = {}, { maxBatch = 10, retries = 4 } = {}) {
  const key = env.AMAP_WEB_KEY || env.AMAP_REST_KEY || '';
  const secret = env.AMAP_WEB_SECRET || '';
  const out = new Array(items.length).fill(null);
  if (!key || !items.length) return out;
  for (let i = 0; i < items.length; i += maxBatch) {
    const chunk = items.slice(i, i + maxBatch);
    const addressStr = chunk.map((c) => c.address).join('|');
    let attempt = 0, success = false;
    while (!success && attempt <= retries) {
      try {
        const params = buildParams({ key, address: addressStr, batch: 'true', output: 'JSON' }, secret);
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?${params.toString()}`);
        const data = await resp.json();
        if (data.status === '1' && Array.isArray(data.geocodes)) {
          data.geocodes.forEach((g, idx) => {
            const pos = parseLocation(g && g.location);
            if (pos) out[i + idx] = pos;
          });
          success = true;
        } else if (data.infocode === '10044' || /CUQPS_HAS_EXCEEDED_THE_LIMIT/.test(data.info || '')) {
          attempt++;
          await sleep(1500 * attempt);
        } else {
          success = true; // 其它错误（地址无法解析）：放弃此批
        }
      } catch (e) {
        attempt++;
        await sleep(1500 * attempt);
      }
    }
    await sleep(500);
  }
  return out;
}

function hasKey(env = {}) {
  return Boolean(env.AMAP_WEB_KEY || env.AMAP_REST_KEY);
}

export { geocode, geocodeBatch, hasKey };
