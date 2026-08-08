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
'use strict';
/* 舟友同好集会地图 —— 前端逻辑 */

const state = {
  config: { title: '舟友同好集会地图', amapKey: '', amapSecurityCode: '', geocodeEnabled: false },
  map: null,
  markers: new Map(),
  events: [],
  user: null,
  filters: { q: '', city: '', status: '' },
  selectedId: null,
  pickMarker: null,
};

const STATUS_TEXT = { upcoming: '即将举办', ongoing: '进行中', past: '已结束', unknown: '待定' };
const ROLE_LABEL = { site_admin: '站长', admin: '管理员', organizer: '主办', user: '舟友' };
const ROLE_CLASS = { site_admin: 'role-site', admin: 'role-admin', organizer: 'role-org', user: 'role-user' };
function roleLabel(r) { return ROLE_LABEL[r] || '舟友'; }
function roleClass(r) { return ROLE_CLASS[r] || 'role-user'; }
// 审核状态前端文案
const REVIEW_BADGE = { pending: '未确认', rejected: '已驳回', merged: '已合并' };

// 默认地图视图：长三角（南京—上海之间），解决“一进来太大看不清”的问题
const DEFAULT_CENTER = [119.6, 31.6];
const DEFAULT_ZOOM = 7;

// 省 / 直辖市 / 自治区 → 主要城市（用于提交表单的省份、城市下拉选择，避免手打）
const PROVINCE_CITIES = {
  '北京市': ['北京'], '天津市': ['天津'], '上海市': ['上海'], '重庆市': ['重庆'],
  '河北省': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
  '山西省': ['太原','大同','朔州','忻州','阳泉','晋中','长治','晋城','临汾','运城','吕梁'],
  '内蒙古自治区': ['呼和浩特','包头','乌海','赤峰','通辽','鄂尔多斯','呼伦贝尔','巴彦淖尔','乌兰察布','兴安盟','锡林郭勒盟','阿拉善盟'],
  '辽宁省': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
  '吉林省': ['长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
  '黑龙江省': ['哈尔滨','齐齐哈尔','鸡西','鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化','大兴安岭'],
  '江苏省': ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
  '浙江省': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
  '安徽省': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','六安','亳州','池州','宣城'],
  '福建省': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
  '江西省': ['南昌','景德镇','萍乡','九江','新余','鹰潭','赣州','吉安','宜春','抚州','上饶'],
  '山东省': ['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','临沂','德州','聊城','滨州','菏泽'],
  '河南省': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店','济源'],
  '湖北省': ['武汉','黄石','十堰','宜昌','襄阳','鄂州','荆门','孝感','荆州','黄冈','咸宁','随州','恩施'],
  '湖南省': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
  '广东省': ['广州','韶关','深圳','珠海','汕头','佛山','江门','湛江','茂名','肇庆','惠州','梅州','汕尾','河源','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
  '广西壮族自治区': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','贺州','河池','来宾','崇左'],
  '海南省': ['海口','三亚','三沙','儋州','五指山','琼海','文昌','万宁','东方','定安','屯昌','澄迈','临高','白沙','昌江','乐东','陵水','保亭','琼中'],
  '四川省': ['成都','自贡','攀枝花','泸州','德阳','绵阳','广元','遂宁','内江','乐山','南充','眉山','宜宾','广安','达州','雅安','巴中','资阳','阿坝','甘孜','凉山'],
  '贵州省': ['贵阳','六盘水','遵义','安顺','毕节','铜仁','黔西南','黔东南','黔南'],
  '云南省': ['昆明','曲靖','玉溪','保山','昭通','丽江','普洱','临沧','楚雄','红河','文山','西双版纳','大理','德宏','怒江','迪庆'],
  '西藏自治区': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
  '陕西省': ['西安','铜川','宝鸡','咸阳','渭南','延安','汉中','榆林','安康','商洛'],
  '甘肃省': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南','临夏','甘南'],
  '青海省': ['西宁','海东','海北','黄南','海南','果洛','玉树','海西'],
  '宁夏回族自治区': ['银川','石嘴山','吴忠','固原','中卫'],
  '新疆维吾尔自治区': ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博尔塔拉','巴音郭楞','阿克苏','克孜勒苏','喀什','和田','伊犁','塔城','阿勒泰','石河子'],
  '台湾省': ['台北','高雄','台中','台南','新北','桃园','基隆','新竹','嘉义'],
  '香港特别行政区': ['香港'], '澳门特别行政区': ['澳门'],
};

// 国家 / 地区（海外展会用）。中国走「省份/城市」下拉；其它走「省/州(选填)+城市」自由文本。
const COUNTRY_LIST = ['中国', '日本', '韩国', '美国', '英国', '法国', '德国', '澳大利亚', '加拿大', '新加坡', '马来西亚', '泰国', '其他'];
// 中国以外的常见地区中文名（用于「其他」时用户自己填，这里仅作提示占位）
function isChina(c) { return !c || c === '中国'; }

/* ---------------- 工具 ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function api(path, opts = {}) {
  return fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opts });
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}
function fmtDate(ev) {
  if (ev.start_date && ev.end_date && ev.start_date !== ev.end_date)
    return `${ev.start_date} ~ ${ev.end_date}`;
  return ev.start_date || ev.end_date || '日期待定';
}
function safeUrl(u) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : '';
}
// 解析举办日期：支持 2026-07-26 / 2026/7/17 / 2026/7/17-2026/7/18 / 2026-07-26 ~ 2026-07-27
function parseDateRange(raw) {
  if (!raw) return { start: null, end: null };
  const s = String(raw).replace(/\n/g, ' ').trim();
  const found = [];
  const re = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})|(\d{1,2})[/-](\d{1,2})/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
        found.push(`${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    } else {
      const mo = +m[4], d = +m[5];
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
        found.push(`${new Date().getFullYear()}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  if (!found.length) return { start: null, end: null };
  if (found.length === 1) return { start: found[0], end: found[0] };
  return { start: found[0], end: found[found.length - 1] };
}

/* ---------------- 日期与状态推算 ---------------- */
// 举办日期 -> Date（按本地零点解析，避免时区偏移）
function parseDateOnly(s) {
  const m = /(\d{4})-(\d{2})-(\d{2})/.exec(String(s == null ? '' : s));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
// 根据当前日期判断集会状态：past=已举办 / upcoming=即将举办 / ongoing=进行中
function eventStatus(ev) {
  if (!ev.start_date) return 'unknown';
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d1 = parseDateOnly(ev.start_date);
  const d2 = parseDateOnly(ev.end_date || ev.start_date);
  if (!d1) return 'unknown';
  if (d2 && d2 < t) return 'past';
  if (d1 > t) return 'upcoming';
  return 'ongoing';
}
