import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn：className 合并工具
 *
 * - clsx：负责把条件 class（数组/对象/字符串）归一化
 * - tailwind-merge：负责合并 Tailwind 冲突类（例如 `p-2` 与 `p-4`，最终保留后者）
 *
 * 这是 shadcn/ui 推荐的写法，组件里可以安全地组合默认样式与外部传入的 className。
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
