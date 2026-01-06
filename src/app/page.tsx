export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          你好，我是CoderJLW
        </h1>
        <p className="text-sm text-muted-foreground">
          这里将展示个人介绍、精选文章、最新文章、分类与标签云。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">精选文章</h2>
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          还未接入文章数据（下一步会接入 Markdown/MDX 并生成列表）。
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">最新文章</h2>
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          还未接入文章数据。
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">分类 / 标签云</h2>
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          下一步会从文章 Frontmatter 生成分类与标签。
        </div>
      </section>
    </div>
  );
}
