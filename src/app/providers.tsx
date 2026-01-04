"use client";

/**
 * 全局 Provider 入口（Client Component）
 *
 * 为什么需要这个文件？
 * - Next.js App Router 下，`layout.tsx` 默认是 Server Component。
 * - TanStack Query 的 QueryClientProvider 需要在客户端创建 QueryClient，并提供 React Context。
 * - 因此我们把所有“必须在客户端初始化的 Provider”集中在这里，然后在根布局中包裹 `children`。
 *
 * 扩展建议：
 * - 后续如果引入主题（ThemeProvider）、国际化、埋点、全局弹窗/Toast 等，也建议统一放到这里。
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // 使用 lazy initializer，确保 QueryClient 在客户端生命周期内只创建一次。
  // 这样可以避免每次 re-render 造成缓存丢失、请求重复等问题。
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
