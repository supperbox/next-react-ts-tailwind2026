import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

import { mdxComponents } from "@/components/mdx-components";

/**
 * MDX 渲染（Server Side / 构建期）
 *
 * 目标：将文章正文（Markdown/MDX 字符串）编译为可在 App Router 的 Server Component 中直接渲染的内容。
 *
 * 说明：
 * - 数据读取/解析（frontmatter、tags、归档等）在 `src/lib/posts.ts`；这里只处理“正文编译”。
 * - 组件映射（a/pre/code 等）由 `src/components/mdx-components.tsx` 提供。
 */

export async function renderMdx(source: string) {
  // compileMDX 会在服务端把 MDX 编译为 React 结果（RSC 可用）。
  // 返回值中包含 `content`（ReactNode）以及可选的 `frontmatter`（若有配置）。
  return compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        // remark 插件：在 Markdown AST 阶段工作（如 GFM 表格/任务列表等）。
        remarkPlugins: [remarkGfm],
        // rehype 插件：在 HTML AST 阶段工作（如标题 id、代码高亮等）。
        rehypePlugins: [
          // 给标题生成 id，支持 #anchor 跳转
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              // wrap：用 <a> 把标题包起来，标题整体可点击跳转/复制
              behavior: "wrap",
              properties: {
                className: ["no-underline"],
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              // 根据主题（浅色/深色）选择不同高亮主题
              theme: {
                light: "github-light",
                dark: "github-dark",
              },
              // 不保留主题自带背景色，便于交给 Tailwind 的 bg-* 统一控制
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });
}
