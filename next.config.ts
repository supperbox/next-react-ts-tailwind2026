import type { NextConfig } from "next";

/**
 * Next.js 配置入口
 *
 * 说明：
 * - 这里是项目级别的 Next.js 行为配置（构建、路由、实验特性、headers/redirects 等）。
 * - 当前保持默认（脚手架生成），便于作为干净的起点。
 *
 * 常见扩展：
 * - `images`：配置外链图片域名
 * - `rewrites/redirects/headers`：网关/接口代理、跳转、响应头
 * - `experimental`：试验特性开关（谨慎使用）
 */

const nextConfig: NextConfig = {
  async rewrites() {
    // 通过 Next.js 同源代理转发到 Express，避免浏览器跨域。
    // 默认指向本机 3101；生产环境可用环境变量覆盖。
    const target = (
      process.env.EXPRESS_API_ORIGIN || "http://localhost:3101"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

export default nextConfig;
