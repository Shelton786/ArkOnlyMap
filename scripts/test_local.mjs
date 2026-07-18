/*
 * ArkOnlyMap —— 舟友同好集会地图
 * Copyright © 2026 Booker786
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// 本地集成测试：用真实 Hono 应用 + 内存 SQLite 充当 D1，验证路由与 SQL。
// 无需 Cloudflare 账号即可运行： npm run test:local
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { readFileSync } from 'node:fs';

const bs = new Database(':memory:');
bs.pragma('journal_mode = WAL');

class FakeStmt {
  constructor(sql) { this._sql = sql; this._vals = []; }
  bind(...vals) { this._vals = vals; return this; }
  async all() { return { results: bs.prepare(this._sql).all(...this._vals) }; }
  async first() { return bs.prepare(this._sql).get(...this._vals) ?? null; }
  async run() {
    const r = bs.prepare(this._sql).run(...this._vals);
    return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } };
  }
}
class FakeD1 { prepare(sql) { return new FakeStmt(sql); } async exec(sql) { bs.exec(sql); return {}; } }

const env = {
  DB: new FakeD1(),
  AMAP_KEY: 'test_js_key', AMAP_SECURITY_CODE: 'test_sec',
  AMAP_WEB_KEY: 'test_web_key', AMAP_WEB_SECRET: '',
  SESSION_SECRET: 'test-secret-for-local',
};

const migration = readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8')
  + '\n' + readFileSync(new URL('../migrations/0002_accounts.sql', import.meta.url), 'utf8');
await env.DB.exec(migration);
const app = createApp();
const req = (p, init = {}) => app.request(p, init, env);

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✅', name); }
  else { fail++; console.log('  ❌', name, extra); }
};

const run = async () => {
  let j = await (await req('/api/config')).json();
  check('config.amapKey', j.amapKey === 'test_js_key');
  check('config.geocodeEnabled', j.geocodeEnabled === true);

  let r = await req('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: '博士', password: 'arknights' }) });
  j = await r.json();
  check('register 返回 user', j.user?.username === '博士');
  check('首位用户为 site_admin', j.user?.role === 'site_admin', `got ${j.user?.role}`);
  const token = (r.headers.get('set-cookie') || '').split('ark_session=')[1]?.split(';')[0];
  check('register 写入 Set-Cookie', !!token);

  j = await (await req('/api/auth/me', { headers: { Cookie: `ark_session=${token}` } })).json();
  check('me 返回当前用户', j.user?.username === '博士');

  r = await req('/api/events', { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ title: '测试集会', city: '上海市', province: '上海市', address: '某地', start_date: '2030-01-01', end_date: '2030-01-02' }) });
  j = await r.json();
  check('createEvent 201+id', r.status === 201 && j.id > 0, `status=${r.status}`);
  const id = j.id;

  j = await (await req('/api/events?limit=100')).json();
  check('listEvents 含新建', Array.isArray(j.items) && j.items.some((e) => e.id === id));

  j = await (await req(`/api/events/${id}`)).json();
  check('getEvent 正常', j.id === id);
  check('日期归一化 ISO', j.start_date === '2030-01-01' && j.end_date === '2030-01-02', `${j.start_date}/${j.end_date}`);
  check('status=upcoming(2030)', j.status === 'upcoming', `got ${j.status}`);

  r = await req('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: '未授权' }) });
  check('未登录创建 401', r.status === 401, `status=${r.status}`);

  r = await req(`/api/events/${id}/coords`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ longitude: 121.4, latitude: 31.2 }) });
  check('saveCoords ok', r.status === 200);
  j = await (await req(`/api/events/${id}`)).json();
  check('坐标已写入', Number(j.longitude) === 121.4 && Number(j.latitude) === 31.2, `${j.longitude}/${j.latitude}`);

  j = await (await req('/api/stats')).json();
  check('stats.events>=1', j.events >= 1, `events=${j.events}`);
  j = await (await req('/api/events/cities')).json();
  check('cities 含上海市', Array.isArray(j) && j.some((c) => c.city === '上海市'));

  // ---------------- 阶段 A：账户系统 / 审核流 ----------------
  // 首位用户应为 site_admin 且带 AMID
  const meDoc = await (await req('/api/auth/me', { headers: { Cookie: `ark_session=${token}` } })).json();
  check('me 含 AMID', /^AM-\d{8}$/.test(meDoc.user?.amid || ''), meDoc.user?.amid);

  // 注册第二位用户（舟友）→ role=user
  let r2 = await req('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: '舟友A', password: 'arknights', email: 'a@example.com' }) });
  let d2 = await r2.json();
  check('第二位用户 role=user', d2.user?.role === 'user', `got ${d2.user?.role}`);
  check('第二位用户有 AMID', /^AM-\d{8}$/.test(d2.user?.amid || ''), d2.user?.amid);
  const tokenUser = (r2.headers.get('set-cookie') || '').split('ark_session=')[1]?.split(';')[0];

  // 舟友用邮箱登录
  let rlogin = await req('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@example.com', password: 'arknights' }) });
  check('邮箱登录成功', rlogin.status === 200, `status=${rlogin.status}`);

  // 舟友提交新活动 → pending
  let rSub = await req('/api/events', { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${tokenUser}` }, body: JSON.stringify({ title: '待审集会', city: '杭州市', start_date: '2030-05-01' }) });
  let dSub = await rSub.json();
  check('舟友提交→pending', dSub.pending === true && dSub.review_status === 'pending', JSON.stringify(dSub).slice(0, 80));
  const pendingId = dSub.id;

  // 公开列表应包含 pending（approved+pending）
  let listPub = await (await req('/api/events?limit=100')).json();
  check('公开列表含 pending', listPub.items.some((e) => e.id === pendingId));

  // 管理员审核队列可见 pending
  let review = await (await req('/api/admin/review', { headers: { Cookie: `ark_session=${token}` } })).json();
  check('审核队列含 pending', Array.isArray(review) && review.some((e) => e.id === pendingId));

  // 管理员通过 → approved
  await req(`/api/admin/review/${pendingId}`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ action: 'approve' }) });
  let approvedEv = await (await req(`/api/events/${pendingId}`)).json();
  check('审核通过→approved', approvedEv.review_status === 'approved', approvedEv.review_status);

  // 舟友补充该活动（supplement）
  let rSup = await req('/api/events', { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${tokenUser}` }, body: JSON.stringify({ title: '待审集会', city: '杭州市', venue: '补充场馆', start_date: '2030-05-01', submission_type: 'supplement', parent_event_id: pendingId }) });
  let dSup = await rSup.json();
  check('补充提交→pending+supplement', dSup.review_status === 'pending' && dSup.submission_type === 'supplement', JSON.stringify(dSup).slice(0, 80));
  const supId = dSup.id;

  // 管理员通过补充 → 合并进原活动，补充行 merged
  await req(`/api/admin/review/${supId}`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ action: 'approve' }) });
  let mergedParent = await (await req(`/api/events/${pendingId}`)).json();
  let mergedSup = await (await req(`/api/events/${supId}`)).json();
  check('合并后原活动 venue 更新', mergedParent.venue === '补充场馆', mergedParent.venue);
  check('补充行标记 merged', mergedSup.review_status === 'merged', mergedSup.review_status);

  // 认领流程
  let rClaim = await req(`/api/events/${pendingId}/claim`, { method: 'POST', headers: { Cookie: `ark_session=${tokenUser}` } });
  check('认领请求 pending', (await rClaim.json()).organizer_claim_status === 'pending');
  await req(`/api/events/${pendingId}/claim/approve`, { method: 'POST', headers: { Cookie: `ark_session=${token}` } });
  let claimed = await (await req(`/api/events/${pendingId}`)).json();
  check('认领通过→approved+organizer_user_id', claimed.organizer_claim_status === 'approved' && claimed.organizer_user_id != null);

  // 用户管理
  let users = await (await req('/api/admin/users', { headers: { Cookie: `ark_session=${token}` } })).json();
  check('用户列表含舟友A', Array.isArray(users) && users.some((u) => u.username === '舟友A'));
  // site_admin 把舟友A 提为 organizer
  let target = users.find((u) => u.username === '舟友A');
  let roleRes = await req(`/api/admin/users/${target.id}/role`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ role: 'organizer' }) });
  check('提为 organizer 成功', roleRes.status === 200, `status=${roleRes.status}`);

  // 造一个 admin（非 site_admin）来验证权限收敛
  let rB = await req('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: '管理员B', password: 'arknights' }) });
  let dB = await rB.json();
  await req(`/api/admin/users/${dB.user.id}/role`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${token}` }, body: JSON.stringify({ role: 'admin' }) });
  const tokenAdmin = (rB.headers.get('set-cookie') || '').split('ark_session=')[1]?.split(';')[0];

  // admin 不能提 admin（仅 site_admin 可）
  let forbid = await req(`/api/admin/users/${target.id}/role`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${tokenAdmin}` }, body: JSON.stringify({ role: 'admin' }) });
  check('admin 不可提 admin(403)', forbid.status === 403, `status=${forbid.status}`);
  // admin 可把他人设为 user
  let demote = await req(`/api/admin/users/${target.id}/role`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: `ark_session=${tokenAdmin}` }, body: JSON.stringify({ role: 'user' }) });
  check('admin 可设 user(200)', demote.status === 200, `status=${demote.status}`);

  console.log(`\n结果：通过 ${pass} / 失败 ${fail}`);
  process.exit(fail ? 1 : 0);
};
run().catch((e) => { console.error('测试异常:', e); process.exit(1); });
