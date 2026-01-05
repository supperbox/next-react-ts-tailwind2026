"use client";

import * as React from "react";
import FlexSearch from "flexsearch";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import type { PostListItem } from "@/lib/posts";

type Props = {
  posts: PostListItem[];
};

/**
 * 博客列表（客户端交互层）
 *
 * 为什么需要 Client Component：
 * - 搜索框、分类/标签筛选是纯前端交互，需要 useState/useMemo。
 *
 * 搜索实现：
 * - 使用 FlexSearch 在内存中构建索引（字段：title/summary/category/tags）。
 * - 适合文章数量不大、需要即时搜索的场景。
 * - 若文章量增长，可演进为：构建期生成索引 JSON 或服务端搜索。
 */

function normalize(s: string) {
  // 简单归一化：去空格 + 小写。
  // 中文搜索一般不需要大小写处理，但英文/混排会更一致。
  return s.trim().toLowerCase();
}

export function BlogListClient({ posts }: Props) {
  // query：全文搜索关键字；tag/category：快速筛选条件
  const [query, setQuery] = React.useState("");
  const [tag, setTag] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);

  const index = React.useMemo(() => {
    // 每次 posts 变更时重建索引。
    // tokenize: "forward" 适合前缀匹配（输入越多越精准）。
    const idx = new FlexSearch.Index({
      tokenize: "forward",
      cache: true,
    });
    posts.forEach((p, i) => {
      // 用数组下标作为文档 id：简单直接。
      // 注意：依赖 posts 的顺序稳定；本项目 posts 来自服务端排序后的列表。
      idx.add(
        i,
        [p.title, p.summary, p.category ?? "", ...(p.tags ?? [])].join(" ")
      );
    });
    return idx;
  }, [posts]);

  const filtered = React.useMemo(() => {
    const q = normalize(query);

    // 先做“结构化筛选”（tag/category），再做“全文搜索”。
    // 这样可以做到：在某个分类/标签内进行搜索。
    let base = posts;
    if (tag) base = base.filter((p) => p.tags.includes(tag));
    if (category) base = base.filter((p) => p.category === category);

    if (!q) return base;

    // FlexSearch 返回命中的 doc id（这里是 posts 的下标）
    const hits = index.search(q, 50) as number[];
    const hitSet = new Set(hits);
    // 这里用 posts.indexOf(p) 找回下标；文章量小时足够。
    // 若未来需要更优性能，可在构建索引时保存 slug->id 的映射。
    return base.filter((p) => hitSet.has(posts.indexOf(p)));
  }, [posts, query, tag, category, index]);

  const allTags = React.useMemo(() => {
    // 聚合出所有标签，用于筛选按钮。
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const allCategories = React.useMemo(() => {
    // 聚合出所有分类，用于筛选按钮。
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <Input
          placeholder="搜索文章（标题/摘要/标签）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">分类：</span>
          <button
            type="button"
            className={
              category === null
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            onClick={() => setCategory(null)}
          >
            全部
          </button>
          {allCategories.map((c) => (
            <button
              key={c}
              type="button"
              className={
                category === c
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">标签：</span>
          <button
            type="button"
            className={
              tag === null
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
            onClick={() => setTag(null)}
          >
            全部
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              className={
                tag === t
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
              onClick={() => setTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((post) => (
          <article key={post.slug} className="rounded-md border bg-card p-4">
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

            {post.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {post.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => setTag(t)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            ) : null}
          </article>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
            没有匹配的文章。
          </div>
        ) : null}
      </div>
    </div>
  );
}
