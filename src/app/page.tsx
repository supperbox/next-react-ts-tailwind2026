import { Demo } from "./_components/demo";

/**
 * 首页（/）
 *
 * - 默认作为 Server Component：便于保持渲染开销小、组件边界清晰。
 * - 将需要 hooks/事件的交互逻辑下沉到 Demo（Client Component）。
 */

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
