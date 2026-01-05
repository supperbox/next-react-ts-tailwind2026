<!--
说明：
- 本文档是项目“架构说明/入门指南”。如果你更习惯把说明放在 README，也可以将本文视为 README 的镜像或补充。
- 该文档不影响构建与运行，仅用于帮助开发人员快速理解代码组织与数据流。
-->

本项目已从“工程骨架”演进为一个 **基于 Next.js（App Router）的个人博客系统**：文章内容以本地 Markdown/MDX 文件管理，页面以静态生成（SSG）为主，并逐步完善搜索、目录、评论与 SEO 能力。

建议优先阅读：

- [introduction/blog-system.md](./blog-system.md)：博客系统主文档（架构/原理/演进）
- [introduction/docs-maintenance.md](./docs-maintenance.md)：后续新增功能时的文档更新规范

## Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form + Zod

### 版本信息（来自 package.json）

- Next.js: 16.1.1
- React: 19.2.3

## 项目架构总览

### 目标与边界

- 目标：提供一个可直接发布与持续迭代的博客站点（内容层、SSG、标签/归档、MDX 渲染、目录/进度条、评论、RSS 与基础 SEO）
- 边界：不包含后台管理、鉴权、数据库；文章新增通过提交 Markdown/MDX 文件并重新构建部署实现

### 目录组织（当前实际结构）

- 应用入口与站点壳（App Router）
  - [src/app/layout.tsx](src/app/layout.tsx)：根布局（Server Component），挂载全局样式、字体、站点 Header/Footer 与 Providers
  - [src/app/providers.tsx](src/app/providers.tsx)：全局 Providers（Client Component），包含 next-themes 与 TanStack Query Provider
  - [src/components/site-header.tsx](../src/components/site-header.tsx)：站点导航与主题切换入口
  - [src/components/site-footer.tsx](../src/components/site-footer.tsx)：站点页脚
  - [src/components/theme-toggle.tsx](../src/components/theme-toggle.tsx)：深色/浅色/跟随系统切换
- 页面（路由）
  - [src/app/page.tsx](src/app/page.tsx)：首页（当前为站点骨架/占位）
  - [src/app/blog/page.tsx](../src/app/blog/page.tsx)：博客列表（含客户端搜索/筛选）
  - [src/app/blog/[slug]/page.tsx](../src/app/blog/[slug]/page.tsx)：博客详情（MDX、TOC、阅读进度、评论、JSON-LD）
  - [src/app/tags/page.tsx](../src/app/tags/page.tsx)：标签总览
  - [src/app/tags/[tag]/page.tsx](../src/app/tags/[tag]/page.tsx)：标签文章列表
  - [src/app/archive/page.tsx](../src/app/archive/page.tsx)：归档
  - [src/app/rss.xml/route.ts](../src/app/rss.xml/route.ts)：RSS 输出
- 内容层（文章数据）
  - [src/content/posts](../src/content/posts)：文章源文件（.md/.mdx + frontmatter）
  - [src/lib/posts.ts](../src/lib/posts.ts)：读取/解析/聚合文章数据（tags、归档、TOC headings、reading time）
  - [src/lib/mdx.ts](../src/lib/mdx.ts)：MDX 编译渲染管线（remark/rehype 插件）
- 文章增强（交互）
  - [src/components/reading-progress.tsx](../src/components/reading-progress.tsx)：阅读进度条
  - [src/app/blog/[slug]/\_components/table-of-contents.tsx](../src/app/blog/[slug]/_components/table-of-contents.tsx)：目录与滚动高亮
  - [src/components/giscus-comments.tsx](../src/components/giscus-comments.tsx)：评论（Giscus）
- 工程能力演示（历史/可选保留）
  - [src/app/\_components/demo.tsx](src/app/_components/demo.tsx)：演示 Zustand / React Query / RHF+Zod / shadcn/ui 的联动
- 业务状态（Zustand）
  - [src/stores/counter-store.ts](src/stores/counter-store.ts)：最小 counter store 示例
- UI 组件（shadcn/ui）
  - [src/components/ui/button.tsx](src/components/ui/button.tsx)
  - [src/components/ui/input.tsx](src/components/ui/input.tsx)
  - [src/components/ui/label.tsx](src/components/ui/label.tsx)
- 样式与主题
  - [src/app/globals.css](src/app/globals.css)：Tailwind v4 引入、shadcn/ui CSS variables 主题、基础 layer
- shadcn/ui 配置
  - [components.json](components.json)：shadcn/ui 的生成配置（别名、css 入口、style 等）

### 重要约定

- 路径别名：TypeScript 使用 `@/*` 指向 `src/*`（见 [tsconfig.json](tsconfig.json) 的 paths），shadcn/ui 同步写入到 [components.json](components.json)
- Server/Client 组件划分：
  - `app` 下默认是 Server Component
  - 需要 hooks、状态、事件处理的组件使用 `"use client"`（例如 [src/app/providers.tsx](src/app/providers.tsx)、[src/app/\_components/demo.tsx](src/app/_components/demo.tsx)）

## 页面结构分析（App Router）

### 根布局：全局能力挂载点

- 文件：[src/app/layout.tsx](src/app/layout.tsx)
- 作用：
  - 引入全局样式（[src/app/globals.css](src/app/globals.css)）
  - 配置字体并把字体变量挂到 body class
  - 将全局 Provider 包裹在应用最外层（主题 next-themes + React Query 等）

### 首页：站点入口（当前为骨架占位）

- 文件：[src/app/page.tsx](src/app/page.tsx)
- 作用：
  - 作为 Server Component 保持渲染开销小
  - 提供站点信息与内容入口（精选/最新/标签云将在后续与内容层对接）

### Demo：集成示例集中展示

- 文件：[src/app/\_components/demo.tsx](src/app/_components/demo.tsx)
- 说明：
  - 为 Client Component，集中演示三类“前端状态”的典型落点：
  - Server State：TanStack Query（请求缓存/同步）
  - Global Client State：Zustand（跨组件共享状态）
  - Local UI/Form State：React Hook Form（输入与校验状态）

## 数据管理与状态管理

### TanStack Query（Server State）

- Provider：
  - [src/app/providers.tsx](src/app/providers.tsx) 内创建 QueryClient，并通过 QueryClientProvider 注入
  - 当前采用 `React.useState(() => new QueryClient())` 确保每次客户端挂载只创建一次实例
- 调用位置：
  - [src/app/\_components/demo.tsx](src/app/_components/demo.tsx) 使用 `useQuery` 演示一次“模拟请求”（延迟后返回 ISO 时间字符串）
- 推荐实践（扩展真实接口时）：
  - 统一封装请求层（例如 `fetch` 包装、错误处理、鉴权 header），再在各自页面/组件使用 `useQuery`/`useMutation`
  - 通过 `queryKey` 设计缓存维度，并在 mutation 成功后 `invalidateQueries` 保持数据一致

### Zustand（Global Client State）

- 文件：[src/stores/counter-store.ts](src/stores/counter-store.ts)
- 特点：
  - 适合：登录态的轻量衍生信息、UI 全局开关、跨组件共享的交互状态等
  - 不适合：需要强一致缓存/失效策略的服务端数据（这类更推荐 TanStack Query）

### React Hook Form + Zod（表单状态与校验）

- 文件：[src/app/\_components/demo.tsx](src/app/_components/demo.tsx)
- 结构：
  - Zod：定义 schema（字段约束、错误信息）
  - RHF：负责输入状态、提交状态、错误收集
  - Resolver：使用 `@hookform/resolvers/zod` 让 RHF 直接消费 Zod 校验结果
- 推荐实践（扩展真实表单时）：
  - 将 schema 与类型集中在表单模块旁边（schema 作为单一事实来源），通过 `z.infer` 生成 TS 类型，避免重复定义

## 接口调用（请求层）建议

当前 Demo 的请求为本地模拟（见 [src/app/\_components/demo.tsx](src/app/_components/demo.tsx) 的 `useQuery`）。在接入真实后端时，建议采用以下分层：

1. 请求适配层（建议新增）：封装 `fetch`（baseUrl、headers、鉴权、错误码映射、超时等）
2. API 函数层（建议新增）：按业务域导出函数，例如 `getUserProfile()`、`updateProfile()`
3. Query 层：在组件中用 `useQuery`/`useMutation` 调用 API 函数，并做缓存键、失效策略、乐观更新等

这样做的好处是：组件更干净、可测试性更强、接口变更影响面更小。

## 样式体系与组件体系

### Tailwind v4

- 全局入口：[src/app/globals.css](src/app/globals.css)
- 说明：项目使用 Tailwind v4 的 `@import "tailwindcss";` 形态，并使用 `@layer base` 注入基础样式

### shadcn/ui

- 配置：[components.json](components.json)
- 组件目录：位于 `src/components/ui/*`
- 说明：
  - shadcn/ui 采用“复制组件源码到项目内”的方式，便于按需改造
  - 通用 className 合并工具 `cn` 位于 [src/lib/utils.ts](src/lib/utils.ts)

## 开发建议（如何扩展项目）

- 页面扩展：在 `src/app` 下新增路由段目录（例如新增一个 dashboard 路由段）
- 数据流建议：
  - 后端数据：优先 TanStack Query
  - 纯前端全局状态：Zustand
  - 表单输入与校验：React Hook Form + Zod
- Provider 扩展：如果后续增加主题、国际化、鉴权等，全局 Provider 仍建议集中在 [src/app/providers.tsx](src/app/providers.tsx)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

你可以从首页开始修改： [src/app/page.tsx](src/app/page.tsx)。页面会在开发模式下自动热更新。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 文档维护要求（非常重要）

后续每次新增功能，都需要同步更新 `introduction/` 的文档：具体清单见 [introduction/docs-maintenance.md](./docs-maintenance.md)。
