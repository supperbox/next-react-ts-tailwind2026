"use client";

import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCounterStore } from "@/stores/counter-store";

const demoSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字符"),
  email: z.string().email("请输入正确的邮箱"),
});

type DemoFormValues = z.infer<typeof demoSchema>;

export function Demo() {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  const timeQuery = useQuery({
    queryKey: ["demo-time"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return new Date().toISOString();
    },
  });

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: { name: "", email: "" },
    mode: "onSubmit",
  });

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
