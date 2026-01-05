"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * 主题切换（Client Component）
 *
 * 说明：
 * - 使用 next-themes 管理 `class`（dark/light/system）。
 * - 首次渲染时 resolvedTheme 依赖客户端环境，
 *   因此通过 mounted 避免 SSR/CSR 水合时出现图标不一致的闪烁。
 */

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // mounted 之前不要依赖 resolvedTheme，避免水合不一致。
  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
