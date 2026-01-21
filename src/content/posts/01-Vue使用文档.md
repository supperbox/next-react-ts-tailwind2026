# 01-Vue 使用文档

## 1. 技术栈与关键依赖

- Vue：`Vue 3.x`
- 构建工具：`Vite`
- 状态管理：`Pinia`
- 路由：`vue-router`
- 样式：`TailwindCSS`
- HTTP：`axios`
- 自动导入：`unplugin-auto-import` / `unplugin-vue-components`

对应配置：`Vue/vite.config.ts`。

## 2. 启动与环境变量

在 `Vue/`：

- 安装：`pnpm install`
- 开发：`pnpm run dev`
- 构建：`pnpm run build-only`
- 预览：`pnpm run preview`

### Vite 代理

`Vue/vite.config.ts`：

- 前端请求统一走 `/api/*`
- 代理到 `VITE_API_BASE_URL`
- rewrite 去掉 `/api`

推荐本地新建 `Vue/.env.development`：

- `VITE_API_BASE_URL=http://localhost:3008`

## 3. 入口与目录约定

- 入口：`Vue/index.html` → `Vue/src/main.ts`
- 全局样式：`Vue/src/styles/global.css`（在 `main.ts` 引入）
- 路由：`Vue/src/router/router.js`
- 页面：`Vue/src/views/`
- 组件：`Vue/src/components/`
- API：`Vue/src/api/`
- Store：`Vue/src/stores/`

## 4. 路由结构（简述）

`Vue/src/router/router.js` 采用 Layout + 子路由：

- `/`：Layout 容器
  - `/home`：主页（`views/home.vue`）
  - `/userOverView`：用户概览
  - `/fileUpload`：文件上传
  - `/imagesShow`：图片展示
  - `/news`：新闻
- `/login`：登录页（`views/login.vue`）

如果要新增页面：

1. 在 `Vue/src/views/` 新建页面组件
2. 在 `Vue/src/router/router.js` 添加 route

## 5. API 调用方式（统一走 request）

### 5.1 request 封装

`Vue/src/api/request.js` 做了三件事：

- `baseURL: 'api'`，配合 Vite 代理
- 请求拦截：自动注入 `Authorization: Bearer <token>`
- 响应拦截：
  - 非 200 认为失败，并通过 `useCommonStore().setError(...)` 统一弹错
  - 成功默认返回 `response.data`

### 5.2 新增 API 模块的建议写法

参考现有：`Vue/src/api/newsApi.ts`、`Vue/src/api/loginApi.js`、`Vue/src/api/userApi.ts`。

推荐约定：

- 文件名：`xxxApi.ts` / `xxxApi.js`
- 只做“请求 + 返回 data”，不在 API 层做 UI 逻辑

## 6. 自动导入（重要约定）

项目启用了 `unplugin-auto-import`：`Vue/vite.config.ts`

- 自动导入：`vue`、`vue-router`、`pinia`，以及 `axios` 的默认导入
- 自动扫描目录：`./src/stores`、`./src/api`、`./src/utils`
- 类型声明：生成到 `Vue/types/auto-imports.d.ts`
- ESLint globals：生成到 `Vue/.eslintrc-auto-import.json`

因此你会在很多组件里看到：

- 没有显式 `import { onMounted } from 'vue'` 但仍可用

注意：

- `Vue/.eslintrc-auto-import.json`、`Vue/types/*.d.ts` 属于生成文件，一般不手改。

## 7. 错误展示机制

- 状态存储：`Vue/src/stores/common.js`
- UI 组件：`Vue/src/components/errorModal.vue`（按需在布局/页面中使用）

当 `request.js` 发现错误，会调用：

- `commonStore.setError(true, message, code)`

页面侧可根据 `showErr/errMsg` 来展示弹窗/提示。

## 8. 常见开发问题

- 请求没走代理：检查是否以 `/api` 开头；以及 `VITE_API_BASE_URL` 是否正确。
- 登录后仍提示未登录：检查 `loginStore.token` 是否写入；以及请求是否走 `request.js`（拦截器才会带 token）。
- `onMounted` 等未 import 却报错：检查 `unplugin-auto-import` 是否生效、`pnpm install` 是否完整、`types/auto-imports.d.ts` 是否生成。
