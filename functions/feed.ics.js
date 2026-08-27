// iCalendar 订阅源：未结束的活动写入日历（可按日期直接订阅）
// 地址：https://arkonlymap.pages.dev/feed.ics
import { listFeedEvents } from '../../src/db-d1.js';

const SITE = 'https://arkonlymap.pages.dev';

// ICS 文本转义：反斜杠、逗号、分号、换行
function iesc(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n');
}

// YYYY-MM-DD -> YYYYMMDD；end 为 ICS 的排他结束日（需 +1 天）
function dCompact(s) { return s ? s.replace(/-/g, '') : null; }
function nextDay(s) {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function onRequestGet(context) {
  const events = await listFeedEvents(context.env.DB, 100);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const vevents = events.filter((e) => e.start_date).map((ev) => [
    'BEGIN:VEVENT',
    `UID:event-${ev.id}@arkonlymap.pages.dev`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dCompact(ev.start_date)}`,
    `DTEND;VALUE=DATE:${nextDay(ev.end_date || ev.start_date)}`,
    `SUMMARY:${iesc(ev.title)}`,
    `LOCATION:${iesc([ev.province, ev.city, ev.venue, ev.address].filter(Boolean).join(' '))}`,
    `URL:${SITE}/?event=${ev.id}`,
    ev.description ? `DESCRIPTION:${iesc(ev.description)}` : null,
    'END:VEVENT',
  ].filter(Boolean).join('\r\n')).join('\r\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ArkOnlyMap//舟友同好集会地图//CN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:舟友同好集会地图',
    vevents, 'END:VCALENDAR'].join('\r\n');
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
