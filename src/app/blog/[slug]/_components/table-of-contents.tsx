"use client";

import * as React from "react";

import type { PostHeading } from "@/lib/posts";

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
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1
          );
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      {
        // 上方 20% 进入观察范围，下方 70% 提前离开范围：
        // 让 active heading 更稳定，不会在边界频繁抖动。
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
      <div className="rounded-md border bg-card p-4">
        <div className="text-sm font-semibold">目录</div>
        <nav className="mt-3 space-y-2 text-sm">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={
                  (h.depth === 3 ? "pl-4 " : "") +
                  (isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {h.title}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
