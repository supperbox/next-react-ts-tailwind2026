import { getAllPosts } from "@/lib/posts";

/**
 * RSS 输出（Route Handler）
 *
 * 访问路径：/rss.xml
 *
 * 设计：
 * - 直接拼接 RSS 2.0 XML（足够轻量，避免引入额外依赖）。
 * - 使用 `escapeXml` 防止标题/摘要中的特殊字符破坏 XML。
 * - Cache-Control 使用 s-maxage + stale-while-revalidate，适合部署在支持边缘缓存的平台。
 */

function siteUrl() {
  // 生产环境建议配置 NEXT_PUBLIC_SITE_URL（如 https://example.com）。
  // 本地开发默认 localhost。
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function escapeXml(value: string) {
  // RSS 属于 XML 格式，必须转义特殊字符。
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const base = siteUrl();
  const posts = getAllPosts();

  const items = posts
    .map((p) => {
      const link = `${base}/blog/${p.slug}`;
      return `\n    <item>\n      <title>${escapeXml(
        p.title
      )}</title>\n      <link>${link}</link>\n      <guid>${link}</guid>\n      <pubDate>${new Date(
        p.date
      ).toUTCString()}</pubDate>\n      <description>${escapeXml(
        p.summary ?? ""
      )}</description>\n    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>My Blog</title>
    <link>${base}</link>
    <description>Personal blog built with Next.js</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // 说明：
      // - s-maxage：CDN/边缘缓存 1 小时
      // - stale-while-revalidate：过期后可先返回旧内容，同时后台刷新
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
