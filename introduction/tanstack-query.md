# TanStack Query 使用文档（本项目）

本文档介绍本项目如何接入 TanStack Query（@tanstack/react-query）、推荐的数据流分层，以及在 Next.js App Router 下的注意事项。

## 1. TanStack Query 解决什么问题

TanStack Query 主要用于“后端数据状态（Server State）”的管理：

- 请求缓存（cache）与自动复用
- 失效与刷新（invalidate/refetch）
- 重试、错误状态、loading 状态管理
- 并发请求与去重

它不负责替代 Zustand（纯前端全局状态）或 React Hook Form（表单输入状态）。

## 2. 本项目中的接入点

### 2.1 全局 Provider

本项目将 QueryClientProvider 放在全局 Providers 中：

- [src/app/providers.tsx](../src/app/providers.tsx)

关键点：

- 该文件是 Client Component（`"use client"`）
- `QueryClient` 使用 `React.useState(() => new QueryClient())` 创建，保证在客户端生命周期内只创建一次

### 2.2 使用示例

Demo 组件中通过 `useQuery` 发起“模拟请求”：

- [src/app/\_components/demo.tsx](../src/app/_components/demo.tsx)

示例要点：

- `queryKey`：定义缓存维度（例如 `["users", userId]`）
- `queryFn`：封装真实 API 调用（本项目 demo 目前是 setTimeout 模拟）

## 3. 推荐的分层（真实项目建议）

为了让组件更干净、接口变更影响更小，推荐三层结构：

1. 请求适配层（fetch wrapper）

- 负责 baseURL、headers（鉴权）、错误码映射、超时、统一 JSON 解析

2. API 函数层（按业务域导出函数）

- 例如 `getProfile()`、`listOrders()`、`updateUser()`

3. Query 层（组件内）

- `useQuery`/`useMutation`
- 设计 queryKey、失效策略、乐观更新（按需）

本项目目前只做了第 3 层的最小演示，方便你后续补齐 1) 与 2)。

## 4. 在 App Router 下的注意事项

### 4.1 Client/Server 边界

- `useQuery` 是 React hook，只能在 Client Component 使用
- 因此：
  - 页面可以保持为 Server Component（例如 [src/app/page.tsx](../src/app/page.tsx)）
  - 真正使用 Query 的组件放在 Client Component 内（例如 [src/app/\_components/demo.tsx](../src/app/_components/demo.tsx)）

### 4.2 SSR/预取（可选）

本项目当前未开启 SSR 预取与 Hydration（保持最小集成）。

如果未来需要：

- 在 Server Component 预取数据
- 在 Client 侧 hydration

需要引入 `@tanstack/react-query` 的 SSR/Hydration 方案（例如 `dehydrate` / `HydrationBoundary` 等）。

## 5. 常见模式示例

### 5.1 列表查询

```ts
const usersQuery = useQuery({
  queryKey: ["users"],
  queryFn: () => api.listUsers(),
});
```

### 5.2 带参数的详情查询

```ts
const userQuery = useQuery({
  queryKey: ["users", userId],
  queryFn: () => api.getUser(userId),
  enabled: !!userId,
});
```

### 5.3 Mutation + 失效

```ts
const updateUser = useMutation({
  mutationFn: api.updateUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
});
```

## 6. 何时不用 TanStack Query

- 纯前端 UI 状态（开关、计数、选择项）：用 Zustand
- 表单输入状态与校验：用 React Hook Form + Zod
