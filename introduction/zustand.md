# Zustand 使用文档（本项目）

本文档介绍本项目中 Zustand 的定位、代码组织方式、以及推荐写法。

## 1. Zustand 解决什么问题

Zustand 主要用于“纯前端全局状态（Global Client State）”，典型场景：

- UI 级全局开关：侧边栏展开/收起、全局 Loading、弹窗开关
- 轻量业务状态：草稿、筛选条件、分页参数（如果不希望写到 URL）
- 跨组件共享的交互状态：例如多处需要读写同一份计数/选中项

不推荐用 Zustand 管理“后端数据缓存与同步”（例如列表数据、详情数据）。这类更适合 TanStack Query，因为 Query 更擅长缓存、失效、重试、刷新、并发等。

## 2. 本项目中 Zustand 的落点

- Store 目录：`src/stores/*`
- 示例 Store：
  - [src/stores/counter-store.ts](../src/stores/counter-store.ts)

该文件实现了一个最小的 counter 状态：

- `count`：当前计数
- `increment/decrement/reset`：动作（actions）

## 3. 推荐的使用方式（selector 订阅）

在组件中使用 Zustand 时，建议通过 selector 订阅需要的字段：

```ts
const count = useCounterStore((s) => s.count);
const increment = useCounterStore((s) => s.increment);
```

好处：

- 只在订阅字段变化时触发重渲染
- 更清晰地表达组件依赖哪些状态

示例：本项目 Demo 中的用法

- [src/app/\_components/demo.tsx](../src/app/_components/demo.tsx)

## 3.5 设计理念与优势（为什么它“看起来简单但能力很强”）

Zustand 的核心理念是：**用尽可能少的抽象，把 React 组件需要的“全局可共享状态”做对（可读、可写、可订阅、可扩展）**。

### 3.5.1 设计理念

- **状态就是普通对象（Plain JS Object）**：store 里放的就是一份普通数据结构，不需要 action type、reducer、immutability 约束等额外规则；写起来更接近“业务本身”。
- **Hook 即入口（Hook-first）**：通过 `useXxxStore(selector)` 直接在组件里取数据/动作，符合 React Hooks 的心智模型。
- **按需订阅（Selector subscription）**：组件只订阅自己需要的那一小块状态；状态变化时，只影响订阅到变化片段的组件。
- **无 Provider 的全局单例（No Provider）**：store 通常是模块级单例导出，不需要在组件树顶层额外包裹 Provider（在 App Router 下也更省心）。
- **可选的中间件扩展（Opt-in middleware）**：持久化、devtools、immer 等都按需加，不把复杂度强塞给所有场景。

### 3.5.2 优势在哪里

- **心智负担低**：相比 Redux/Context 体系，几乎没有额外概念；相比“自己封装 Context + useReducer”，也少了样板代码。
- **性能与渲染更可控**：推荐 selector 写法时，能把重渲染范围压到最小；这也是它能在中大型应用里仍保持流畅的关键。
- **模块化拆分自然**：一个业务域一个 store（`auth-store`/`ui-store`/`cart-store`），更接近 Pinia“按 store 切片”的组织方式。
- **对 Next.js App Router 友好**：只要在 Client Component 中使用即可；不要求把 Provider 塞进根布局（当然你也可以选择统一的入口管理）。

### 3.5.3 和 Pinia 的“相似点/不同点”（帮助建立直觉）

- **相似点**：
  - 都鼓励“按业务域拆 store”，调用方用 `store.xxx`（Zustand 是 `useStore((s) => s.xxx)`）
  - 都支持插件/中间件式扩展（devtools、持久化等）
- **不同点（也是你觉得复杂的来源）**：
  - Pinia 的“响应式追踪”更自动；Zustand 更偏“显式订阅”，需要你写 selector（但也因此性能边界更清晰）
  - Pinia 依托 Vue 的 reactivity；Zustand 则用 `useSyncExternalStore` 的思路与 React 对齐

## 4. 设计建议

### 4.1 Store 粒度

- 按业务域拆分（例如 `auth-store`、`ui-store`、`cart-store`）
- 避免在一个 store 内塞入所有状态（难维护/难定位变更）

### 4.2 Action 命名

- 用动词：`setUser`、`toggleSidebar`、`reset`
- 让调用方只表达“意图”，不要在组件里手写太多 set 逻辑

### 4.3 与 App Router 的边界

- 使用 Zustand 的组件必须是 Client Component（文件顶端需要 `"use client"` 或者被 Client 组件引用）
- 根布局默认是 Server Component，因此全局状态不要在 `layout.tsx` 里直接使用 hooks

## 5. 常见扩展（示例代码）

### 5.1 UI Store（例如主题/侧边栏）

```ts
import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### 5.2 持久化（可选）

如果未来需要把部分状态持久化到 localStorage（例如主题），可使用 Zustand middleware（如 `persist`）。本项目目前没有启用，建议按需引入。

## 6. 何时不该用 Zustand

- 需要请求缓存、失效、重试、刷新：用 TanStack Query
- 需要把状态映射到 URL（可分享/可刷新保留）：优先用 URL Search Params（Next.js App Router）
