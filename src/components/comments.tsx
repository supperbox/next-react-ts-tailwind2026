"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

type CommentItem = {
  _id: string;
  postSlug: string;
  content: string;
  authorName: string;
  parentId: string | null;
  status: "approved" | "pending" | "spam";
  createdAt: string;
  updatedAt: string;
};

type CommentListResponse = {
  items: CommentItem[];
  total: number;
  page: number;
  pageSize: number;
};

function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_COMMENTS_API_BASE?.replace(/\/$/, "") || "/api"
  );
}

async function fetchComments(slug: string): Promise<CommentListResponse> {
  const url = `${getApiBase()}/comment/list?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("加载评论失败");
  return res.json();
}

async function createComment(input: {
  slug: string;
  content: string;
  parentId?: string;
  authorName?: string;
}): Promise<{ message: string; item: CommentItem }> {
  const url = `${getApiBase()}/comment/create`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "提交失败");
  }
  return data;
}

function getOrCreateVisitorName(): string {
  // 单次访问（同一 tab/session）保持一致：满足“多条评论同一个 id”的要求。
  // sessionStorage 不跨 tab，不跨浏览器重启。
  const KEY = "jblog_visitor_name";
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const num = Math.floor(Math.random() * 10000);
    const name = `热心网友${String(num).padStart(4, "0")}`;
    sessionStorage.setItem(KEY, name);
    return name;
  } catch {
    // 兜底：隐私模式或禁用 storage 的环境
    const num = Math.floor(Math.random() * 10000);
    return `热心网友${String(num).padStart(4, "0")}`;
  }
}

type CommentNode = CommentItem & { replies: CommentNode[] };

function buildCommentTree(items: CommentItem[]): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const item of items) {
    byId.set(item._id, { ...item, replies: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortByCreatedAt = (a: CommentNode, b: CommentNode) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;

  const sortDeep = (nodes: CommentNode[]) => {
    nodes.sort(sortByCreatedAt);
    for (const n of nodes) sortDeep(n.replies);
  };
  sortDeep(roots);

  return roots;
}

export function Comments({ slug }: { slug: string }) {
  const queryClient = useQueryClient();

  const visitorName = React.useMemo(() => getOrCreateVisitorName(), []);

  const [content, setContent] = React.useState("");
  const [replyToId, setReplyToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const listQuery = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => fetchComments(slug),
  });

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: async () => {
      setContent("");
      setReplyContent("");
      setReplyToId(null);
      await queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
  });

  const items = React.useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items],
  );
  const tree = React.useMemo(() => buildCommentTree(items), [items]);

  React.useEffect(() => {
    // 初始化：有回复的评论默认折叠，避免刷屏。
    // 仅对“尚未记录状态”的 id 设置默认值，不覆盖用户操作。
    if (!items.length) return;
    const hasChildren = new Map<string, number>();
    for (const c of items) {
      if (c.parentId) {
        hasChildren.set(c.parentId, (hasChildren.get(c.parentId) ?? 0) + 1);
      }
    }
    if (!hasChildren.size) return;

    setCollapsed((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [id] of hasChildren) {
        if (next[id] === undefined) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [items]);

  const submitRoot = () => {
    createMutation.mutate({
      slug,
      content: content.trim(),
      authorName: visitorName,
    });
  };

  const submitReply = (parentId: string) => {
    createMutation.mutate({
      slug,
      content: replyContent.trim(),
      parentId,
      authorName: visitorName,
    });
  };

  const renderNode = (node: CommentNode, depth = 0) => {
    const replyCount = node.replies.length;
    const isCollapsed = collapsed[node._id] ?? false;
    const isReplying = replyToId === node._id;

    return (
      <div
        key={node._id}
        className={"rounded-md border bg-card p-4 " + (depth ? "ml-4" : "")}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-semibold">{node.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(node.createdAt).toLocaleString("zh-CN")}
          </span>
        </div>

        <div className="mt-2 whitespace-pre-wrap text-sm leading-6">
          {node.content}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setReplyToId((cur) => (cur === node._id ? null : node._id));
              setReplyContent("");
            }}
          >
            {isReplying ? "取消回复" : "回复"}
          </Button>

          {replyCount ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [node._id]: !(prev[node._id] ?? true),
                }))
              }
            >
              {isCollapsed ? `展开回复（${replyCount}）` : "收起回复"}
            </Button>
          ) : null}
        </div>

        {isReplying ? (
          <div className="mt-3 grid gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={createMutation.isPending}
                onClick={() => submitReply(node._id)}
              >
                {createMutation.isPending ? "提交中..." : "提交回复"}
              </Button>
              <span className="text-xs text-muted-foreground">
                你的昵称：{visitorName}
              </span>
            </div>
          </div>
        ) : null}

        {!isCollapsed && replyCount ? (
          <div className="mt-3 space-y-3">
            {node.replies.map((r) => renderNode(r, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-md border bg-card p-4">
        <div className="text-sm font-semibold">发表评论</div>
        <div className="mt-3 grid gap-3">
          <div className="grid gap-2">
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法..."
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                submitRoot();
              }}
            >
              {createMutation.isPending ? "提交中..." : "提交评论"}
            </Button>

            {createMutation.error ? (
              <div className="text-sm text-destructive">
                {(createMutation.error as Error).message}
              </div>
            ) : null}

            {createMutation.isSuccess ? (
              <div className="text-sm text-muted-foreground">已提交</div>
            ) : null}
          </div>

          <div className="text-xs text-muted-foreground">
            你的昵称：{visitorName}（单次访问保持一致）
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            评论（{listQuery.data?.total ?? 0}）
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
          >
            {listQuery.isFetching ? "刷新中..." : "刷新"}
          </Button>
        </div>

        {listQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">加载中...</div>
        ) : listQuery.error ? (
          <div className="text-sm text-destructive">
            {(listQuery.error as Error).message}
          </div>
        ) : tree.length ? (
          <div className="space-y-3">{tree.map((n) => renderNode(n))}</div>
        ) : (
          <div className="text-sm text-muted-foreground">
            暂无评论，来抢沙发。
          </div>
        )}
      </div>
    </div>
  );
}
