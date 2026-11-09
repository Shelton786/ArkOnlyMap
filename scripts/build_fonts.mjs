// 自托管字体构建脚本：从 node_modules 的 @fontsource-variable 包生成 public/fonts/ 与 public/css/fonts.css
// 用法：npm i 后运行 node scripts/build_fonts.mjs
// 方案依据 endfield-ui-skill：Saira（可变，wdth 50-125 / wght 100-900）做拉丁字/数字，
// Noto Sans SC（可变 wght）做中文；按 unicode-range 切片，浏览器只下载用到的字。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nm = path.join(root, 'node_modules', '@fontsource-variable');
const outFonts = path.join(root, 'public', 'fonts');
const outCss = path.join(root, 'public', 'css', 'fonts.css');

function copyPkg(pkg, cssFile, familyFrom, familyTo, urlPrefix, keepBlock) {
  const pkgDir = path.join(nm, pkg);
  const css = fs.readFileSync(path.join(pkgDir, cssFile), 'utf8');
  const dest = path.join(outFonts, pkg);
  fs.mkdirSync(dest, { recursive: true });
  // 按 @font-face 块拆分，逐块过滤/改写
  const blocks = css.split(/(?=\/\* )/).filter((b) => b.includes('@font-face'));
  const kept = [];
  let copied = 0;
  for (const block of blocks) {
    if (keepBlock && !keepBlock(block)) continue;
    const m = block.match(/url\(\.\/files\/([^)]+)\)/);
    if (!m) continue;
    fs.copyFileSync(path.join(pkgDir, 'files', m[1]), path.join(dest, m[1]));
    copied++;
    kept.push(
      block
        .replaceAll(familyFrom, familyTo)
        .replace(/url\(\.\/files\/([^)]+)\)/g, `url(${urlPrefix}/$1)`)
        .trim()
    );
  }
  // 许可证随附（OFL 要求）
  fs.copyFileSync(path.join(pkgDir, 'LICENSE'), path.join(dest, 'LICENSE.txt'));
  console.log(`[${pkg}] 复制 ${copied} 个 woff2 切片 + LICENSE`);
  return kept.join('\n\n');
}

// Saira：只要 latin / latin-ext（不要 vietnamese），standard = 含宽度轴的全可变字体
const saira = copyPkg(
  'saira', 'standard.css', "'Saira Variable'", "'Saira'", '/fonts/saira',
  (b) => /\/\* saira-latin(-ext)?-standard-normal \*\//.test(b)
);
// Noto Sans SC：全部 101 个切片（含 emoji/符号区），页面按需下载
const noto = copyPkg(
  'noto-sans-sc', 'wght.css', "'Noto Sans SC Variable'", "'Noto Sans SC'", '/fonts/noto-sans-sc'
);

const header = `/* 自托管字体（由 scripts/build_fonts.mjs 生成，勿手改）
 * Saira: Copyright 2020 The Saira Project Authors, SIL OFL 1.1（/fonts/saira/LICENSE.txt）
 * Noto Sans SC: Copyright 2014-2021 Adobe / Google, SIL OFL 1.1（/fonts/noto-sans-sc/LICENSE.txt）
 *  families 命名为 Saira / Noto Sans SC，与站内字体栈一致；font-display: swap 保证不阻塞渲染 */
`;
fs.writeFileSync(outCss, header + '\n' + saira + '\n\n' + noto + '\n');
console.log(`已生成 ${path.relative(root, outCss)}`);