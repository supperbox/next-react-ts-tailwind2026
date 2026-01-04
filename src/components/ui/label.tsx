"use client";

/**
 * Label（shadcn/ui）
 *
 * 说明：
 * - 对 Radix UI 的 Label 做轻量封装，统一字体、间距、禁用态样式。
 * - 作为 Client Component：Radix 在某些场景下需要运行在客户端（事件/属性处理）。
 */

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      // 默认样式：保持 label 可读性与禁用态表现。
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
