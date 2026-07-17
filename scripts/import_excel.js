'use strict';
/**
 * 数据导入脚本：Excel(.xlsx) / CSV / 腾讯文档导出的 CSV 链接 -> 数据库
 *
 * 用法：
 *   node scripts/import_excel.js data.xlsx
 *   node scripts/import_excel.js data.csv
 *   node scripts/import_excel.js "https://docs.qq.com/.../export.csv"
 *   node scripts/import_excel.js 表.xlsx --skip 1        # 跳过前 N 行横幅再读表头
 *   node scripts/import_excel.js 表.xlsx --clear         # 先清空再导入
 *   node scripts/import_excel.js 表.xlsx --geocode        # 服务端地理编码（需 Web服务 Key）
 *
 * 说明：本项目的地图 Key 为「Web端(JS API)」类型，不能用于服务端地理编码，
 *       因此坐标默认在浏览器端用高德 JS API 的 Geocoder 解析并回写。
 *       若你另有「Web服务」Key 并配置了 AMAP_KEY（Web服务），可用 --geocode。
 */
const fs = require('fs');
const path = require('path');

// 加载 .env（在加载依赖前）
(function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
})();

const { createEvent, deleteEvent, db } = require('../server/db');
const { geocode } = require('../server/geocode');

const ALIASES = {
  title: ['名称', '标题', '活动名称', '活动名称（未确定可不填）', '活动', 'title', 'name'],
  start_date: ['开始日期', '起始日期', '举办日期', '首选举办日期', '开始', 'start', 'start_date', 'date'],
  end_date: ['结束日期', '备选举办日期', '结束', 'end', 'end_date'],
  province: ['省份', '省', 'province', 'state'],
  city: ['城市', '活动地区', 'city', 'town', '地区'],
  venue: ['场馆', '地点', '场地', 'venue', 'place', 'location'],
  address: ['地址', '详细地点', '详细地址', 'addr', 'address'],
  longitude: ['经度', '经纬度经度', 'lng', 'lon', 'longitude', 'x'],
  latitude: ['纬度', 'lat', 'latitude', 'y'],
  organizer: ['主办', '主办方', '主催id', '主催ID', 'organizer', 'host'],
  source_url: ['来源', '来源链接', '官网', '链接', 'url', 'source', 'source_url', 'link'],
  poster_url: ['海报', '海报链接', 'poster', 'poster_url', 'image', 'img'],
  description: ['介绍', '描述', '详情', '简介', '备注栏', 'desc', 'description', 'info'],
  tags: ['标签', '活动性质（内容组成）', 'tag', 'tags', '类型'],
  verified: ['核实', '已核实', 'verified', '官方认证'],
  // 以下为征集表常见附加字段，并入介绍
  submitter: ['提交者', 'submitter'],
  officialGroup: ['官方群号', 'officialgroup', '官方群'],
  qq: ['主催qq联系方式', 'qq', '主催qq'],
  clubGroup: ['社团报名群号', 'clubgroup', '社团群'],
  progress: ['申摊结束/展会进度', 'progress', '展会进度', '申摊结束'],
};

function normHeader(h) { return String(h || '').trim().toLowerCase().replace(/\s+/g, ''); }
function buildColumnMap(headers) {
  const map = {};
  const normed = {};
  for (const [f, arr] of Object.entries(ALIASES)) normed[f] = arr.map((a) => normHeader(a));
  for (const h of headers) {
    const nh = normHeader(h);
    for (const [f, ali] of Object.entries(normed)) {
      if (ali.includes(nh)) { map[f] = h; break; }
    }
  }
  return map;
}
function toDate(s) {
  if (!s) return null;
  const str = String(s).trim();
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) return str.replace(/[-/.]/g, '-');
  if (/^\d{4,5}$/.test(str)) { // Excel 序列号日期
    const d = new Date((Number(str) - 25569) * 86400 * 1000);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }
  return str;
}
function splitTags(s) { return s ? String(s).split(/[、,，/]/).map((x) => x.trim()).filter(Boolean) : []; }
function toNum(s) { if (s == null || s === '') return null; const n = Number(String(s).trim()); return isNaN(n) ? null : n; }

async function parseRows(input, skip) {
  if (/^https?:\/\//i.test(input)) {
    console.log('↓ 下载远程 CSV:', input);
    const resp = await fetch(input);
    const text = await resp.text();
    return parseCSV(text, skip);
  }
  const ext = path.extname(input).toLowerCase();
  if (ext === '.csv') return parseCSV(fs.readFileSync(input, 'utf8'), skip);
  const XLSX = require('xlsx');
  const wb = XLSX.readFile(input);
  const ws = wb.Sheets[wb.SheetNames[0]];
  // 读成数组，再手动以第 skip 行为表头，确保横幅行被跳过
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerRow = (raw[skip] || []).map((h) => String(h == null ? '' : h).trim());
  return raw.slice(skip + 1).map((r) => {
    const o = {};
    headerRow.forEach((h, i) => { o[h] = r[i] == null ? '' : r[i]; });
    return o;
  });
}
function parseCSV(text, skip = 0) {
  const lines = text.trim().split(/\r?\n/).slice(skip);
  if (!lines.length) return [];
  const split = (line) => {
    const out = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === ',' && !q) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur); return out;
  };
  const headers = split(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = split(l); const row = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ''));
    return row;
  });
}

async function main() {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith('--'));
  const clear = args.includes('--clear');
  const doGeocode = args.includes('--geocode');
  const skipArg = args.find((a) => a.startsWith('--skip'));
  let skip = 0;
  if (skipArg) {
    const v = skipArg.includes('=') ? skipArg.split('=')[1] : args[args.indexOf(skipArg) + 1];
    skip = Number(v) || 0;
  }
  if (!input) { console.log('用法: node scripts/import_excel.js <文件或CSV链接> [--skip N] [--clear] [--geocode]'); process.exit(1); }

  const rows = await parseRows(input, skip);
  if (!rows.length) { console.log('没有可导入的数据'); return; }
  const headers = Object.keys(rows[0]);
  const colMap = buildColumnMap(headers);
  console.log('识别到的列映射:', JSON.stringify(colMap));

  if (clear) {
    const all = db.prepare('SELECT id FROM conventions').all();
    for (const r of all) deleteEvent(r.id);
    console.log(`已清空 ${all.length} 条旧数据`);
  }
  const firstUser = db.prepare('SELECT id FROM users ORDER BY id LIMIT 1').get();
  const submittedBy = firstUser ? firstUser.id : null;

  let added = 0, skipped = 0, geocoded = 0;
  for (const row of rows) {
    const get = (f) => (colMap[f] ? row[colMap[f]] : '');
    const title = String(get('title') || '').trim();
    if (!title) { skipped++; continue; }
    let province = String(get('province') || '').trim() || null;
    let city = String(get('city') || '').trim() || null;
    if (city && city.includes('/')) { const [p, c] = city.split('/'); province = province || p.trim(); city = c.trim(); }
    let longitude = toNum(get('longitude'));
    let latitude = toNum(get('latitude'));
    const address = String(get('address') || '').trim();
    if ((longitude == null || latitude == null) && address && doGeocode) {
      const g = await geocode(address, city);
      if (g) { longitude = g.longitude; latitude = g.latitude; geocoded++; }
    }
    // 附加信息并入介绍
    const extra = [];
    const submitter = String(get('submitter') || '').trim();
    const officialGroup = String(get('officialGroup') || '').trim();
    const qq = String(get('qq') || '').trim();
    const clubGroup = String(get('clubGroup') || '').trim();
    const progress = String(get('progress') || '').trim();
    if (submitter) extra.push('提交者：' + submitter);
    if (officialGroup) extra.push('官方群号：' + officialGroup);
    if (qq) extra.push('主催QQ：' + qq);
    if (clubGroup) extra.push('社团报名群：' + clubGroup);
    if (progress) extra.push('进度：' + progress);
    let description = String(get('description') || '').trim();
    if (extra.length) description = (description ? description + '\n' : '') + extra.join('\n');

    createEvent({
      title,
      start_date: toDate(get('start_date')),
      end_date: toDate(get('end_date')),
      province, city,
      venue: String(get('venue') || '').trim() || null,
      address: address || null,
      longitude, latitude,
      organizer: String(get('organizer') || '').trim() || null,
      source_url: String(get('source_url') || '').trim() || null,
      poster_url: String(get('poster_url') || '').trim() || null,
      description: description || null,
      tags: splitTags(get('tags')),
      verified: /(是|true|1|已核实|官方)/i.test(String(get('verified') || '')) ? 1 : 0,
      submitted_by: submittedBy,
    });
    added++;
  }
  console.log(`✅ 导入完成：新增 ${added} 条，跳过 ${skipped} 条（缺名称），服务端地理编码 ${geocoded} 条。`);
  console.log('提示：缺坐标的活动将在浏览器端用高德 JS API 自动解析并在首次查看地图时落库。');
}

main().catch((e) => { console.error('导入失败:', e); process.exit(1); });
