export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* 年份使用运行时计算：避免每年手动改文案 */}
          <p>© {new Date().getFullYear()} My Blog</p>
          <p>Built with Next.js + Tailwind</p>
        </div>
      </div>
    </footer>
  );
}
