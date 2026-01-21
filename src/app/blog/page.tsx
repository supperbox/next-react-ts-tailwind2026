export const metadata = {
  title: "博客",
};

import { BlogListClient } from "./_components/blog-list-client";
import { getAllPosts } from "@/lib/posts";

/**
 * /blog 列表页（Server Component）
 *
 * 数据流：
 * - 这里在服务端读取文章列表（`getAllPosts()`：构建期/服务端 IO）。
 * - 交互（搜索/筛选）交给 Client Component：`BlogListClient`。
 */

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">博客</h1>
        <p className="text-sm text-muted-foreground">
          按时间倒序列出所有文章；后续会支持分类/标签筛选与搜索。
        </p>
      </header>

      <BlogListClient posts={posts} />
    </div>
  );
}
