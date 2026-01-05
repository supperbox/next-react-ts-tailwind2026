import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

/**
 * 站点头部（导航 + 主题切换）
 *
 * 设计：
 * - 桌面端：展示完整导航（sm 以上）。
 * - 移动端：导航放到第二行并允许横向滚动，避免拥挤换行。
 */

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/archive", label: "归档" },
  { href: "/tags", label: "标签" },
  { href: "/projects", label: "项目" },
  { href: "/about", label: "关于" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="font-semibold truncate">
            My Blog
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <nav className="sm:hidden border-t">
        <div className="mx-auto max-w-4xl px-4 h-11 flex items-center gap-4 overflow-x-auto text-sm text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
