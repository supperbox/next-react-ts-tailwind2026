# 基于 Next.js 的个人博客系统（项目介绍 / 架构 / 原理 / 演进）

本文档是本仓库“个人博客系统”的主说明文档：从目标、目录结构、内容生产链路（Markdown/MDX → 页面）、到性能与 SEO 的实现方式。

> 约定：本文尽量描述“现状 + 原理 + 可演进方向”。后续每次新增功能，都应更新本文对应章节（见 [docs-maintenance.md](./docs-maintenance.md)）。

## 1. 项目目标与范围

### 1.1 目标

- 使用 Next.js（App Router）+ TypeScript + Tailwind CSS 构建个人博客
- 文章内容以 Markdown/MDX 文件管理（本地内容仓库）
- 支持：分类/标签、全文搜索、目录（TOC）、阅读进度、评论（Giscus）、深色模式、基础 SEO（metadata/JSON-LD/RSS）
- 构建策略：优先使用静态生成（SSG）提升性能

### 1.2 非目标（当前阶段不做）

- 不提供后台管理（写作/发布/编辑在本地完成）
- 不引入数据库与鉴权
- 不做复杂主题系统（以 shadcn/ui 的 token/变量体系为基础）

## 2. 技术栈与选型理由（简述）

- Next.js（App Router）：文件路由 + SSG 能力 + SEO 友好
- TypeScript：类型约束与可维护性
- Tailwind CSS + shadcn/ui：一致的设计 token 与组件可复用
- Markdown/MDX：内容与代码同仓库，适合博客/文档
- `gray-matter`：解析 frontmatter
- `next-mdx-remote/rsc`：在 App Router 下渲染 MDX（RSC 方案）
- `rehype-pretty-code` + Shiki：代码高亮
- FlexSearch：本地全文搜索（客户端索引）
- Giscus：基于 GitHub Discussions 的评论系统
- `next-themes`：深色/浅色/跟随系统

## 3. 目录结构与模块分层

### 3.1 内容目录（文章源）

- `src/content/posts/`
  - 每篇文章一个 `.md` 或 `.mdx` 文件
  - 通过 frontmatter 维护元信息（title/date/tags/category/summary 等）

示例：

- `src/content/posts/hello-world.mdx`
- `src/content/posts/mdx-guide.mdx`

### 3.2 内容层（读取/解析/聚合）

- `src/lib/posts.ts`
  - 读取 `src/content/posts` 下的文件
  - `gray-matter` 解析 frontmatter
  - 输出：
    - 列表数据 `PostListItem[]`（用于列表/标签/归档）
    - 详情数据 `PostDetail`（用于文章页渲染）
  - 衍生能力：
    - 阅读时长（`reading-time`）
    - 目录 headings 抽取（用于 TOC 与滚动高亮）

### 3.3 渲染层（MDX → React）

- `src/lib/mdx.ts`

  - 使用 `compileMDX` 编译并渲染 MDX
  - 插件链（核心目的）：
    - `remark-gfm`：GFM（表格/任务列表等）
    - `rehype-slug`：为标题生成 id（锚点）
    - `rehype-autolink-headings`：标题可点击跳转
    - `rehype-pretty-code`：代码块高亮

- `src/components/mdx-components.tsx`
  - 定义 MDX 的组件映射（例如 link、pre/code 的统一样式）

> 设计要点：
>
> - “标题的 id”由 rehype-slug 决定；TOC 的 heading 提取应尽量匹配同一套 slug 规则（当前使用 `github-slugger` 对齐）。

## 4. 页面结构（路由地图）

> 说明：路由都在 `src/app` 下，以 App Router 约定组织。

- `/`：首页（站点介绍/精选/最新/标签云占位）
- `/blog`：文章列表（包含搜索 + 分类/标签筛选）
- `/blog/[slug]`：文章详情（MDX 渲染、TOC、阅读进度、评论、JSON-LD）
- `/tags`：标签总览
- `/tags/[tag]`：某标签下的文章列表
- `/archive`：按年份归档
- `/about`：关于
- `/projects`：项目
- `/rss.xml`：RSS 输出（route handler）

## 5. 核心功能的实现原理

### 5.1 静态生成（SSG）

- 文章详情页 `/blog/[slug]` 通过：
  - `generateStaticParams()` 读取全部 slug
  - `export const dynamicParams = false` 限制仅生成已知 slug
- 标签页 `/tags/[tag]` 同理：根据现有标签集合生成静态参数

这意味着：

- 文章/标签新增后，**需要重新构建部署** 才会出现在生产站点。

### 5.2 目录（TOC）与滚动高亮

- `src/lib/posts.ts` 会从 Markdown 内容中抽取 `##` 与 `###` 两级标题，生成 `headings` 数组
- 文章页面渲染时：
  - 将 `headings` 传给 `TableOfContents`
  - `TableOfContents` 使用 `IntersectionObserver` 观察标题元素进入视口，更新 `activeId`

### 5.3 阅读进度条

- `src/components/reading-progress.tsx` 在客户端监听滚动
- 用 `scrollTop / (scrollHeight - clientHeight)` 计算阅读进度（0-100%）

### 5.4 评论系统（Giscus）

- `src/components/giscus-comments.tsx` 作为 Client Component
- 通过环境变量注入配置（`NEXT_PUBLIC_GISCUS_*`），缺失则显示提示
- mapping 采用 `pathname`：同一路径映射到同一个 Discussion 线程

### 5.5 本地搜索（FlexSearch）

- 当前实现：在 `/blog` 列表页的 Client 组件内创建 FlexSearch 索引
- 索引内容来源：标题/摘要/分类/标签拼接文本

> 取舍：
>
> - 优点：无需服务端与外部依赖，上线简单。
> - 注意：文章很多时，客户端构建索引会增加首次渲染开销；后续可演进为“构建期生成索引 JSON + 客户端加载”。

## 6. SEO 输出（现状）

- `generateMetadata`：文章详情页动态生成 title/description
- JSON-LD：文章详情页注入 `BlogPosting` 结构化数据
- RSS：`src/app/rss.xml/route.ts` 输出 `application/rss+xml`

后续可扩展：

- `sitemap.ts`/`robots.txt`
- Open Graph 图片生成（`opengraph-image.tsx`）

## 7. 性能与工程化要点

- App Router 默认 RSC：页面尽量保持 Server Component
- 交互逻辑下沉到 Client Component（如搜索、TOC、进度条、评论）
- 生产构建交给 `next build`；开发模式使用 Next 的 dev server（启动日志可显示 Turbopack）

## 8. 发展脉络（演进记录）

### 阶段 0：工程底座

- Next.js + TS + Tailwind + shadcn/ui
- 基础 Provider（Query 等）与示例组件

### 阶段 1：站点壳（Layout）与主题

- Header/Nav/Footer
- 深色/浅色模式（`next-themes`）

### 阶段 2：内容层与博客主链路

- `src/content/posts` 作为内容源
- `posts.ts` 解析 frontmatter、生成列表/详情、TOC headings
- `/blog`、`/blog/[slug]`、`/tags`、`/archive`、`/rss.xml`

> 新增功能后，请按 [docs-maintenance.md](./docs-maintenance.md) 同步更新本文相关章节。
