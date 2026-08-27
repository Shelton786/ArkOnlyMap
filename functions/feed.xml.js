// RSS 2.0 订阅源：新收录的未结束活动（按收录时间倒序，30 条）
// 地址：https://arkonlymap.pages.dev/feed.xml
import { listFeedEvents } from '../src/db-d1.js';

const SITE = 'https://arkonlymap.pages.dev';

function xesc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function fmtDate(ev) {
  if (ev.start_date && ev.end_date && ev.start_date !== ev.end_date)
    return `${ev.start_date} ~ ${ev.end_date}`;
  return ev.start_date || ev.end_date || '日期待定';
}

export async function onRequestGet(context) {
  const events = await listFeedEvents(context.env.DB, 30);
  const items = events.map((ev) => {
    const place = [ev.province, ev.city, ev.venue].filter(Boolean).join(' · ');
    const desc = [`📅 ${fmtDate(ev)}`, place && `📍 ${place}`, ev.description].filter(Boolean).join('\n');
    return `    <item>
      <title>${xesc(ev.title)}</title>
      <link>${SITE}/?event=${ev.id}</link>
      <guid isPermaLink="false">event-${ev.id}</guid>
      <pubDate>${new Date(ev.created_at + 'Z').toUTCString()}</pubDate>
      <description>${xesc(desc)}</description>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>舟友同好集会地图</title>
    <link>${SITE}/</link>
    <description>明日方舟 ONLY 漫展分布地图 —— 新收录的同好集会动态</description>
    <language>zh-CN</language>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
