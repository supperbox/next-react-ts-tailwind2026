# Next.js App Router 页面/语法文档（本项目）

本文档面向本项目使用的 Next.js App Router，帮助开发者快速理解“页面如何组织、哪些文件有什么语义、Server/Client 组件如何划分”。

## 1. App Router 的核心约定

在 App Router 中：

- `src/app` 是路由根目录（本项目使用了 `--src-dir`）
- 每一个目录代表一个“路由段（segment）”
- 通过特定文件名定义页面与布局

本项目的入口文件：

- 根布局：
  - [src/app/layout.tsx](../src/app/layout.tsx)
- 首页：
  - [src/app/page.tsx](../src/app/page.tsx)

本项目还包含典型的“内容型站点（博客）”路由：

- 列表页：
  - [src/app/blog/page.tsx](../src/app/blog/page.tsx)
- 详情页（动态路由 + 静态生成）：
  - [src/app/blog/[slug]/page.tsx](../src/app/blog/%5Bslug%5D/page.tsx)
- 标签页（动态路由 + 静态生成）：
  - [src/app/tags/[tag]/page.tsx](../src/app/tags/%5Btag%5D/page.tsx)
- 归档页：
  - [src/app/archive/page.tsx](../src/app/archive/page.tsx)
- Route Handler（RSS）：
  - [src/app/rss.xml/route.ts](../src/app/rss.xml/route.ts)

## 2. 文件约定（最常用）

- `layout.tsx`
  - 包裹该路由段下的所有页面
  - 适合放：全局样式、字体、Provider 注入点（通过 Client Providers 组件）
- `page.tsx`
  - 该路由段的页面入口
- `loading.tsx`
  - 该路由段的加载 UI（可选）
- `error.tsx`
  - 该路由段的错误边界 UI（可选，通常为 Client Component）
- `not-found.tsx`
  - 该路由段的 404 UI（可选）

另外一个常用文件约定是 **Route Handlers**：

- `route.ts`
  - 用于实现类似 API 的端点（但依旧在 App Router 体系下）
  - 本项目示例：RSS 输出 [src/app/rss.xml/route.ts](../src/app/rss.xml/route.ts)

## 3. Server Component 与 Client Component

### 3.1 默认是 Server Component

在 `app` 目录下，React 组件默认是 Server Component：

- 可以直接访问服务器资源（如数据库/私有 API）
- 渲染成本更低（适合页面骨架、静态内容、SEO）

本项目示例：

- [src/app/page.tsx](../src/app/page.tsx) 作为 Server Component，仅渲染一个 Client Demo

### 3.2 何时需要 Client Component

当组件需要：

- React hooks（`useState/useEffect/useQuery/useForm` 等）
- 浏览器 API（localStorage、window、事件监听）
- 交互逻辑（点击、输入、表单提交）

则必须在文件顶部声明：

```ts
"use client";
```

本项目示例：

- 全局 Providers（需要创建 QueryClient 并提供 context）：
  - [src/app/providers.tsx](../src/app/providers.tsx)
- Demo（使用 useQuery/useForm/useState/Zustand hooks）：
  - [src/app/\_components/demo.tsx](../src/app/_components/demo.tsx)

## 4. Provider 的推荐接入方式（本项目采用）

为什么不直接在 `layout.tsx` 里写 QueryClientProvider？

- `layout.tsx` 是 Server Component
- QueryClientProvider 必须在客户端创建 QueryClient

因此本项目采用：

- 在 `src/app/providers.tsx` 里集中写所有 client-only Providers
- 在 `src/app/layout.tsx` 中把 `<Providers>{children}</Providers>` 包起来

## 5. 路由扩展示例

如果你要新增一个 dashboard 页面：

- 新建目录：`src/app/dashboard/`
- 新建页面文件：`src/app/dashboard/page.tsx`

最小示例：

```tsx
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

## 6. 动态路由如何做静态生成（本项目博客示例）

在内容型站点中，常见需求是：

- URL 是动态的（例如 `/blog/[slug]`）
- 但希望在构建期生成静态页面（SSG）

本项目在 [src/app/blog/[slug]/page.tsx](../src/app/blog/%5Bslug%5D/page.tsx) 中采用：

- `generateStaticParams()`：返回所有可生成的 slug
- `export const dynamicParams = false`：限制只生成这些参数（未命中则 404）

标签页 [src/app/tags/[tag]/page.tsx](../src/app/tags/%5Btag%5D/page.tsx) 同理。

如果 dashboard 需要交互（hooks），则让页面或其子组件成为 Client Component。

## 7. 与样式体系的关系

- 全局样式入口：
  - [src/app/globals.css](../src/app/globals.css)
- 建议在 `layout.tsx` 中只引入一次全局样式

## 8. 本项目的最佳实践总结

- 页面尽量保持为 Server Component（更快、更清晰）
- 交互与状态逻辑下沉到 Client Component
- 全局 Provider 统一放在 `src/app/providers.tsx`
