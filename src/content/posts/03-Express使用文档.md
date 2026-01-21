# 03-Express 使用文档

## 1. 技术栈与运行方式

- Express：`^5.1.0`
- Node：要求见 `server/package.json` 的 `engines`
- 模块体系：ESM（`type: module`）

启动方式（在 `server/`）：

- 安装：`pnpm install`
- 开发启动：`pnpm run node`
- 生产（PM2）：`pnpm run start` / `restart` / `stop`

默认监听：`HOST=0.0.0.0`、`PORT=3008`（见 `server/server.js`）。

## 2. 入口与中间件

入口：`server/server.js`

包含：

- `express.json()`：解析 JSON
- `httpLoggerMiddleware`：HTTP 请求日志
- 可选 `cors()`：`ENABLE_CORS=true` 才启用
- 异常处理：`unhandledRejection` / `uncaughtException` 统一记录
- 静态资源：`/uploads` → `../uploads`
- 静态托管：若项目根存在 `dist/`，会 `express.static(dist)` 并对 `*` 回退到 `index.html`

## 3. 路由挂载与最终路径

`server/server.js`：

- `app.use('/home', userRoute)`
- `app.use('/login', loginRoute)`
- `app.use('/file', imageRoute)`
- `app.use('/update', updateExpressRoute)`
- `app.use('/news', newsRoute)`

因此对外路径 = 挂载前缀 + router 内部路径。

## 4. 接口清单（按模块）

### 4.1 用户信息（`/home`）

router：`server/expressRoutes/userExpress.js`

- `GET /home/userInfo/getAllUserInfo`：查询全部用户信息
- `POST /home/userInfo/new`：创建用户（body：`{ name, age, interests }`）
- `POST /home/userInfo/edit`：编辑用户（body：`{ id, name, age, interests }`）
- `POST /home/userInfo/delete`：删除用户（body：`{ id }`）

注意：

- 文件里虽然 import 了 `authMiddleware`，但当前未实际使用（接口默认不鉴权）。
- `edit/delete` 使用的是 `{ id: id }` 作为条件；而 `User` Schema 里定义字段是 `name/age/interests`，是否存在 `id` 取决于数据库实际文档。

### 4.2 登录（`/login`）

router：`server/expressRoutes/loginExpress.js`

- `POST /login/register`：注册（body：`{ account, password }`）→ 返回 `token`
- `POST /login/login`：登录（body：`{ account, password }`）→ 返回 `token`

鉴权中间件：

- `authMiddleware(req,res,next)`：读取 `Authorization: Bearer <token>`，失败返回 401（`code: 'reload'`）

注意：

- `JWT_SECRET` 目前为硬编码常量，文档建议迁移到环境变量（例如 `JWT_SECRET=...`）。
- Swagger 注释里使用了 `/auth/*` 路径，但实际对外路径是 `/login/*`（以 `server/server.js` 挂载为准）。

### 4.3 图片文件（`/file`）

router：`server/expressRoutes/imageExpress.js`

- `POST /file/upload`：单文件上传（form-data：`file`）
  - 服务端会转码为 `.webp` 并压缩
  - 同名检查：已存在则返回 409
- `POST /file/upload-batch`：批量上传（form-data：`files[]`，最多 500）
  - 已存在同名文件会被跳过（返回 `skipped` 列表）
- `DELETE /file/delete/:identifier`：删除（identifier 可为序列号或文件名）
- `GET /file/list?page=1&pageSize=20`：分页列表

注意：

- SFTP 连接信息当前在代码中硬编码（host/user/password），建议迁移为 `.env`。
- serialNumber 的生成在 route 中和 Mongoose pre-save 中都做了一遍（以最终落库为准）。

### 4.4 新闻聚合（`/news`）

router：`server/expressRoutes/newsExpress.js`

- `GET /news/list?tag=财经&source=bing&region=CN`
  - `tag`：关键词（前端把分类当关键词传）
  - `source`：`bing | toutiao | weibo`（默认 bing）
  - `region`：`CN | US | ALL | AUTO` 等
  - 返回会随机取 10 条
- `GET /news/detail?url=https://...`：抓取原文正文
  - 内置 SSRF 防护：禁止访问内网地址/localhost

## 5. 更新 webhook（`/update`）

router：`server/expressRoutes/updateExpress.js`

- `POST /update/updateExpress`
  - 生产环境（`NODE_ENV=production`）：执行 `scripts/update.sh`（或 `UPDATE_SCRIPT_PATH` 指定）
  - 本地环境：PowerShell 执行 `scripts/test-update.ps1`（或 `UPDATE_SCRIPT_LOCAL` 指定）

注意：

- token 校验逻辑目前被注释掉（`WEBHOOK_SECRET` 未强制验证）。如果要上线使用，建议恢复验证。

## 6. Swagger（当前未挂载）

仓库存在 `server/swagger.js` 且 `server/server.js` 已 import `setupSwagger`，但当前未调用。

如果你希望启用 Swagger UI，需要在 `server/server.js` 中显式调用（例如 `setupSwagger(app)`），并确认路由注释路径与实际挂载前缀一致。
