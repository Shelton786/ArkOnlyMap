// 回溯脚本：把现有 users / conventions 适配账户系统（阶段 A）
//
// 作用：
//  1. 给所有 amid 为空的 users 分配 AMID（AM- + 8 位唯一数字）
//  2. 首位用户（id=1，Doc）提升为 site_admin；其余保持原 role（默认 user）
//  3. 现有 password_hash 写成一条 provider='password' 的 auth_identities（旧「昵称+密码」登录照常可用）
//  4. 现有活动 review_status='approved'、organizer_claim_status='none'
//
// 用法：
//   node scripts/backfill_accounts.mjs            # 默认对【线上】D1 执行
//   node scripts/backfill_accounts.mjs --local    # 对【本地】D1 执行（先 wrangler d1 execute --local 跑过迁移）
//
// 说明：脚本仅写 SQL 到 data/backfill.sql 并执行，不删除任何数据；可重复运行（amid 已存在则跳过）。

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
// 直接通过 node 调用 wrangler 可执行文件，避免依赖 shell/npx 解析
const WRANGLER_BIN = resolve(ROOT, 'node_modules/wrangler/bin/wrangler.js');
const isLocal = process.argv.includes('--local');
const mode = isLocal ? '--local' : '--remote';
const DB = 'DB';

function runWrangler(args) {
  return execFileSync(process.execPath, [WRANGLER_BIN, 'd1', 'execute', DB, mode, ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

// 从 wrangler --command 的输出里抽取 JSON 结果数组
// wrangler 可能包裹为 [{ "results": [...] }]，或直接给出行数组
function parseCommandJson(out) {
  const m = out.match(/\[[\s\S]*\]/);
  if (!m) return [];
  let data;
  try { data = JSON.parse(m[0]); } catch { return []; }
  if (Array.isArray(data)) {
    if (data.length && Array.isArray(data[0]?.results)) return data[0].results;
    return data;
  }
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

// 生成 8 位唯一数字串（避免与已分配/本批次重复）
function genAmid(taken) {
  let amid;
  do {
    amid = 'AM-' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  } while (taken.has(amid));
  taken.add(amid);
  return amid;
}

function sqlStr(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  console.log(`\n[backfill] 模式：${isLocal ? '本地 D1' : '线上 D1'}`);

  // 1) 读取待回溯的用户
  const qOut = runWrangler(['--command', "SELECT id, username, role FROM users WHERE amid IS NULL"]);
  const users = parseCommandJson(qOut);
  if (!users.length) {
    console.log('[backfill] 没有需要分配 AMID 的用户（可能已回溯过）。仅确认活动状态。');
  } else {
    console.log(`[backfill] 待分配 AMID 的用户：${users.length} 个`);
  }

  const taken = new Set();
  const lines = [];

  for (const u of users) {
    const amid = genAmid(taken);
    const name = u.username;
    lines.push(`UPDATE users SET amid=${sqlStr(amid)}, display_name=COALESCE(display_name, ${sqlStr(name)}) WHERE id=${u.id};`);
    // 旧「昵称+密码」登录方式写成一条 password identity
    lines.push(
      `INSERT OR IGNORE INTO auth_identities (user_id, provider, provider_account_id, provider_username, verified) ` +
      `VALUES (${u.id}, 'password', ${sqlStr(name)}, ${sqlStr(name)}, 1);`
    );
  }

  // 2) 首位用户（id=1，Doc）→ site_admin
  lines.push(`UPDATE users SET role='site_admin' WHERE id=1 AND amid IS NOT NULL;`);

  // 3) 现有活动状态兜底（ALTER DEFAULT 已置 approved，这里再显式保障）
  lines.push(`UPDATE conventions SET review_status='approved' WHERE review_status IS NULL OR review_status='';`);
  lines.push(`UPDATE conventions SET organizer_claim_status='none' WHERE organizer_claim_status IS NULL OR organizer_claim_status='';`);

  const sql = lines.join('\n') + '\n';
  const outFile = join(ROOT, 'data', 'backfill.sql');
  writeFileSync(outFile, sql, 'utf-8');
  console.log(`[backfill] 已生成 SQL：${outFile}`);

  // 4) 执行
  runWrangler(['--file', outFile]);
  console.log('[backfill] ✅ 执行完成。');
  console.log('[backfill] 提示：Doc（id=1）现为 site_admin；旧密码登录照常可用（已写入 auth_identities）。');
}

main().catch((e) => {
  console.error('[backfill] 失败：', e.stdout || e.stderr || e.message);
  process.exit(1);
});
