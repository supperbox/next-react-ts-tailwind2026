export const metadata = {
  title: "项目",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">项目</h1>
        <p className="text-sm text-muted-foreground">展示个人项目与链接。</p>
      </header>

      <section className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        这里是占位内容：后续我们会把项目数据抽成配置或 Markdown/MDX。
      </section>
    </div>
  );
}
