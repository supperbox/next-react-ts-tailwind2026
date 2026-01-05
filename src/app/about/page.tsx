export const metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">关于我</h1>
        <p className="text-sm text-muted-foreground">
          个人介绍、技能、经历等。
        </p>
      </header>

      <section className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        这里是占位内容：下一步可以把你的简介、技能栈、经历拆成多个区块。
      </section>
    </div>
  );
}
