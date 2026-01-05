import type { MetadataRoute } from "next";

import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

/**
 * Sitemap 站点地图（MetadataRoute）
 *
 * Next.js 会把该文件输出为 /sitemap.xml。
 *
 * 生成策略：
 * - 静态路由：手写列表（主页、博客、标签、归档等）。
 * - 动态文章路由：扫描 posts 目录并为每个 slug 生成一条记录。
 */

function siteUrl() {
  // 生产环境建议配置 NEXT_PUBLIC_SITE_URL。
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/archive`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPostSlugs().map((slug) => {
    const post = getPostBySlug(slug);
    return {
      url: `${base}/blog/${slug}`,
      // 用文章日期作为 lastModified（如果未来支持“最后编辑时间”，可替换为 updatedAt）
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...postRoutes];
}
