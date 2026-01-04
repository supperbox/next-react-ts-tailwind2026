# React Hook Form + Zod 使用文档（本项目）

本文档说明本项目中表单方案的定位、代码结构，以及推荐实践。

## 1. 方案定位

- React Hook Form（RHF）：负责“表单输入状态”与“提交流程”
  - 字段注册、值管理、dirty/touched、提交状态
- Zod：负责“校验规则与类型推导”
  - 用 schema 作为单一事实来源（Single Source of Truth）
  - 通过 `z.infer` 推导 TS 类型，减少重复定义
- `@hookform/resolvers/zod`：桥接 RHF 与 Zod

## 2. 本项目中的示例文件

- Demo：
  - [src/app/\_components/demo.tsx](../src/app/_components/demo.tsx)

示例包含：

- `demoSchema`（Zod schema）
- `useForm({ resolver: zodResolver(demoSchema) })`
- 错误展示：`form.formState.errors.xxx?.message`

## 3. 推荐写法（本项目风格）

### 3.1 Schema 与类型

```ts
const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
});

type Values = z.infer<typeof schema>;
```

建议：

- 错误文案直接写在 schema 中，避免散落在各处
- 通过 `z.infer` 生成类型，避免重复维护

### 3.2 useForm 配置

本项目示例：

- `mode: "onSubmit"`：提交时校验（最简单、最不打扰）
- `defaultValues`：必须提供，避免 uncontrolled -> controlled 警告

可选：

- `mode: "onChange"`/`"onBlur"`：更实时的校验体验（按需）

## 4. 与 shadcn/ui 的配合

本项目使用的 UI 组件：

- [src/components/ui/input.tsx](../src/components/ui/input.tsx)
- [src/components/ui/label.tsx](../src/components/ui/label.tsx)
- [src/components/ui/button.tsx](../src/components/ui/button.tsx)

在最小集成下，直接 `register` 到 Input：

```tsx
<Input {...form.register("email")} />
```

如果后续引入更复杂组件（Select、DatePicker 等），通常需要用 `Controller` 来适配。

## 5. 推荐的模块组织（真实业务表单）

建议一个表单模块包含：

- `schema.ts`：Zod schema + `z.infer` 类型导出
- `form.tsx`：Form UI（Client Component）
- `actions.ts`：提交的 API 调用（配合 TanStack Query 的 mutation）

这样便于：

- schema 可复用（前后端共享校验也更容易）
- UI 与数据提交逻辑分离

## 6. 常见坑

- 忘记加 `"use client"`：RHF 是 hook，只能在 Client Component 使用
- 没写 `defaultValues`：容易出现 React 警告或字段初始值不符合预期
- 错误信息散落：建议集中在 Zod schema 中
