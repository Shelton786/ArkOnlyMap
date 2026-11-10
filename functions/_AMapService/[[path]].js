/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * 高德 JS API 2.0 安全密钥代理（官方推荐「代理转发」模式）。
 * 前端只设 window._AMapSecurityConfig = { serviceHost: '<本站>/_AMapService' }，
 * JS API 的服务类请求（地理编码/输入提示）会打到本代理；
 * 安全密钥 jscode 由服务端附加后转发 restapi.amap.com，绝不下发浏览器。
 * 文档：https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode
 *
 * 安全约束：
 *   - 仅放行当前已加载插件（AMap.Geocoder / AMap.AutoComplete）用到的端点，
 *     防止被当成任意高德 REST 开放代理刷配额。新增插件时在此登记对应路径。
 *   - 仅 GET；不转发任何客户端请求头/Cookie；响应 no-store。
 */
'use strict';

const ALLOWED_PATHS = new Set([
  '/v3/geocode/geo',          // Geocoder 正向地理编码（提交表单按地址查坐标）
  '/v3/geocode/regeo',        // Geocoder 逆地理编码
  '/v3/assistant/inputtips',  // AutoComplete 地址联想
]);

function jsonError(status, message) {
  return new Response(JSON.stringify({ status: '0', info: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return jsonError(405, 'METHOD_NOT_ALLOWED');

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/_AMapService/, '');

  // SDK 遥测（/v3/log/*）无需转发上游：本地回 JSONP ack，避免 404 噪声，
  // 也不把 jscode 发给日志端点。callback 严格校验防 XSS。
  if (path.startsWith('/v3/log/')) {
    const cb = url.searchParams.get('callback');
    const body = cb && /^[\w.$]+$/.test(cb) ? `${cb}({"status":"1"})` : '{"status":"1"}';
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (!ALLOWED_PATHS.has(path)) return jsonError(404, 'NOT_FOUND');

  const jscode = env.AMAP_SECURITY_CODE;
  if (!jscode) return jsonError(503, 'SECURITY_CODE_NOT_CONFIGURED');

  const target = new URL('https://restapi.amap.com' + path + url.search);
  target.searchParams.set('jscode', jscode);

  try {
    const upstream = await fetch(target.toString());
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return jsonError(502, 'UPSTREAM_FETCH_FAILED');
  }
}