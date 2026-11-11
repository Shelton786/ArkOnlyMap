// 动态 sitemap：首页 + 关于页 + 全部公开活动详情页（/event/<id>）
// 地址：https://arkonlymap.pages.dev/sitemap.xml
import { listEvents } from '../src/db-d1.js';
import { edgeCache } from '../src/edge-cache.js';

const SITE = 'https://arkonlymap.pages.dev';

// updated_at 形如 '2026-10-31 09:13:14'（UTC）→ W3C Datetime '2026-10-31T09:13:14Z'
function toW3c(s) {
  const m = /(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(String(s || ''));
  return m ? `${m[1]}T${m[2]}Z` : null;
}

export async function onRequestGet(context) {
  // 爬虫每次抓取都会触发 listEvents 全量查库（~1200 行读）；Pages 不自动缓存
  // 动态响应，仅设 max-age 无效，必须显式 Cache API。TTL 1 小时，键去掉 query。
  const reqUrl = new URL(context.request.url);
  return edgeCache(reqUrl.origin + reqUrl.pathname, 3600, async () => {
    // 单次查询上限已收敛到 500，分页拉全量：活动数超过 1000 后，
    // 原来的单次 limit=1000 会静默漏掉后半部分，导致新活动不被搜索引擎收录。
    const PAGE = 500;
    const items = [];
    for (let page = 1; page <= 20; page++) {
      const batch = await listEvents(context.env.DB, { limit: PAGE, page, review: 'public' });
      const rows = batch.items || [];
      items.push(...rows);
      if (rows.length < PAGE || items.length >= (batch.total || 0)) break;
    }
    const now = new Date().toISOString().slice(0, 10);

    const urls = [
      { loc: `${SITE}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: `${SITE}/about.html`, changefreq: 'monthly', priority: '0.3' },
      ...items.map((ev) => ({
        loc: `${SITE}/event/${ev.id}`,
        lastmod: toW3c(ev.updated_at) || toW3c(ev.created_at) || now,
        changefreq: 'weekly',
        priority: '0.6',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  });
}
