# 04-DB 使用文档（Mongoose）

## 1. 连接方式与位置

- 连接文件：`server/db/db.js`
- ODM：Mongoose（依赖版本见 `server/package.json`）

当前连接方式：

- `mongoose.connect('mongodb://.../userInfo')`

注意：目前连接字符串为硬编码（包含账号密码与 IP）。

建议（后续改进方向）：

- 使用 `.env` 管理，例如 `MONGODB_URI=mongodb://...`
- 在 `server/db/db.js` 使用 `process.env.MONGODB_URI`

## 2. 数据模型位置

模型集中在 `server/db/`：

- `User.js`：用户信息（collection: `userInfo`）
- `loginDB.js`：登录账号（collection: `login`）
- `images.js`：文件信息（collection: 默认由 model 名推导，当前 model 名为 `File`）

## 3. 各集合（collection）字段说明

### 3.1 用户信息：`userInfo`

文件：`server/db/User.js`

- `name: String`
- `age: Number`
- `interests: String[]`

Schema 选项：

- `strict: false`：允许写入 Schema 未定义字段
- `versionKey: false`：不写 `__v`
- `collection: 'userInfo'`：固定集合名

与接口对应：

- `GET /home/userInfo/getAllUserInfo`
- `POST /home/userInfo/new`
- `POST /home/userInfo/edit`
- `POST /home/userInfo/delete`

注意：接口的 edit/delete 使用 `{ id }` 作为查询条件；数据库文档是否存在 `id` 字段取决于历史数据（Schema 本身未定义）。

### 3.2 登录账号：`login`

文件：`server/db/loginDB.js`

- `account: String`
- `password: String`

Schema 选项同上（`strict: false`，`versionKey: false`，collection 固定为 `login`）。

与接口对应：

- `POST /login/register`
- `POST /login/login`

注意：密码当前是明文保存（无 hash）。如果要用于真实生产环境，建议引入密码 hash（bcrypt 等）并增加强度校验。

### 3.3 文件信息：`File`

文件：`server/db/images.js`

字段：

- `serialNumber: Number`（unique；在 pre-save 中自动生成）
- `fileName: String`（required）
- `filePath: String`（required；远程服务器路径）
- `fileSize: Number`（required）
- `mimeType: String`
- `uploadTime: Date`（default: now）
- `imageHeight: Number`（用于前端瀑布流高度等展示）

与接口对应：

- `POST /file/upload`
- `POST /file/upload-batch`
- `DELETE /file/delete/:identifier`
- `GET /file/list`

注意：

- `serialNumber` 生成逻辑在 route 中也做了一次（并且 schema 中也有 pre-save）；如需统一行为，建议只保留一处。

## 4. 本地开发建议

- 如果你没有远程 MongoDB 权限，建议用本地 MongoDB：
  - 把连接串改为 `mongodb://localhost:27017/userInfo`（或通过 `.env` 切换）。
- 确保 Node 版本满足 `server/package.json` 的 `engines`，避免 Mongoose/ESM 兼容问题。
