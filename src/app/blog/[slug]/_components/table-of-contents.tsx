"use client";

import * as React from "react";
import { List } from "lucide-react";

import type { PostHeading } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  headings: PostHeading[];
};

/**
 * 文章目录（Client Component）
 *
 * 输入：服务端在解析文章时抽取的 headings（H2/H3）。
 * 输出：右侧目录 + 当前阅读位置高亮。
 *
 * 高亮实现：
 * - 使用 IntersectionObserver 观察所有标题元素。
 * - 通过 rootMargin 调整“触发区间”，更贴近阅读体验。
 */

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [isSmall, setIsSmall] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");

    const onChange = () => {
      const small = mql.matches;
      setIsSmall(small);
      // 小屏默认折叠；大屏默认展开。
      setCollapsed(small);
      if (!small) setMobileOpen(false);
    };

    onChange();

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    if (!headings.length) return;

    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 取当前视口内“最靠上”的标题作为 active。
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1,
          );
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      {
        // 上方 20% 进入观察范围，下方 70% 提前离开范围：
        // 让 active heading 更稳定，不会在边界频繁抖动。
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <aside
      className={cn(
        "lg:self-start lg:relative",
        // 窄屏：把小图标放到内容容器右上角（父容器已设为 relative）
        isSmall ? "absolute right-4 top-4 z-40" : "",
      )}
    >
      {isSmall ? (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="目录"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <List className="h-4 w-4" />
          </Button>

          {mobileOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-md border bg-card shadow-lg">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">目录</div>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  关闭
                </button>
              </div>
              <nav className="px-2 pb-3 max-h-[60vh] overflow-auto">
                {headings.map((h) => {
                  const isActive = h.id === activeId;
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={
                        "block rounded px-2 py-1 text-sm leading-6 " +
                        (h.depth === 3 ? "pl-6 " : "pl-3 ") +
                        (isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50")
                      }
                    >
                      {h.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative rounded-md border bg-card">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-sm font-semibold"
          >
            <span>目录</span>
            <span className="text-xs text-muted-foreground">
              {collapsed ? "展开" : "收起"}
            </span>
          </button>

          {!collapsed ? (
            <nav className="px-2 pb-3">
              {headings.map((h) => {
                const isActive = h.id === activeId;
                return (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={
                      "block rounded px-2 py-1 text-sm leading-6 " +
                      (h.depth === 3 ? "pl-6 " : "pl-3 ") +
                      (isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50")
                    }
                  >
                    {h.title}
                  </a>
                );
              })}
            </nav>
          ) : null}
        </div>
      )}
    </aside>
  );
}
