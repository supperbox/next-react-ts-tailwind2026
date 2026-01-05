"use client";

import * as React from "react";

/**
 * 阅读进度条（Client Component）
 *
 * 目标：在文章详情页顶部显示当前滚动阅读进度。
 *
 * 计算方式：
 * - 进度 = 当前滚动距离 / (文档总高度 - 视口高度)
 * - 结果限制在 [0, 1]，再映射为 width 百分比。
 */
export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };

    // 滚动事件会高频触发：这里用最简单的同步计算。
    // 若未来有性能瓶颈，可改为 requestAnimationFrame 节流。
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="sticky top-0 z-40 h-1 w-full bg-transparent">
      <div
        className="h-1 bg-primary"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
    </div>
  );
}
