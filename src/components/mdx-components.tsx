import Link from "next/link";

/**
 * MDX 组件映射
 *
 * 目标：让文章里的常用元素（链接、代码块等）在渲染时具备一致的样式与行为。
 *
 * 约定：
 * - 站外链接：新窗口打开，并带上 rel 以避免安全问题。
 * - 站内链接：使用 Next `Link`，获得客户端导航与预取能力。
 */

export const mdxComponents = {
  a: ({ href, children, ...props }: any) => {
    const url = typeof href === "string" ? href : "";
    const isExternal = url.startsWith("http://") || url.startsWith("https://");

    if (isExternal) {
      // 站外链接：保持读者当前页面，打开新标签。
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
          {...props}
        >
          {children}
        </a>
      );
    }

    // 站内链接：交给 Next.js 路由处理。
    return (
      <Link href={url} className="underline underline-offset-4" {...props}>
        {children}
      </Link>
    );
  },
  pre: ({ children, ...props }: any) => (
    // 代码块容器：提供横向滚动与统一边框/背景。
    <pre className="overflow-x-auto rounded-md border bg-muted p-3" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }: any) => (
    // 行内 code：轻量样式，主要用于强调标识符。
    <code className="font-mono text-sm" {...props}>
      {children}
    </code>
  ),
};
