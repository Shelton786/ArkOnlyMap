// 从商城页面保存的本地海报文件名恢复 B站图床远程 URL
// 规则：<8位随机><10位秒>_<13位毫秒>.<ext> @ {i0..i3}.hdslb.com/bfs/openplatform/<YYYYMM(Asia/Shanghai)>/<name>
// 验证样本：重庆无因 abcSXtDm1793099920_1793099920505.png → i0/202610/... ✓
//           长沙惊叹领域 QwRWzqzp1793527365_1793527365495.jpg → i2/202611/... ✓
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join(import.meta.dirname, 'data');

function yyyymmFromSec(sec) {
  const d = new Date(sec * 1000);
  // Asia/Shanghai 手动 +8
  const utc8 = new Date(d.getTime() + 8 * 3600 * 1000);
  return utc8.toISOString().slice(0, 7).replace('-', '');
}

function restoreRemoteUrl(localName) {
  const base = path.basename(localName);
  // 两种文件名格式：
  //   新: <8随机><10位秒>_<13毫秒>.<ext>   （2026-10 起）
  //   老: <8随机><13毫秒>.<ext>            （更早）
  const mNew = base.match(/^([A-Za-z0-9]{8}\d{10})_(\d{13})\.(jpg|jpeg|png|webp)(?:@[^@]*)?$/);
  const mOld = base.match(/^([A-Za-z0-9]{8})(\d{13})\.(jpg|jpeg|png|webp)(?:@[^@]*)?$/);
  let name, ms;
  if (mNew) {
    name = `${mNew[1]}_${mNew[2]}`;
    ms = Number(mNew[2]);
  } else if (mOld) {
    name = `${mOld[1]}${mOld[2]}`;
    ms = Number(mOld[2]);
  } else return null;
  if (!Number.isFinite(ms) || ms < 1.4e12 || ms > 2.2e12) return null; // 2014-09 ~ 2039
  const d = new Date(ms + 8 * 3600 * 1000); // Asia/Shanghai
  const yyyymm = d.toISOString().slice(0, 7).replace('-', '');
  const ext = mNew ? mNew[3] : mOld[3]; // 保持原始扩展名（.jpeg 不转 .jpg）
  return { yyyymm, cleanName: `${name}.${ext}` };
}

async function probe(url) {
  try {
    const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    if (r.status === 200 || r.status === 206) return true;
    return false;
  } catch {
    return false;
  }
}

async function resolveUrl(localName) {
  const info = restoreRemoteUrl(localName);
  if (!info) return null;
  const hosts = ['i0', 'i1', 'i2', 'i3'];
  // 并发试 4 个域名，取第一个 200/206
  const results = await Promise.all(
    hosts.map(async (h) => {
      const url = `https://${h}.hdslb.com/bfs/openplatform/${info.yyyymm}/${info.cleanName}`;
      const ok = await probe(url);
      return ok ? url : null;
    })
  );
  return results.find(Boolean) || null;
}

const items = JSON.parse(fs.readFileSync(path.join(DATA, '_mall_items_raw.json'), 'utf8'));
console.log('total items:', items.length);

let ok = 0, fail = 0, skip = 0;
const failed = [];
const CONC = 4;
for (let i = 0; i < items.length; i += CONC) {
  const batch = items.slice(i, i + CONC);
  await Promise.all(batch.map(async (m) => {
    if (!m.poster) { skip++; return; }
    const url = await resolveUrl(m.poster);
    if (url) { m.posterRemote = url; ok++; }
    else { fail++; failed.push(`${m.date} ${m.city} ${m.title} | ${path.basename(m.poster)}`); }
  }));
  if ((i / CONC) % 20 === 0) console.log(`  ${i + batch.length}/${items.length} (ok=${ok} fail=${fail})`);
}

console.log(`\n恢复结果：成功 ${ok}，失败 ${fail}，跳过 ${skip}`);
if (failed.length) {
  console.log('失败样本（前 20）:');
  for (const f of failed.slice(0, 20)) console.log('  ', f);
}
fs.writeFileSync(path.join(DATA, '_mall_items_posters.json'), JSON.stringify(items, null, 1), 'utf8');
console.log('-> _mall_items_posters.json');
