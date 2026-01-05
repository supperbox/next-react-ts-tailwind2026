import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * 根布局（Root Layout）
 *
 * - App Router 约定：`src/app/layout.tsx` 会包裹整个应用。
 * - 该文件默认是 Server Component，适合放置全局静态配置（metadata、字体、全局样式）。
 * - 需要在客户端初始化的 Provider（如 TanStack Query）通过 [src/app/providers.tsx](src/app/providers.tsx) 注入。
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Blog",
  description: "Personal blog built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        // 这里的 className：
        // - 挂载 next/font 生成的 CSS 变量（用于 Tailwind/shadcn 的 font token）
        // - 设置最小高度与基础背景色，保持全站视觉一致
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {/* 全局 Provider：集中挂载 TanStack Query / Theme 等 client-only 能力 */}
        <Providers>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
