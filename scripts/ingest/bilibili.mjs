// 解析朋友从 B站会员购抓包导出的文本文件，转为原始活动数组。
// 格式样例（每行一个）：
//   [1] 北京 · 明日方舟 x HAPPY ZOO... - 预售中 - 海淀区 - BOM嘻番里 - 2026-07-05 - https://mall.bilibili.com/...detail.html?id=1003061 - 暂无嘉宾信息
// 字段顺序：序号 省份 · 标题 - 状态 - 区县 - 场馆 - 日期 - URL - 嘉宾
import fs from 'node:fs';

/**
 * @param {string} text 文件全文
 * @returns {Array<object>} 原始活动（含 source='bilibili' 的 source_id 从 URL 提取）
 */
export function parseBilibiliText(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  const dateRe = /\d{4}-\d{2}-\d{2}(?:\s*~\s*\d{4}-\d{2}-\d{2})?/;
  for (const line of lines) {
    const idx = line.indexOf(']');
    if (idx < 0 || !/^\s*\[\d+\]/.test(line)) continue;
    const rest = line.slice(idx + 1).trim();
    const segs = rest.split(' - '); // 按 “ - ” 切分（标题里若含 “ - ” 会在 rejoin 时复原）
    if (segs.length < 6) continue;

    // 锚点：日期段（\d{4}-\d{2}-\d{2}）
    let di = -1;
    for (let i = 0; i < segs.length; i++) if (dateRe.test(segs[i])) { di = i; break; }
    if (di < 0) continue;

    const headSegs = segs.slice(0, di - 3);          // 头部可能含 “ - ”
    const status = segs[di - 3] || '';
    const district = (segs[di - 2] || '').trim();
    const venue = (segs[di - 1] || '').trim();
    const date = segs[di].trim();
    const url = (segs[di + 1] || '').trim();
    const guests = segs.slice(di + 2).join(' - ').trim();

    const head = headSegs.join(' - ').trim();
    const sep = head.indexOf('·');
    const province = sep >= 0 ? head.slice(0, sep).trim() : head.trim();
    const title = sep >= 0 ? head.slice(sep + 1).trim() : head.trim();

    const idm = url.match(/[?&]id=(\d+)/);
    const sourceId = idm ? idm[1] : null;

    const dates = date.replace(/\s/g, '').split('~');
    const startDate = dates[0] || null;
    const endDate = dates[1] || null;
    out.push({
      title,
      province,
      district,
      venue,
      startDate,
      endDate,
      source_url: url,
      source_id: sourceId,
      organizer: null,
      description: `状态：${status.trim()}${guests ? '；' + guests : ''}`,
    });
  }
  return out;
}

/** 直接读文件 */
export function parseBilibiliFile(path) {
  return parseBilibiliText(fs.readFileSync(path, 'utf8'));
}

export default { parseBilibiliText, parseBilibiliFile };
