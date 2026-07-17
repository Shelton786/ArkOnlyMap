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

const migration = readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8');
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
  check('首位用户为 admin', j.user?.role === 'admin', `got ${j.user?.role}`);
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

  console.log(`\n结果：通过 ${pass} / 失败 ${fail}`);
  process.exit(fail ? 1 : 0);
};
run().catch((e) => { console.error('测试异常:', e); process.exit(1); });
