import { http } from "@/service/http";

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

export type { CommentItem, CommentListResponse };

export async function listComments(slug: string): Promise<CommentListResponse> {
  const res = await http.get<CommentListResponse>("/api/comment/list", {
    params: { slug },
  });
  return res.data;
}

export async function createComment(input: {
  slug: string;
  content: string;
  parentId?: string;
  authorName?: string;
}): Promise<{ message: string; item: CommentItem }> {
  const res = await http.post<{ message: string; item: CommentItem }>(
    "/api/comment/create",
    input,
  );
  return res.data;
}
