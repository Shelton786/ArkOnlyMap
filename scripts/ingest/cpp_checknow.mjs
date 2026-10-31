// 抓 CPP 当前「未来」明日方舟活动，写 data/cpp_now.json，不写库。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchSearchList, toRawRecordFromList } from './cpp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyword = process.argv[2] || '明日方舟';
const items = await fetchSearchList(keyword, {
  allTime: false,
  onPage: (p, n, total) => console.error(`  · 第 ${p} 页 ${n} 条（累计 ${total}）`),
});
const recs = [];
let excluded = 0;
for (const it of items) {
  const r = toRawRecordFromList(it, 'pending');
  if (r && r.__excluded) { excluded++; continue; }
  recs.push({
    source_id: r.source_id,
    title: r.title,
    city: r.city,
    province: r.province,
    district: r.district,
    startDate: r.startDate,
    endDate: r.endDate,
    venue: r.venue,
    url: r.source_url,
    appLogoPicUrl: it.appLogoPicUrl || null, // 手机端海报（优先用，免额外请求）
  });
}
console.error(`[cpp] 未来活动 ${items.length} 条，过滤综合展/已取消 ${excluded}，保留 ${recs.length} 条`);
const json = JSON.stringify(recs, null, 2);
// 自己落盘（不经 shell 重定向），避免 stdout/stderr 混淆与编码问题
fs.writeFileSync(path.join(__dirname, 'data', 'cpp_now.json'), json, 'utf8');
process.stdout.write(json);
