import axios, { AxiosError, type AxiosInstance } from "axios";

function pickBaseURL(): string {
  // 默认走 Next.js rewrites 的同源代理：/api/* -> EXPRESS_API_ORIGIN
  // 如需直连（例如后端不同域名），可在客户端注入 NEXT_PUBLIC_API_BASE_URL。
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "";
}

export const http: AxiosInstance = axios.create({
  baseURL: pickBaseURL(),
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<any>;
    const msgFromServer = axiosErr.response?.data?.message;
    if (typeof msgFromServer === "string" && msgFromServer.trim()) {
      return msgFromServer;
    }
    if (axiosErr.message) return axiosErr.message;
  }

  if (err instanceof Error && err.message) return err.message;
  return "请求失败";
}
