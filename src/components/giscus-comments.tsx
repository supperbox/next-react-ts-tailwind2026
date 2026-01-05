"use client";

import Giscus from "@giscus/react";

/**
 * Giscus 评论区（Client Component）
 *
 * 目标：把 Giscus 的配置集中在一个组件里，通过环境变量注入。
 *
 * 必要环境变量（建议写在 `.env.local`）：
 * - `NEXT_PUBLIC_GISCUS_REPO`：形如 owner/repo
 * - `NEXT_PUBLIC_GISCUS_REPO_ID`
 * - `NEXT_PUBLIC_GISCUS_CATEGORY`
 * - `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
 *
 * 为什么需要校验 repo 形状：
 * - `@giscus/react` 的 `repo` prop 类型是模板字面量 `${string}/${string}`。
 * - 但 env 读取出来是 `string | undefined`，需要通过类型守卫收窄，否则 build 会报类型错误。
 */

export function GiscusComments() {
  // NEXT_PUBLIC_* 会暴露给浏览器端，所以仅放非敏感配置。
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  // 运行时校验 + TS 类型收窄：确保 repo 满足 owner/repo 形状。
  const isOwnerRepo = (value: string): value is `${string}/${string}` =>
    /^[^/]+\/[^/]+$/.test(value);

  if (!repo || !repoId || !category || !categoryId || !isOwnerRepo(repo)) {
    // 不抛错：评论配置缺失不应影响页面主体内容。
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        评论未配置：请在环境变量中设置 `NEXT_PUBLIC_GISCUS_*`
        （repo=owner/repo、repoId、category、categoryId）。
      </div>
    );
  }

  return (
    <Giscus
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
      loading="lazy"
    />
  );
}
