export const metadata = {
  title: "归档",
};

import Link from "next/link";

import { getArchiveGroups } from "@/lib/posts";

/**
 * /archive 归档页（Server Component）
 *
 * 数据来源：`getArchiveGroups()` 会按年份把文章分组，便于按时间线浏览。
 */

export default function ArchivePage() {
  const groups = getArchiveGroups();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">归档</h1>
        <p className="text-sm text-muted-foreground">按时间线归档文章。</p>
      </header>

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.year} className="space-y-3">
            <h2 className="text-lg font-semibold">{g.year}</h2>
            <div className="grid gap-3">
              {g.posts.map((post) => (
                <article
                  key={post.slug}
                  className="rounded-md border bg-card p-4"
                >
                  <div className="text-sm text-muted-foreground">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("zh-CN")}
                    </time>
                    {post.category ? <> · {post.category}</> : null}
                  </div>
                  <h3 className="mt-1 font-semibold">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </article>
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 ? (
          <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
            暂无文章。
          </div>
        ) : null}
      </div>
    </div>
  );
}
