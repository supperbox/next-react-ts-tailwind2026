"use client";

/**
 * Demo（Client Component）
 *
 * 用途：
 * - 作为“项目集成样例页”的核心组件，集中演示本项目选型的三类前端状态管理方式：
 *   1) TanStack Query：管理后端数据（server state）与缓存
 *   2) Zustand：管理跨组件共享的前端状态（global client state）
 *   3) React Hook Form + Zod：管理表单输入与校验（local UI/form state）
 *
 * 注意：
 * - 这里的“请求”使用了本地模拟（setTimeout + 返回时间字符串），真实项目应替换为 API 调用。
 */

import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCounterStore } from "@/stores/counter-store";

// 表单 schema：Zod 作为单一事实来源（Single Source of Truth）。
// 后续可以在这里补充更复杂的约束（正则、可选字段、联合类型等）。
const demoSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字符"),
  email: z.string().email("请输入正确的邮箱"),
});

type DemoFormValues = z.infer<typeof demoSchema>;

export function Demo() {
  // Zustand：通过 selector 按需订阅，避免无关字段变化导致组件不必要的重渲染。
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  // TanStack Query：用 queryKey 描述缓存维度。
  // 真实项目中 queryFn 应该调用你封装过的 API 函数（例如 `getTime()`）。
  const timeQuery = useQuery({
    queryKey: ["demo-time"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return new Date().toISOString();
    },
  });

  // React Hook Form：负责输入状态与提交流程。
  // zodResolver：把 Zod 的校验结果直接映射成 RHF 的 errors。
  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { name: "", email: "" },
    mode: "onSubmit",
  });

  // 提交后的展示数据（仅用于 demo 反馈）。
  const [submitted, setSubmitted] = React.useState<DemoFormValues | null>(null);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Zustand（状态）</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            当前计数：<span className="font-mono font-semibold">{count}</span>
          </div>
          <Button type="button" onClick={decrement} variant="outline">
            -1
          </Button>
          <Button type="button" onClick={increment}>
            +1
          </Button>
          <Button type="button" onClick={reset} variant="secondary">
            重置
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">TanStack Query（请求）</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => timeQuery.refetch()}
            disabled={timeQuery.isFetching}
          >
            {timeQuery.isFetching ? "请求中..." : "刷新时间"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {timeQuery.isLoading
              ? "初始化中..."
              : timeQuery.data
              ? `ISO 时间：${timeQuery.data}`
              : "暂无数据"}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">React Hook Form + Zod（表单）</h2>

        <form
          className="grid gap-4 max-w-md"
          // handleSubmit 会在通过校验后再触发回调；若校验失败会写入 formState.errors。
          onSubmit={form.handleSubmit((values) => setSubmitted(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              placeholder="比如：张三"
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">提交</Button>
            <Button
              type="button"
              variant="outline"
              // reset：重置表单输入；同时清空 demo 的提交结果。
              onClick={() => {
                form.reset();
                setSubmitted(null);
              }}
            >
              清空
            </Button>
          </div>

          {submitted ? (
            <pre className="rounded-md border bg-muted p-3 text-sm overflow-auto">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          ) : null}
        </form>
      </section>
    </div>
  );
}
