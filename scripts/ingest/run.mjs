// 采集编排 + 写入 D1。
// 用法：
//   node scripts/ingest/run.mjs --bilibili "<朋友导出的txt>"   # 半自动：朋友抓包文件
//   node scripts/ingest/run.mjs --keyword "明日方舟"           # cpp 自动搜索（推荐）：分页拉真实列表接口
//   node scripts/ingest/run.mjs --keyword "明日方舟" --detail  # 同上 + 额外抓详情页补全简介/主办方
//   node scripts/ingest/run.mjs --from-html "<App另存为的搜索页.html>"   # cpp 离线模式A：解析列表HTML
//   node scripts/ingest/run.mjs --from-list "<id清单.txt|.json>"          # cpp 离线模式B：ID/URL 清单
//   node scripts/ingest/run.mjs --qianyu [csv路径]             # 自动：千羽腾讯文档导出的 CSV
//   node scripts/ingest/run.mjs --all                          # 全部
//   通用选项：
//     --review-status pending|approved   覆盖默认审核状态（cpp 默认 pending）
//     --approve                          等价于 --review-status approved
//     --dry-run                          只生成 SQL 不写入远程 D1（核对用）
//
// cpp 数据源（无差别同人站 allcpp.cn）感谢 https://github.com/WindowsNoEditor/CPP_Search
// 逆向出的真实列表接口（eventMainListV2.do，无需 App 原生桥/鉴权）。
//
// 行为：收集 canonical 记录 → 生成 scripts/ingest/data/ingest.sql
//       → wrangler d1 execute --remote --file 写入（ON CONFLICT(source,source_id) 幂等更新）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGeo } from './geo.mjs';
import { parseBilibiliFile } from './bilibili.mjs';
import { parseQianyu } from './qianyu.mjs';
import { fetchCpp } from './cpp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const GEO_PATH = path.join(ROOT, 'public', 'data', 'geo_codes.json');
const SQL_PATH = path.join(__dirname, 'data', 'ingest.sql');
const DB = 'arknights-only-map';

// ---- 参数 ----
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valOf = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const doAll = has('--all');
const doBili = doAll || has('--bilibili');
const doQian = doAll || has('--qianyu');
// cpp 输入模式优先级：--keyword（自动搜索推荐）> --from-html（App 另存为的搜索页）> --from-list（ID/URL 清单）。
// --cpp 为旧写法，需配合 --from-html/--from-list；或直接改用 --keyword 自动搜索。
const fromHtml = valOf('--from-html');
const fromList = valOf('--from-list');
const keyword = valOf('--keyword');
const doCpp = doAll || !!fromHtml || !!fromList || !!keyword || has('--cpp');
const dryRun = has('--dry-run');
const reviewStatus = has('--approve') ? 'approved' : (valOf('--review-status') || 'pending');
const biliPath = valOf('--bilibili') || 'D:/13984/Documents/Tencent Files/1398473754/FileRecv/明日方舟活动信息_20260723_145440.txt';
const qianPath = valOf('--qianyu') || path.join(__dirname, 'data', 'qianyu.csv');

loadGeo(JSON.parse(fs.readFileSync(GEO_PATH, 'utf8')));

const COLS = ['title','start_date','end_date','province','city','district','venue','address',
  'longitude','latitude','description','organizer','source_url','poster_url','verified','tags',
  'country','country_code','province_code','city_code','district_code','source','source_id','imported_at','review_status','submitted_by'];

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

// 生成单条 INSERT ... ON CONFLICT DO UPDATE
function toSql(r) {
  const vals = COLS.map((c) => r[c] ?? (c === 'verified' ? 0 : c === 'submitted_by' ? null : null));
  const cols = COLS.map((c) => c).join(', ');
  const placeholders = COLS.map((c) => {
    const v = r[c];
    if (c === 'verified') return v != null ? Number(v) : 0;
    if (c === 'longitude' || c === 'latitude') return v != null ? Number(v) : 'NULL';
    if (v === null || v === undefined) return 'NULL';
    return `'${String(v).replace(/'/g, "''")}'`;
  });
  const update = COLS.filter((c) => !['source', 'source_id', 'submitted_by', 'id'].includes(c))
    .map((c) => `${c}=excluded.${c}`).join(', ');
  return `INSERT INTO conventions (${cols}) VALUES (${placeholders.join(', ')}) ` +
    `ON CONFLICT(source, source_id) DO UPDATE SET ${update};`;
}

async function main() {
  const records = [];
  if (doBili) {
    const rs = parseBilibiliFile(biliPath);
    records.push(...rs.map((r) => ({ ...r, _src: 'bilibili' })));
    console.log(`[bilibili] ${rs.length} 条（${biliPath}）`);
  }
  if (doCpp) {
    if (keyword) {
      const rs = await fetchCpp({ mode: 'search', keyword, reviewStatus, fetchDetails: has('--detail') });
      records.push(...rs.map((r) => ({ ...r, _src: 'cpp' })));
      console.log(`[cpp] ${rs.length} 条`);
    } else if (fromHtml || fromList) {
      const rs = await fetchCpp({ mode: fromHtml ? 'html' : 'list', inputFile: fromHtml || fromList, reviewStatus });
      records.push(...rs.map((r) => ({ ...r, _src: 'cpp' })));
      console.log(`[cpp] ${rs.length} 条`);
    } else if (has('--cpp')) {
      console.warn('[cpp] 旧写法 --cpp 需配合 --from-html/--from-list，或直接改用 --keyword 自动搜索，已跳过 cpp。');
    }
  }
  if (doQian) {
    const rs = await parseQianyu(qianPath);
    records.push(...rs.map((r) => ({ ...r, _src: 'qianyu' })));
    console.log(`[qianyu] ${rs.length} 条（${qianPath}）`);
  }

  if (!records.length) { console.log('没有可导入的记录。'); return; }

  // 归一化并生成 SQL。merge 进 normalize 需要 geo（已 loadGeo）。
  const { normalize } = await import('./normalize.mjs');
  const sqls = [];
  let withCode = 0;
  for (const r of records) {
    const src = r._src;
    delete r._src;
    const c = normalize(r, src);
    if (c.district_code || c.city_code || c.province_code) withCode++;
    sqls.push(toSql(c));
  }
  fs.mkdirSync(path.dirname(SQL_PATH), { recursive: true });
  fs.writeFileSync(SQL_PATH, sqls.join('\n'));
  console.log(`生成 ${sqls.length} 条 SQL（其中 ${withCode} 条解析到行政区划编码）-> ${SQL_PATH}`);

  // dry-run：只生成 SQL，不写入远程 D1
  if (dryRun) {
    console.log('（dry-run）未写入远程 D1。可直接打开上面的 SQL 文件核对映射。');
    return;
  }

  // 写入远程 D1
  const wrangler = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const node = process.execPath;
  const { execFileSync } = await import('node:child_process');
  console.log('写入远程 D1 ...');
  try {
    const out = execFileSync(node, [wrangler, 'd1', 'execute', DB, '--remote', '--file=' + SQL_PATH], { encoding: 'utf8' });
    console.log(out.split('\n').filter((l) => /success|changes|rows|error/i.test(l)).slice(0, 6).join('\n'));
    console.log('✅ 写入完成。');
  } catch (e) {
    console.error('❌ 写入失败：', e.message);
    process.exit(1);
  }
}

main();
