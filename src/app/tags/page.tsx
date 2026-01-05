export const metadata = {
  title: "标签",
};

import Link from "next/link";

import { getAllTags } from "@/lib/posts";

/**
 * /tags 标签总览页（Server Component）
 *
 * 数据来源：`getAllTags()` 会扫描所有文章 frontmatter.tags 并聚合计数。
 * 跳转：点击后进入 `/tags/[tag]`，tag 通过 encodeURIComponent 编码，避免特殊字符导致路由问题。
 */

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">标签</h1>
        <p className="text-sm text-muted-foreground">
          展示所有标签；点击标签进入该标签下的文章列表。
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((t) => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className="rounded-md border bg-card p-4 hover:bg-accent transition-colors"
          >
            <div className="font-semibold">#{t.tag}</div>
            <div className="text-sm text-muted-foreground">{t.count} 篇</div>
          </Link>
        ))}

        {tags.length === 0 ? (
          <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
            暂无标签（先添加文章 Frontmatter 的 tags 字段）。
          </div>
        ) : null}
      </section>
    </div>
  );
}
