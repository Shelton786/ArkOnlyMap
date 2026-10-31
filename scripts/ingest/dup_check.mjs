// 新活动查重：拿 cpp_fresh.json 逐条到全库里找「标题相似 + 日期差≤3天」的疑似重复
// 用于识别「已有活动在 CPP 上换了个新 id 的马甲」（如南京 7101 实为库里 id=91）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractJsonArray } from './d1out.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, 'data');

const db = extractJsonArray(fs.readFileSync(path.join(DATA, 'db_all_raw.txt'), 'utf8'))[0].results;
const fresh = JSON.parse(fs.readFileSync(path.join(DATA, 'cpp_fresh.json'), 'utf8'));

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[\s·・:：,.，。、\-—_|｜0-9.【】「」（）()!！?？x×]/g, '')
    .replace(/only/g, '');
}
const days = (a, b) => Math.abs((new Date(a) - new Date(b)) / 86400000);

console.log(`全库 ${db.length} 条，待查 ${fresh.length} 条新活动\n`);
for (const f of fresh) {
  const nf = norm(f.title);
  const hits = db.filter((r) => {
    const d = days(r.start_date, f.startDate);
    if (d > 3) return false;
    const nr = norm(r.title);
    return nr.includes(nf.slice(0, 6)) || nf.includes(nr.slice(0, 6));
  });
  console.log(`[${f.source_id}] ${f.title} (${f.startDate}, ${f.city})`);
  if (hits.length) {
    for (const h of hits) {
      const sameCity = norm(h.city) === norm(f.city);
      console.log(`   ${sameCity ? '⚠ 同城疑似重复' : '· 异地（大概率只是撞名/撞期）'}：[${h.source}/${h.source_id}] ${h.title} | ${h.city} | ${h.start_date}`);
    }
  } else {
    console.log('   ✓ 库内无相近标题/日期，应为全新活动');
  }
}
