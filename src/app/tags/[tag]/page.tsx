import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllTags, getPostsByTag } from "@/lib/posts";

/**
 * /tags/[tag] 标签详情页（Server Component，SSG）
 *
 * 关键点：
 * - `dynamicParams = false` + `generateStaticParams()`：构建期为每个 tag 生成页面。
 * - tag 下没有文章时使用 `notFound()` 输出 404（避免空页面）。
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // 让 Next.js 在构建时为每个 tag 生成静态页面。
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  // 每个标签页独立标题
  const { tag } = await params;
  return {
    title: `标签：#${tag}`,
  };
}

export default async function TagPostsPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">标签：#{tag}</h1>
        <p className="text-sm text-muted-foreground">
          共 {posts.length} 篇文章
        </p>
      </header>

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-md border bg-card p-4">
            <div className="text-sm text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("zh-CN")}
              </time>
              {post.category ? <> · {post.category}</> : null}
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:underline underline-offset-4"
              >
                {post.title}
              </Link>
            </h2>

            {post.summary ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {post.summary}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
