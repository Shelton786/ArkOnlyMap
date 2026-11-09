// 图标构建脚本：从 scripts/assets/favicon-source.png（512×512 原图）生成全站各尺寸图标
// 用法：node scripts/build_icons.mjs（依赖 devDependency sharp）
// 产物：
//   public/favicon.png           64×64   浏览器标签页图标（ retina 友好，几 KB）
//   public/apple-touch-icon.png  180×180 iOS 主屏图标
//   public/icons/icon-192.png    192×192 PWA manifest
//   public/icons/icon-512.png    512×512 PWA manifest
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'scripts', 'assets', 'favicon-source.png');

const targets = [
  { out: 'public/favicon.png', size: 64, palette: true },
  { out: 'public/apple-touch-icon.png', size: 180, palette: true },
  { out: 'public/icons/icon-192.png', size: 192, palette: true },
  // 512 大图同样量化（原插画色彩有限，256 色无可见色带，354KB→108KB）；仅 PWA 安装时下载
  { out: 'public/icons/icon-512.png', size: 512, palette: true },
];

for (const t of targets) {
  const dest = path.join(root, t.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize(t.size, t.size, { fit: 'cover' })
    .png({ compressionLevel: 9, effort: 10, palette: t.palette })
    .toFile(dest);
  console.log(`${t.out}  ${t.size}x${t.size}  ${(fs.statSync(dest).size / 1024).toFixed(1)} KB`);
}