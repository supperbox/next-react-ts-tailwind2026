import { create } from "zustand";

/**
 * Counter Store（Zustand 示例）
 *
 * 说明：
 * - Zustand 适合管理跨组件共享的“纯前端状态”（例如 UI 开关、编辑中的草稿、简单缓存等）。
 * - 与 TanStack Query 的区别：Query 更适合“后端数据 + 缓存失效/同步”。
 *
 * 使用方式：
 * - 推荐在组件中通过 selector 订阅：`useCounterStore(s => s.count)`，避免无关字段变更导致重渲染。
 */

type CounterState = {
  // 当前计数
  count: number;
  // 业务动作：+1
  increment: () => void;
  // 业务动作：-1
  decrement: () => void;
  // 业务动作：归零
  reset: () => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  // set 支持函数式写法，确保基于最新 state 计算新值。
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
