// 修正 cpp 来源活动「日期早一天」的入库错误（根因：msToDate 用 UTC 而非北京时间）。
//
// 做法（精确、按 source_id、只改日期列，不动 review_status/坐标等）：
//   1) 用 cpp 列表接口（关键词 明日方舟 / 终末地，全部时间）重建 eid→{start,end} 映射，
//      日期用修正后的北京时间转换（msToDate，已修复）。
//   2) 拉取线上 D1 全部 source='cpp' 记录（id, source_id, start_date, end_date）。
//   3) 逐条：命中映射 → 用映射日期；未命中 → 抓详情页取 sDate/eDate（字符串，无时区问题）；
//      详情也失败 → 兜底 stored + 1 天（搜索路径记录统一 -1，安全）。
//   4) 仅当目标日期与现有不同才生成 UPDATE；默认 dry-run 打印汇总与 SQL，--apply 才写库。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { fetchSearchList, msToDate, fetchDetail, parseEventParam } from './cpp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DB = 'arknights-only-map';
const WRANGLER = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const NODE = process.execPath;
const APPLY = process.argv.includes('--apply');

const KEYWORDS = ['明日方舟', '终末地'];

function addDays(s, n) {
  if (!s) return s;
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return s;
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function esc(v) { return v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`; }

function extractRows(raw) {
  const i = raw.indexOf('[');
  if (i < 0) return [];
  const d = JSON.parse(raw.slice(i));
  let arr = d[0] && d[0].results;
  if (Array.isArray(arr)) {
    if (arr.length && Array.isArray(arr[0] && arr[0].results)) return arr[0].results;
    return arr;
  }
  return [];
}
function runWrangler(args) {
  return execFileSync(NODE, [WRANGLER, 'd1', 'execute', DB, ...args], { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
}

async function main() {
  // 1) 重建 eid→日期 映射（北京时间）
  const map = new Map();
  for (const kw of KEYWORDS) {
    console.log(`[fix-dates] 拉取 cpp 列表 "${kw}" (all-time) ...`);
    const list = await fetchSearchList(kw, { allTime: true, pageSize: 50, maxPages: 60 });
    for (const it of list) {
      const eid = String(it.id);
      const start = msToDate(it.enterTime);
      const end = msToDate(it.endTime);
      if (start) map.set(eid, { start, end });
    }
    console.log(`   · 该关键词 ${list.length} 条，映射累计 ${map.size} 条`);
  }

  // 2) 拉取线上 cpp 记录
  console.log('[fix-dates] 读取线上 source=cpp 记录 ...');
  const raw = runWrangler(['--remote', '--command',
    `SELECT id, source_id, start_date, end_date FROM conventions WHERE source='cpp';`]);
  const rows = extractRows(raw);
  console.log(`   · ${rows.length} 条 cpp 记录`);

  // 3) 计算目标日期并生成 UPDATE
  const sqls = [];
  let bySearch = 0, byDetail = 0, byFallback = 0, unchanged = 0;
  const unmatched = [];
  for (const r of rows) {
    const eid = String(r.source_id);
    let target = map.get(eid);
    if (target) {
      bySearch++;
    } else {
      // 未命中关键词搜索 → 抓详情页取字符串日期
      try {
        const html = await fetchDetail(eid);
        const p = parseEventParam(html);
        const s = (p.sDate || '').slice(0, 10) || null;
        const e = (p.eDate || '').slice(0, 10) || null;
        if (s) { target = { start: s, end: e }; byDetail++; }
      } catch (e) { /* 忽略，走兜底 */ }
    }
    if (!target) {
      // 兜底：搜索路径记录统一 -1 天，+1 修正
      target = { start: addDays(r.start_date, 1), end: r.end_date ? addDays(r.end_date, 1) : null };
      byFallback++;
      unmatched.push(eid);
    }
    const newStart = target.start ?? r.start_date;
    const newEnd = (target.end ?? null) !== null ? target.end : r.end_date;
    if (newStart !== r.start_date || (newEnd ?? null) !== (r.end_date ?? null)) {
      sqls.push(`UPDATE conventions SET start_date=${esc(newStart)}, end_date=${esc(newEnd)} WHERE id=${r.id};`);
    } else {
      unchanged++;
    }
  }

  console.log(`\n[fix-dates] 汇总：`);
  console.log(`   命中搜索映射：${bySearch}`);
  console.log(`   命中详情页：${byDetail}`);
  console.log(`   兜底 +1 天：${byFallback}${unmatched.length ? ' (eid: ' + unmatched.join(',') + ')' : ''}`);
  console.log(`   无需改动：${unchanged}`);
  console.log(`   将生成 UPDATE：${sqls.length}`);

  const outPath = path.join(__dirname, 'data', 'fix_dates.sql');
  fs.writeFileSync(outPath, sqls.join('\n') + (sqls.length ? '\n' : ''));
  console.log(`   · SQL 写入 ${outPath}`);

  if (!APPLY) {
    console.log('\n（dry-run）未写入远程 D1。核对后加 --apply 执行。');
    if (sqls.length) console.log('示例前 5 条：\n' + sqls.slice(0, 5).join('\n'));
    return;
  }
  if (!sqls.length) { console.log('（无改动）'); return; }
  console.log('\n[fix-dates] 写入远程 D1 ...');
  runWrangler(['--remote', '--file=' + outPath]);
  console.log('✅ 完成。');
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
