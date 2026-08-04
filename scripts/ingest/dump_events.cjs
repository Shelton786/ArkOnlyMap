const { execFileSync } = require('child_process');
const fs = require('fs');

const NODE = 'C:/Users/13984/.workbuddy/binaries/node/versions/22.22.2/node.exe';
const WR = 'node_modules/wrangler/bin/wrangler.js';

const sql = `SELECT * FROM conventions ORDER BY id;`;

const raw = execFileSync(NODE, [WR, 'd1', 'execute', 'arknights-only-map', '--remote', '--command', sql], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});

// wrangler may emit log lines before the JSON array; find first '['.
const i = raw.indexOf('[');
const d = JSON.parse(raw.slice(i));
// structure: [{ results: [ {...rows} ] }]  (nested) OR [{ results: [ ...rows ] }]
let rows;
if (Array.isArray(d[0].results)) {
  const first = d[0].results[0];
  if (first && Array.isArray(first.results)) rows = first.results;
  else rows = d[0].results;
}
fs.writeFileSync('scripts/ingest/data/all_events.json', JSON.stringify(rows, null, 2), 'utf8');
console.log('导出活动数:', rows.length);
const bySrc = {};
for (const r of rows) bySrc[r.source || 'null'] = (bySrc[r.source || 'null'] || 0) + 1;
console.log('按 source:', bySrc);
const missing = rows.filter(r => r.longitude == null || r.latitude == null).length;
console.log('缺坐标:', missing);
