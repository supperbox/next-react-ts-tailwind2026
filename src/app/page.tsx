import { Demo } from "./_components/demo";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Next.js 15+ 项目初始化</h1>
        <p className="text-sm text-muted-foreground">
          已集成 Tailwind CSS、shadcn/ui、TanStack Query、Zustand、React Hook
          Form + Zod。
        </p>
      </header>

      <Demo />
    </main>
  );
}
