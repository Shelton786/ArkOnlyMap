# 舟友同好集会地图

> 明日方舟 ONLY 漫展分布地图 —— 让大家一起标记各地举办过 / 即将举办的舟游集会。

一个**全栈可协作**的地图网站：进入即是地图，标点即看详情；左侧列表可筛选搜索；注册账户后可提交 / 编辑漫展；数据可从 Excel / 腾讯文档批量导入。

参考站点：[kigmap.com](https://kigmap.com) ｜ 地图：高德地图 JS API ｜ 风格：明日方舟（主色 `#4AABEA`）

---

## ✨ 功能特性

- 🗺️ **地图首页**：进入即见高德地图与漫展标记，按状态着色（即将举办·蓝 / 进行中·黄 / 已结束·灰）
- 📍 **点击查看详情**：标记或列表项点击后右侧滑出详情卡（日期、城市、场馆、地址、主办、来源、介绍、提交者）
- 📋 **侧边列表 + 筛选**：按「即将举办 / 进行中 / 已结束」切换，按城市筛选，关键词搜索
- 👤 **轻量账户**：昵称 + 密码注册登录，确定提交者身份；首位注册者自动成为管理员
- ➕ **提交 / 编辑**：登录后提交新漫展，支持「在地图上选点」或填地址自动解析坐标
- 📥 **数据导入**：Excel(.xlsx) / CSV 一键导入，也支持腾讯文档导出的 CSV 链接
- 🎨 **明日方舟风格**：深蓝主题、`#4AABEA` 主色、衬线标题、斜切角按钮

---

## 🛠 技术栈

- 后端：Node.js + Express 5 + SQLite（better-sqlite3）
- 前端：原生 HTML/CSS/JS（无构建步骤）+ 高德地图 JS API 2.0
- 导入：SheetJS(xlsx) 读表 + 高德地理编码补全坐标

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制示例并填写：
```bash
cp .env.example .env
```
至少填写 `AMAP_KEY` 与 `AMAP_SECURITY_CODE`（前端地图，见下方申请步骤）。若想让坐标在服务器端批量预解析（首屏秒出标记），还需申请一个「Web 服务」类型的 Key 填入 `AMAP_WEB_KEY`（见下方）。`SESSION_SECRET` 建议改成随机长串。

### 3. 启动
```bash
npm start
# 或自定义端口： PORT=8080 npm start
```
浏览器打开 http://localhost:3000

---

## 🔑 申请高德地图 Key（Web 端）

1. 注册 / 登录 [高德开放平台](https://console.amap.com/)
2. 进入「应用管理 → 我的应用 → 创建新应用」
3. 添加 Key：**服务平台 选「Web端 (JS API)」**
4. 创建后会得到 `Key` 和 `安全密钥`（即 securityJsCode）
5. 把这两个值分别填入 `.env` 的 `AMAP_KEY` 与 `AMAP_SECURITY_CODE`
6. 重启服务即可看到地图

> 不使用 Key 时，地图区域显示占位提示，但列表 / 提交 / 导入功能均不受影响。

### 🔑 申请高德「Web 服务」Key（服务端批量解析坐标）

地图标记需要经纬度。本项目用「Web 服务」Key 在服务端批量把地址解析成坐标，写入数据库后所有人**首屏即可见标记**，无需浏览器逐个解析。

1. 在**同一个高德应用**下「添加」新 Key
2. **服务平台 选「Web 服务」**（注意：与上面的「Web端(JS API)」是两种类型，不能混用；用错会报 `USERKEY_PLAT_NOMATCH`）
3. 把生成的 Key 填入 `.env` 的 `AMAP_WEB_KEY`（若开启了「数字签名」，私钥填 `AMAP_WEB_SECRET`）
4. 运行批量解析（已导入的数据会自动补全缺坐标的活动）：
   ```bash
   npm run geocode
   ```
5. 极少数解析失败的活动，可在网站上以管理员身份点「📍 补全坐标」重试，或手动「在地图上选点」补全。

---

## 📥 导入数据（Excel / CSV / 腾讯文档）

把你的表格整理成下列列（中英文列名都可自动识别，缺列也无妨）：

| 列名 | 含义 | 必填 |
|------|------|------|
| 名称 / 标题 | 漫展名称 | ✅ |
| 城市 / 省份 | 所在地 | 建议 |
| 场馆 / 地址 | 定位用 | 建议 |
| 开始日期 / 结束日期 | 用于状态计算 | 建议（YYYY-MM-DD） |
| 经度 / 纬度 | 精确坐标；缺省可填地址自动解析 | 可选 |
| 主办 / 来源链接 / 海报链接 / 介绍 / 标签 / 核实 | 详情字段 | 可选 |

命令：
```bash
# 本地 Excel / CSV
node scripts/import_excel.js data/你的表格.xlsx
node scripts/import_excel.js data/你的表格.csv

# 腾讯文档：在腾讯文档里「下载 / 导出为 CSV」，把 CSV 链接（公开可访问）传给脚本
node scripts/import_excel.js "https://docs.qq.com/.../export.csv"

# 导入时同时用「Web 服务」Key 补全坐标（需已配置 AMAP_WEB_KEY）
node scripts/import_excel.js data/你的表格.csv --geocode

# 更常用的做法：导入后单独批量解析全部缺坐标活动
npm run geocode

# 先清空旧数据再导入
node scripts/import_excel.js data/你的表格.xlsx --clear
```

> **腾讯文档同步说明**：腾讯文档本身没有免鉴权的公开读取 API。最稳妥的做法是「导出为 CSV」后用上面的链接 / 文件导入；脚本也提供 `--geocode` 自动补坐标。若需要真正的实时同步，可后续接入腾讯文档开放 API（需 OAuth 授权）。

导入的示例数据见 `data/sample_conventions.csv`，可直接体验：
```bash
node scripts/import_excel.js data/sample_conventions.csv
```

---

## 👤 账户与权限

- 注册即获得身份；**首位注册的用户自动成为管理员**（可导入、可编辑 / 删除任意活动）
- 普通用户可提交新漫展，并编辑 / 删除自己提交的活动
- 会话用 HMAC 签名 Cookie 维持，密码以 scrypt 加盐哈希存储

---

## 📁 目录结构

```
webdemo/
├── server/
│   ├── index.js     # Express 服务：路由 + 静态托管 + .env 注入
│   ├── db.js        # SQLite 数据层（users / conventions）
│   ├── auth.js      # 注册 / 登录 / 会话
│   └── geocode.js   # 高德地理编码（补全坐标）
├── public/
│   ├── index.html
│   ├── css/style.css   # 明日方舟风格主题
│   └── js/app.js       # 地图 / 列表 / 详情 / 账户 / 提交
├── scripts/
│   └── import_excel.js # Excel/CSV/腾讯文档 CSV 导入
├── data/
│   ├── app.db            # SQLite 数据库（运行时生成）
│   └── sample_conventions.csv
├── .env.example
└── README.md
```

---

## 🌐 部署到公网

> ⚠️ **重要前提**：本项目是**全栈应用**（Node + SQLite + 登录认证），不是纯静态页。
> 常见的一键「静态托管」（如 CloudStudio 静态部署、GitHub Pages、Vercel 静态模式）**只能托管前端文件，跑不了后端 API 与数据库**——那样页面能打开，但地图标记加载不了、也无法提交 / 登录。务必选择**能运行 Node 进程**的宿主。

### 方案 A：云服务器 / 轻量应用服务器（Docker，最稳，推荐）

数据库以单文件 `data/app.db` 形式存在，挂载卷后重启不丢，最适合长期运营。

```bash
# 1. 把项目传到服务器（git clone 或 scp）
# 2. 准备生产环境变量：在同目录新建 .env（不要提交进 git），填入
#    SESSION_SECRET=一段随机长串
#    AMAP_KEY=你的JS_API_Key
#    AMAP_SECURITY_CODE=你的安全密钥
#    AMAP_WEB_KEY=你的Web服务Key
# 3. 构建并后台运行
docker compose up -d --build
# 4. 访问 http://服务器IP:3000
```

- 改端口：修改 `docker-compose.yml` 里的 `"3000:3000"`（前面是宿主机端口）
- 备份数据库：`cp data/app.db data/app.db.bak`（或定期打包该文件）
- 反代 + HTTPS（可选）：在前面套 Nginx / Caddy，把 80/443 反代到 3000，并配置证书

### 方案 B：Railway / Render 等 Git 部署平台（最快上手）

1. 把项目推到 GitHub
2. 在平台新建项目 → 连仓库 → **Start command 填 `npm start`**
3. 在平台环境变量里设置：`PORT`（平台会给）、`SESSION_SECRET`、`AMAP_KEY`、`AMAP_SECURITY_CODE`、`AMAP_WEB_KEY`
4. 部署完成后平台给一个公网域名

⚠️ **SQLite 持久化注意**：Railway / Render 的免费实例文件系统**重启 / 重新部署时可能被清空**，会丢数据库。两种对策：
- 用平台提供的**持久化磁盘 / Volume** 并把 `DB_PATH` 指向挂载目录（如 `/data/app.db`）
- 或后续把数据库迁移到托管 Postgres（需在 `server/db.js` 换驱动，可另行安排）

### 方案 C：腾讯云 CloudStudio（开发容器方式）

CloudStudio 的工作空间本质是带终端的真实容器，可以跑 Node，但**要用终端手动启动**，而非它的「静态部署」按钮：

1. 在 CloudStudio 新建 Node 工作空间，导入本项目
2. 打开终端执行：
   ```bash
   npm install
   # 把 .env 内容填好（同本地，含 AMAP_* 与强随机 SESSION_SECRET）
   npm start
   ```
3. 用 CloudStudio 的**端口转发 / 公网访问**功能把 3000 端口暴露出去
4. 注意：工作空间休眠 / 销毁会丢数据，长期运营建议改用方案 A 的云服务器

### 环境变量清单（上线前必填）

| 变量 | 说明 | 备注 |
|------|------|------|
| `PORT` | 监听端口 | 容器 / 平台一般自动给，默认 3000 |
| `SESSION_SECRET` | 会话签名密钥 | **务必改成随机长串**，否则会话可被伪造 |
| `AMAP_KEY` | 高德 Web 端(JS API) Key | 前端地图 |
| `AMAP_SECURITY_CODE` | 高德安全密钥 | 配 JS API Key |
| `AMAP_WEB_KEY` | 高德 Web 服务 Key | 服务端批量解析坐标（首屏秒出标记） |
| `AMAP_WEB_SECRET` | Web 服务数字签名私钥 | 仅当开启了数字签名才填 |
| `DB_PATH` | 数据库文件路径 | 可选，默认 `data/app.db`；挂载盘时改这里 |

- 本地开发：`npm start` 即可（沿用 `.env`）
- 数据库为单文件 `data/app.db`，备份时复制该文件即可

---

## 💡 可扩展方向

- 活动图片上传（当前用图片 URL，可加 OSS / 本地上传）
- 评论 / 打卡 / 收藏
- 管理员审核流（标记 `verified`）
- 真正的腾讯文档实时同步（开放 API + 定时任务）
- 移动端 PWA / 小程序
