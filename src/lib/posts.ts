import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import readingTime from "reading-time";

/**
 * Posts 数据层（构建期/服务端）
 *
 * 目标：把 `src/content/posts` 下的 Markdown/MDX 文件解析成“可用于渲染页面”的结构化数据。
 *
 * 设计原则：
 * - 只做“读取/解析/聚合”，不在这里做 React 渲染（渲染在 `src/lib/mdx.ts`）。
 * - 输出的数据结构尽量稳定，便于：列表页、详情页、标签页、归档页、RSS/sitemap 复用。
 * - 默认按 SSG/Server Side 的方式运行（Next.js App Router 下的 Server Component）。
 */

export type PostFrontmatter = {
  title: string;
  date: string; // ISO-like string
  summary?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
};

export type PostHeading = {
  id: string;
  title: string;
  depth: 2 | 3;
};

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string | null;
  tags: string[];
  featured: boolean;
  readingMinutes: number;
};

export type PostDetail = PostListItem & {
  content: string;
  headings: PostHeading[];
};

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

function ensurePostsDir() {
  // 这里使用同步 IO：
  // - 读取发生在构建期（SSG）或服务端渲染阶段，调用链短、实现简单。
  // - 未来文章数量很大时，可再演进为缓存层或异步 IO。
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(
      `Posts directory not found: ${POSTS_DIR}. Expected src/content/posts.`
    );
  }
}

function normalizeTags(tags: unknown): string[] {
  // 允许 frontmatter.tags 写多种形式：
  // - 数组：tags: ["a", "b"]
  // - 逗号字符串：tags: "a, b"
  // 最终统一为 string[] 便于过滤/聚合。
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function asBoolean(value: unknown, fallback = false) {
  // frontmatter 布尔值兼容：
  // - YAML 中可写 true/false
  // - 或者字符串 "true"/"false"
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

function getFileSlugs(): string[] {
  // 扫描 posts 目录下的 .md/.mdx 文件名，并去掉扩展名作为 slug。
  // slug 将用于路由：/blog/[slug]
  ensurePostsDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/i, ""));
}

export function getAllPostSlugs(): string[] {
  return getFileSlugs();
}

export function getPostBySlug(slug: string): PostDetail {
  ensurePostsDir();
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post not found for slug: ${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");

  // gray-matter 会把：
  // - `---` 包裹的 YAML frontmatter（元数据）解析到 parsed.data
  // - 正文内容解析到 parsed.content
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostFrontmatter>;

  const title = data.title ? String(data.title) : slug;
  const date = data.date ? String(data.date) : new Date(0).toISOString();
  const summary = data.summary ? String(data.summary) : "";
  const category = data.category ? String(data.category) : null;
  const tags = normalizeTags(data.tags);
  const featured = asBoolean(data.featured, false);

  // reading-time 会基于正文估算阅读时长（分钟）。
  // 这里做了兜底：至少 1 分钟。
  const rt = readingTime(parsed.content);
  const readingMinutes = Math.max(1, Math.round(rt.minutes));

  // headings 用于目录（TOC）与滚动高亮。
  // 当前只抽取 H2/H3，是为了目录层级不过深且更易阅读。
  const headings = extractHeadings(parsed.content);

  return {
    slug,
    title,
    date,
    summary,
    category,
    tags,
    featured,
    readingMinutes,
    content: parsed.content,
    headings,
  };
}

export function getAllPosts(): PostListItem[] {
  // 列表页/标签页/归档页使用：返回所有文章的“轻量信息”（不含正文）。
  const slugs = getFileSlugs();
  const items = slugs.map((slug) => {
    const { content, headings, ...rest } = getPostBySlug(slug);
    void content;
    void headings;
    return rest;
  });

  // 按时间倒序
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllTags(): Array<{ tag: string; count: number }> {
  // 聚合所有文章的 tags，并计算出现次数。
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (a.tag < b.tag ? -1 : 1));
}

export function getPostsByTag(tag: string): PostListItem[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getArchiveGroups(): Array<{
  year: string;
  posts: PostListItem[];
}> {
  // 按年份分组用于归档页展示。
  const byYear = new Map<string, PostListItem[]>();
  for (const post of getAllPosts()) {
    const year = new Date(post.date).getFullYear().toString();
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([year, posts]) => ({ year, posts }));
}

function extractHeadings(content: string): PostHeading[] {
  // 轻量实现：覆盖大多数 Markdown heading 情况。
  //
  // 注意：文章渲染侧会用 `rehype-slug` 给标题生成 id。
  // 为了让 TOC 的 href（#id）能够准确跳转，我们用 github-slugger 生成同风格 slug。
  const slugger = new GithubSlugger();
  const result: PostHeading[] = [];

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;

    // 去掉一些常见的 Markdown 语法噪声，避免生成的标题文本带符号。
    const title = match[2]
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // link text
      .replace(/`([^`]+)`/g, "$1")
      .trim();

    if (!title) continue;
    const id = slugger.slug(title);
    result.push({ id, title, depth });
  }

  return result;
}
