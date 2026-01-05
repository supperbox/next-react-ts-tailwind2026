import { notFound } from "next/navigation";

import { GiscusComments } from "@/components/giscus-comments";
import { ReadingProgress } from "@/components/reading-progress";
import { renderMdx } from "@/lib/mdx";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

import { TableOfContents } from "./_components/table-of-contents";

/**
 * /blog/[slug] 文章详情页（Server Component，SSG）
 *
 * 关键点：
 * - `dynamicParams = false` + `generateStaticParams()`：只允许已存在的 slug，并在构建期静态生成。
 * - `getPostBySlug()`：读取本地 MD/MDX 文件并解析 frontmatter。
 * - `renderMdx()`：把正文编译为可渲染内容（RSC）。
 * - `TableOfContents`/`ReadingProgress`/`GiscusComments` 是客户端增强功能。
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Next.js 会用这里返回的 params 列表在 build 阶段生成静态页面。
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 为每篇文章生成独立的 title/description（用于 SEO 与分享卡片）。
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.summary,
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    // slug 不存在时走 404
    notFound();
  }

  // MDX 编译：返回的 content 是可直接渲染的 ReactNode
  const { content } = await renderMdx(post.content);

  // 结构化数据（JSON-LD）：帮助搜索引擎理解页面是“文章”。
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    keywords: post.tags,
    articleSection: post.category ?? undefined,
    description: post.summary || undefined,
    inLanguage: "zh-CN",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ReadingProgress />

      <div className="px-4 py-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("zh-CN")}
              </time>
              <span>·</span>
              <span>{post.readingMinutes} 分钟阅读</span>
              {post.category ? (
                <>
                  <span>·</span>
                  <span>{post.category}</span>
                </>
              ) : null}
              {post.tags.length ? (
                <>
                  <span>·</span>
                  <span>{post.tags.map((t) => `#${t}`).join(" ")}</span>
                </>
              ) : null}
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
            {content}
          </div>

          <section className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">评论</h2>
            <GiscusComments />
          </section>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </article>

        <TableOfContents headings={post.headings} />
      </div>
    </div>
  );
}
