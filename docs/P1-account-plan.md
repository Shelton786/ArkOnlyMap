# P1 方案文档：账户系统 + 角色权限体系

> 状态：**阶段 A 已实现（2026-07-18）**——身份核心（AMID/角色/邮箱登录名）+ 角色权限 + 审核流（双类型提交与合并）+ 前端账户中心 + 角色感知 UI 已全部上线。阶段 B（第三方 OAuth 绑定）与阶段 C（邮件验证 Resend）按原定计划暂缓。
> 适用范围：Arknights 同好集会地图（Cloudflare Pages + D1 + Hono）。
> 关联需求：邮箱登录 + QQ/微信/TG/鹰角通行证绑定；以「鹰角通行证号 或 AMID」确定用户身份；
> 角色：站点管理员(一切) / 管理员(大部分) / 主办(改自己+认领) / 舟友(提交待审核)。

---

## 0. 目标与非目标

**目标**

1. 每个用户有唯一、稳定的身份标识 **AMID**（站内）与可选的 **鹰角通行证号**（跨站）。
2. 支持多种登录/绑定方式：邮箱密码、QQ、微信、Telegram、鹰角通行证。
3. 建立四级角色与对应权限，且「舟友提交 → 管理员审核」的审核流上线。
4. 主办可对自己提交的或被认领的活动拥有编辑权。

**非目标（本期不做）**

- 站内私信、关注、动态流等社交功能。
- 支付、实名认证、风控防刷（仅做基础限制）。
- 已认领集会跳转主办主页（你此前标记为以后再做，P3）。

---

## 1. 身份模型（核心）

### 1.1 AMID —— 站内唯一身份号

- 每个账户创建时分配一个 **AMID**，格式 `AM-` + 8 位随机且不重复的数字，例如 `AM-01919810`。
- 存于 `users.amid`，**唯一索引**；它是系统内部一切关联（活动归属、主办认领、审核）的锚点。
- 对外展示用 AMID（例如「我的身份：AM-204817」），不暴露邮箱/第三方 UID。

### 1.2 鹰角通行证号 —— 跨站身份（关键现实说明）

> ⚠️ **重要前提**：截至目前，**鹰角通行证（Hypergryph/Yostar 账号）没有面向第三方的公开 OAuth 授权接口**。也就是说，我们无法像 QQ/微信那样「一键授权登录」。
> 
> 因此「鹰角通行证绑定」在本期采用 **手动填写 11 位 UID + 管理员发现错误后下架** 方案：
> 
> - 鹰角通行证号 = **11 位数字 ID**（如游戏内 UID），绑定表单做 `^\d{11}$` 格式校验。
> - 用户在账户页填入自己的 11 位 UID，系统存为一条 `provider='hypergryph'` 的绑定，默认 `verified=0`（仅表示「未经验证」，不阻塞绑定）。
> - **不要求管理员预先核验**：绑定即生效，展示徽章「鹰角通行证 已绑定」。
> - 管理员发现填错 / 冒用后，可在后台 **下架该绑定**（解除 `auth_identities` 记录，必要时对该账户做处理）。
> 
> 若未来鹰角开放 OAuth，只需在 `auth_identities` 上增加 OIDC 流程，模型无需改。

### 1.3 登录方式总览

| 方式       | 类型        | 可行性        | 依赖                                 |
| -------- | --------- | ---------- | ---------------------------------- |
| 邮箱 + 密码  | 自有        | ✅ 立即可做     | 邮箱验证需邮件服务（见 §6）                    |
| Telegram | OAuth 部件  | ✅ 最简单      | `TELEGRAM_BOT_TOKEN`（服务端校验 hash）   |
| QQ       | OAuth2    | ⚠️ 需注册应用   | `QQ_APPID` / `QQ_APPSECRET` + 回调域名 |
| 微信       | OAuth2    | ⚠️ 需注册应用   | `WX_APPID` / `WX_APPSECRET` + 回调域名 |
| 鹰角通行证    | 手动 UID 绑定 | ✅ 但无 OAuth | 无（自述 + 管理员核验）                      |

**设计原则**：一个账户可绑定多种登录方式（一个 `users` 行 + 多条 `auth_identities`）。
登录时按 `provider + provider_account_id` 找到对应 `users`；未登录时绑定则新建或合并账户。

---

## 2. 数据模型（D1 迁移）

新增迁移 `migrations/0002_accounts.sql`。

### 2.1 `users` 表（扩展）

```sql
ALTER TABLE users ADD COLUMN amid TEXT UNIQUE;
ALTER TABLE users ADD COLUMN email TEXT UNIQUE;          -- 登录标识，可空
ALTER TABLE users ADD COLUMN display_name TEXT;          -- 展示昵称，默认=username
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
-- role 取值范围扩展：site_admin / admin / organizer / user
```

> 保留 `username`（昵称，唯一）与 `password_hash`（OAuth-only 账户为 NULL）。

### 2.2 `auth_identities` 表（身份绑定）

```sql
CREATE TABLE auth_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,                 -- email / password / qq / wechat / telegram / hypergryph
  provider_account_id TEXT NOT NULL,      -- 外部 UID / 邮箱 / openid
  provider_username TEXT,                 -- 外部展示名
  verified INTEGER NOT NULL DEFAULT 0,
  extra TEXT,                             -- JSON：头像、unionid 等
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(provider, provider_account_id)
);
CREATE INDEX idx_ident_user ON auth_identities(user_id);
```

### 2.3 `conventions` 扩展（审核 + 主办认领）

```sql
ALTER TABLE conventions ADD COLUMN review_status TEXT NOT NULL DEFAULT 'approved';
-- approved（已确认·公开）/ pending（未确认·公开但标注）/ merged（已合并进原活动，不再单独展示）/ rejected（驳回·仅管理员可见）
ALTER TABLE conventions ADD COLUMN submission_type TEXT NOT NULL DEFAULT 'new';
-- new（新建活动）/ supplement（补充已有活动信息）
ALTER TABLE conventions ADD COLUMN parent_event_id INTEGER REFERENCES conventions(id);
-- supplement 类型指向被补充的原活动
-- 审核语义：
--  · 新建提交：管理员通过 → review_status='approved'（转为正式）
--  · 补充提交：管理员通过 → 将本行非空字段合并进 parent_event，本行 review_status='merged'（原活动保持 approved）
--  · 两者在通过前均对外公开，但标「未确认」
ALTER TABLE conventions ADD COLUMN organizer_user_id INTEGER REFERENCES users(id);
ALTER TABLE conventions ADD COLUMN organizer_claim_status TEXT NOT NULL DEFAULT 'none';
-- none / pending / approved
```

> `submitted_by`（提交人）保留；`organizer_user_id` 表示「认领并审核通过的主办」。

### 2.4 角色权限矩阵

| 操作              | site_admin   | admin                       | organizer     | user(舟友)          |
| --------------- | ------------ | --------------------------- | ------------- | ----------------- |
| 查看公开活动          | ✅            | ✅                           | ✅             | ✅                 |
| 提交新活动 / 补充信息   | 直接 approved  | 直接 approved                 | 直接 approved   | **→ pending（公开·未确认）** |
| 编辑自己提交的         | ✅            | ✅                           | ✅             | ✅                 |
| 编辑任意活动          | ✅            | ✅                           | 仅认领且 approved | ❌                 |
| 删除任意活动          | ✅            | ✅                           | 仅自己/认领        | ❌                 |
| 认领活动（请求）        | ✅            | ✅                           | ✅             | ✅（请求）             |
| 审核主办认领          | ✅            | ✅                           | ❌             | ❌                 |
| 审核舟友提交          | ✅            | ✅                           | ❌             | ❌                 |
| 管理用户/设角色        | 全部           | 仅 organizer/user（不可提 admin） | ❌             | ❌                 |
| 提他人为 site_admin | 仅 site_admin | ❌                           | ❌             | ❌                 |
| 绑定/解绑自身第三方      | ✅            | ✅                           | ✅             | ✅                 |
| 查看自身 AMID/资料    | ✅            | ✅                           | ✅             | ✅                 |

---

## 3. 后端 API 设计

### 3.1 认证

| 方法     | 路径                                   | 说明                                               |
| ------ | ------------------------------------ | ------------------------------------------------ |
| POST   | `/api/auth/register`                 | 邮箱+密码注册；自动分配 AMID；首位用户→site_admin                |
| POST   | `/api/auth/login`                    | 邮箱 **或** 昵称 + 密码                                 |
| POST   | `/api/auth/logout`                   | 清 cookie                                         |
| GET    | `/api/auth/me`                       | 返回完整资料：role、amid、email_verified、已绑定 providers 列表 |
| PUT    | `/api/auth/me`                       | 改 display_name、绑定/换邮箱                            |
| GET    | `/api/auth/oauth/:provider/url`      | 返回 QQ/微信/Telegram 授权地址（TG 用部件，可不调）               |
| POST   | `/api/auth/oauth/:provider/callback` | 处理回调：已登录→绑定；未登录→登录/建号                            |
| POST   | `/api/auth/link/:provider`           | 登录态下新增绑定（鹰角通行证走此，填 UID）                          |
| DELETE | `/api/auth/link/:provider`           | 解绑（至少保留一种登录方式）                                   |
| POST   | `/api/auth/email/send-verify`        | 发验证邮件（需邮件服务，见 §6）                                |
| POST   | `/api/auth/email/verify`             | 校验 token，置 email_verified=1                      |

### 3.2 活动与审核

| 方法         | 路径                              | 权限                                          |
| ---------- | ------------------------------- | ------------------------------------------- |
| POST       | `/api/events`                   | 登录即可；`user` 提交→`review_status='pending'`    |
| PUT/DELETE | `/api/events/:id`               | 复用新 `canEditEvent`（自己/认领/organizer+/admin+） |
| POST       | `/api/events/:id/claim`         | 任意登录用户请求认领（claim_status='pending'）          |
| POST       | `/api/events/:id/claim/approve` | site_admin/admin 审核认领                       |
| GET        | `/api/admin/review`             | 列出 pending 活动（site_admin/admin）             |
| POST       | `/api/admin/review/:id`         | 通过/驳回（body: {action:'approve'               |
| GET        | `/api/admin/users`              | 用户列表（site_admin；admin 可见 organizer/user）    |
| POST       | `/api/admin/users/:id/role`     | 改角色（site_admin 可设任意；admin 仅 organizer/user） |

> 公开列表 `/api/events` **默认返回 `review_status='approved'` 与 `'pending'`**（pending 标注「未确认」）；管理员加 `?review=all` 还可看 `rejected`/`merged`。
> 审核语义：pending「新建」→ 通过转 `approved`；pending「补充」(`submission_type='supplement'` 且带 `parent_event_id`) → 通过则合并进原活动并本行标记 `merged`（原活动保持 `approved`）。

### 3.3 权限辅助函数（重构 `auth.js`）

```
requireSiteAdmin / requireAdminOrAbove / requireOrganizerOrAbove / requireAuth
canEditEvent(user, event) = 自己提交 || organizer_claim approved || role>=organizer(自己提交) || role>=admin
isPendingSubmitter(role) = role==='user'
```

---

## 4. 前端改动

1. **账户中心面板**（新增）：展示 AMID、角色、邮箱验证状态、已绑定渠道徽章；按钮：绑定 QQ / 微信 / Telegram / 鹰角通行证、改昵称、登出。
2. **登录/注册弹窗扩展**：支持邮箱或昵称登录；注册填邮箱；一排「第三方登录」按钮；鹰角通行证填 UID 绑定入口。
3. **角色感知 UI**：
   - 舟友提交（新建或补充）后显示「已提交，等待管理员审核」；地图上以「未确认」样式出现（空心/半透明标记 + 列表「未确认」标签），审核通过后转为正式样式。
   - 活动详情出现「补充此集会信息」按钮（登录可见）：打开提交表单并预关联 `parent_event_id`，提交为 `supplement` 类型（pending）。supplement 在列表/地图标「未确认·补充」，可展开看相对原活动的差异。
   - 活动详情出现「认领此集会」按钮（登录可见）；主办/管理员见「审核认领」「编辑/删除」。
   - 管理员顶栏出现「审核队列」入口，角标显示待审数量。
4. **审核队列页**（管理员）：列表 pending 活动，逐条通过/驳回。
5. **用户管理页**（site_admin）：列表用户、改角色（受 §2.4 限制）。

---

## 5. 安全要点

- 密码继续用 `scrypt` 加盐；OAuth 用 **state 防 CSRF**，QQ/微信加 **PKIC/PKCE**。
- 会话 cookie：`HttpOnly; SameSite=Lax; Path=/`，HMAC 签名，30 天 TTL。
- 鹰角通行证绑定**不可密码学验证**→ 视为自述，一人一号、首绑优先，管理员可核验/解绑。
- 不向前端泄露他人邮箱、第三方 UID；`/api/auth/me` 仅返回自身资料。
- 角色校验全部在后端（前端隐藏按钮只是体验，不能替代服务端校验）。

---

## 6. 外部依赖与密钥（需你确认）

| 依赖                  | 用途        | 是否必需                | 密钥/变量                              |
| ------------------- | --------- | ------------------- | ---------------------------------- |
| **邮件服务（Resend）**     | 发验证邮件     | **先搁置**（用户暂无域名；待有域名再做，届时邮箱可作验证登录名） | `RESEND_API_KEY`、`MAIL_FROM`       |
| Telegram Bot Token  | TG 登录校验   | 做 TG 时必需            | `TELEGRAM_BOT_TOKEN`               |
| QQ 开放平台应用           | QQ 登录     | 做 QQ 时必需            | `QQ_APPID`/`QQ_APPSECRET` + 回调域名备案 |
| 微信开放平台应用            | 微信登录      | 做微信时必需              | `WX_APPID`/`WX_APPSECRET`          |
| 鹰角通行证               | 手动 UID 绑定 | 无需密钥                | —                                  |

> 全部密钥走 Cloudflare「变量和机密」，不进仓库（已有 `.gitignore` 与 `wrangler.toml` 机制保障）。

---

## 7. 迁移与回滚

- `0002_accounts.sql` 为**增量迁移**，兼容现有 `users`/`conventions`。
- **回填脚本** `scripts/backfill_accounts.mjs`：
  - 给所有现有 `users` 分配 AMID（保持 username 作 display_name）。
  - 首位用户→`site_admin`；其余→`user`。
  - 现有 `password_hash` 写成一条 `provider='password'` 的 identity，旧「昵称+密码」登录照常可用。
  - 现有活动 `review_status='approved'`、`organizer_claim_status='none'`。
- 回滚：迁移可逆（drop 新增列/表），但 AMID 一旦分配不建议回退。

---

## 8. 实现分期

- **阶段 A — 身份核心 + 角色 + 审核流（不依赖任何外部 OAuth）✅ 已实现（2026-07-18）**
  1. ✅ 迁移 `0002_accounts.sql` + 回溯脚本 `scripts/backfill_accounts.mjs`（本地 D1 验证 + 线上 D1 已执行；Doc→site_admin，全员分配 AMID）
  2. ✅ `auth.js`：AMID 分配、角色层级助手、邮箱/昵称登录、identity 表读写
  3. ✅ API：register(邮箱可选+分配AMID+首位site_admin) / login(邮箱或昵称) / me(GET/PUT) / events 提交待审(role=user→pending) / claim + claim/approve / admin/review(列表+通过/驳回/合并) / admin/users + role
  4. ✅ 前端：账户中心（AMID/角色/邮箱/昵称/鹰角UID/登出）、邮箱登录、角色感知 UI、提交待审态、未确认标记、补充提交、认领、审核队列、用户管理
- **阶段 B — 第三方绑定（暂缓）**
  5. Telegram（最快，签名校验）
  6. **QQ / 微信：写好完整路由与回调处理代码（框架），但默认不启用；密钥齐 + 自有已备案域名后开启**
  7. 鹰角通行证 UID 绑定（手动填 11 位 + 管理员发现错误后下架）—— 注：阶段 A 已包含手动 UID 绑定入口（账户中心），OAuth 化待阶段 B
- **阶段 C — 邮件验证（先搁置）**
  8. 邮箱验证（send-verify / verify + Resend 集成）暂缓；待用户有自有域名后再做。当前邮箱仅作可选登录名（注册时填、登录可用），不做验证。

---

## 9. 已拍板的关键决策（2026-07-18 用户确认）

1. **鹰角通行证**：采用「手动填 11 位 UID + 管理员发现错误后下架」，不做预先核验。
2. **邮件验证**：**先搁置**。用户暂无域名，Resend 发信无法激活；当前邮箱仅作可选登录名（注册填、登录可用），不做验证。待有自有域名后再做（阶段 C）。
3. **站长账户**：`Doc`（id=1，已注册为首位用户，当前 role=admin）在回溯脚本中提升为 `site_admin`。
4. **QQ/微信**：现在写好完整代码框架，但默认不启用，等备案域名 + 密钥齐后再开。
5. **AMID**：`AM-` + 8 位唯一号（与文档一致）。
6. **审核流（双类型）**：
   - **新建活动**：舟友提交→`pending` **公开但标注「未确认」**；管理员通过 = 转为正式（`review_status→approved`）。
   - **补充已有活动**：提交带 `parent_event_id`→`pending` 公开标注「未确认·补充」；管理员确认后把补充**合并进原活动**（原活动保持 `approved`，补充行标记 `merged` 不再单独展示）。
   - 两类在审核确认前他人均可见，但标「未确认」。

> ⚠️ **安全提示**：站长账户明文密码出现在聊天中。实现时**不写入任何文件 / 仓库**；`Doc` 已注册，回溯脚本仅提升角色、不动密码。建议上线后由站长自行改密。
> ⚠️ **pending 公开的设计权衡**：未确认集会（含补充）也会上图，地图可能被未确认标刷屏；前端须用明显不同的「未确认」样式（空心/半透明 + 列表标签）区分。接受此权衡。
> ⚠️ **合并语义**：补充通过的合并 = 将补充行中用户填写的非空字段覆盖到原活动对应字段（描述类字段追加）；审核弹窗对 supplement 展示差异预览，由管理员确认。
>
> **阶段 A 范围（当前可执行）**：迁移 + 回溯 + 身份核心（AMID / 角色 / 邮箱登录名）+ 角色权限 + 审核流（含双类型提交与合并）+ 前端账户中心 + 角色感知 UI。**邮件验证（Resend）与 QQ/微信 启用暂缓**。确认回复「开始阶段 A」即进入实现。
