// 活动详情页（服务端渲染，SEO 用）：https://arkonlymap.pages.dev/event/<id>
// 爬虫可直接索引标题/日期/地点/描述 + JSON-LD Event 结构化数据；
// 真人访客浏览后可经「返回地图」深链回到首页弹窗视图。
import { getEvent } from '../../src/db-d1.js';

const SITE = 'https://arkonlymap.pages.dev';
const STATUS_TEXT = { upcoming: '即将举办', ongoing: '进行中', past: '已结束', unknown: '待定' };

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmtDate(ev) {
  if (ev.start_date && ev.end_date && ev.start_date !== ev.end_date)
    return `${ev.start_date} ~ ${ev.end_date}`;
  return ev.start_date || ev.end_date || '日期待定';
}
// JSON-LD 内联进 <script>，须转义 < 防止 </script> 提前闭合
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function renderPage(ev) {
  const status = STATUS_TEXT[ev.status] || '待定';
  const place = [ev.city, ev.province, ev.venue].filter(Boolean).join(' · ');
  const desc = ev.description
    || `${ev.title}——${fmtDate(ev)}${place ? '在' + place : ''}举办的明日方舟同好集会。`;
  const poster = ev.poster_url && /^https?:\/\//i.test(ev.poster_url) ? ev.poster_url : '';
  const tags = Array.isArray(ev.tags) ? ev.tags : [];
  const abroad = ev.country && ev.country !== '中国';

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ev.start_date || undefined,
    endDate: ev.end_date || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: ev.venue || ev.city || '待定',
      address: {
        '@type': 'PostalAddress',
        streetAddress: ev.address || undefined,
        addressLocality: ev.city || undefined,
        addressRegion: ev.province || undefined,
        addressCountry: ev.country_code || (abroad ? ev.country : 'CN'),
      },
    },
    image: poster ? [poster] : undefined,
    description: desc,
    organizer: ev.organizer ? { '@type': 'Organization', name: ev.organizer } : undefined,
    url: `${SITE}/event/${ev.id}`,
  };

  const row = (k, v) => `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`;
  const rows = [
    ev.city ? row('城市', ev.city + (abroad ? (ev.country ? ' / ' + ev.country : '') : (ev.province ? ' / ' + ev.province : ''))) : '',
    ev.venue ? row('场馆', ev.venue) : '',
    ev.address ? row('地址', ev.address) : '',
    ev.organizer ? row('主办', ev.organizer) : '',
    tags.length ? row('标签', tags.join('、')) : '',
  ].join('');

  const sourceLink = ev.source_url && /^https?:\/\//i.test(ev.source_url)
    ? `<a class="detail-link" href="${esc(ev.source_url)}" target="_blank" rel="noopener">查看官方信息 ↗</a>` : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(ev.title)} · 舟友同好集会地图</title>
  <meta name="description" content="${esc(desc.slice(0, 120))}" />
  <link rel="canonical" href="${SITE}/event/${ev.id}" />
  <meta name="theme-color" content="#070b16" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(ev.title)}" />
  <meta property="og:description" content="${esc(desc.slice(0, 120))}" />
  <meta property="og:url" content="${SITE}/event/${ev.id}" />
  ${poster ? `<meta property="og:image" content="${esc(poster)}" />` : ''}
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="stylesheet" href="/css/style.css" />
  <script type="application/ld+json">${jsonLd(ld)}</script>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <h1 class="brand-title"><a href="/" style="color:inherit;text-decoration:none">舟友同好集会地图</a></h1>
      <span class="brand-sub">ARKNIGHTS ONLY · 同好集会分布</span>
    </div>
    <div class="top-actions">
      <a class="ak-btn ak-btn--sm ak-btn--ghost" href="/?event=${ev.id}">返回地图</a>
    </div>
  </header>
  <main style="max-width:720px;margin:0 auto;padding:24px 16px 60px">
    <article>
      <h2 class="detail-title">${esc(ev.title)}</h2>
      <p class="detail-sub"><span class="badge badge--${esc(ev.status)}">${status}</span> · ${esc(fmtDate(ev))}</p>
      ${poster ? `<img class="detail-poster" src="${esc(poster)}" alt="${esc(ev.title)}海报" loading="lazy" onerror="this.style.display='none'"/>` : ''}
      <div class="detail-body">
        <div class="detail-rows">${rows}</div>
        <div class="detail-desc">${esc(ev.description)}</div>
        <div class="detail-actions">${sourceLink}</div>
      </div>
    </article>
  </main>
</body>
</html>`;
}

const NOT_FOUND = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>活动不存在 · 舟友同好集会地图</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <header class="topbar">
    <div class="brand"><h1 class="brand-title"><a href="/" style="color:inherit;text-decoration:none">舟友同好集会地图</a></h1></div>
  </header>
  <main style="max-width:720px;margin:0 auto;padding:40px 16px;text-align:center">
    <p class="list-empty">未找到该活动，可能已被合并或删除。</p>
    <p><a class="ak-btn ak-btn--sm" href="/">返回地图首页</a></p>
  </main>
</body>
</html>`;

export async function onRequestGet(context) {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response(NOT_FOUND, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  const ev = await getEvent(context.env.DB, id);
  // 与公开列表口径一致：merged/rejected 不对外
  if (!ev || !['approved', 'pending'].includes(ev.review_status)) {
    return new Response(NOT_FOUND, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return new Response(renderPage(ev), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // 活动数据不常变：CDN 缓存 15 分钟、浏览器 5 分钟，录入新活动后最多一刻钟全网可见
      'Cache-Control': 'public, max-age=300, s-maxage=900',
    },
  });
}
