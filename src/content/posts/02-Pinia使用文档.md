# 02-Pinia 使用文档

## 1. Pinia 在项目中的位置

- 注册位置：`Vue/src/main.ts`
- Store 目录：`Vue/src/stores/`
  - `loginStore.js`：登录状态（token、记住我）
  - `common.js`：全局错误弹窗状态
  - `userInfo.js` / `userInfo.ts`：用户信息相关（按实际业务使用）

## 2. Store 写法约定

项目使用 Options Store 写法（`defineStore(name, { state, actions })`），示例：`Vue/src/stores/loginStore.js`。

### 2.1 loginStore（现状）

- state：
  - `token`：JWT token（仅内存态；刷新页面会丢失）
  - `username/password`：用于“记住我”
- actions：
  - `login(data)`：调用 `Vue/src/api/loginApi.js` 的 `login`
  - `register(data)`：调用 `register`
  - `logout()`：清空 token

前端请求是否携带 token 取决于：

- `Vue/src/api/request.js` 的请求拦截器是否拿到 `loginStore.token`

### 2.2 commonStore（现状）

- 用于全局错误展示：`showErr / errMsg / errCode`
- `request.js` 在异常时会调用 `commonStore.setError(...)`

## 3. 组件中如何使用

### 3.1 setup 中使用

- 直接调用：
  - `const loginStore = useLoginStore()`
  - `await loginStore.login({ account, password })`

### 3.2 “记住我”示例（项目内已有）

见 `Vue/src/views/login.vue`：

- 记住：把输入的账号密码写入 `loginStore.username/password`
- 页面加载时（`onMounted`）：如果 store 里有值就回填表单

## 4. 常见注意事项（结合本项目）

- token 持久化：当前没有使用 `pinia-plugin-persistedstate`；如果需要“刷新不掉登录态”，需要引入插件或手写 localStorage 同步。
- action 的职责边界：建议 action 只做“调用 API + 更新 store”，UI（弹窗/跳转）由页面组件负责（当前登录页就是这种模式）。
- 与 Auto Import 配合：很多地方 `defineStore/ref/onMounted` 等可能没有显式 import，这是由 `unplugin-auto-import` 提供的能力。
