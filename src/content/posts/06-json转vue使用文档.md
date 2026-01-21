# 06 - JSON 转 Vue 表单页面（jsonToVue）使用文档

本功能用于：在 `src/views/jsonToVue/` 下，通过一份 JSON（Schema）描述表单字段，自动生成 Ant Design Vue 的表单页面。

- Schema 示例：`src/views/jsonToVue/data.ts`
- 组件实现：`src/views/jsonToVue/jsonToVue.vue`
- 类型定义：`src/views/jsonToVue/types.ts`

## 1. 快速上手

### 1.1 直接访问 Demo 页面

项目已添加路由：`/jsonToVue`。

### 1.2 在任意页面中复用（推荐）

```vue
<script setup lang="ts">
import JsonToVue from '@/views/jsonToVue/jsonToVue.vue'
import { demoFormSchema } from '@/views/jsonToVue/data'

function onSubmit(values: Record<string, unknown>) {
  console.log('submit:', values)
}
</script>

<template>
  <JsonToVue :schema="demoFormSchema" @submit="onSubmit" />
</template>
```

> 说明：当前版本组件仅接收 `schema` 作为 prop；表单值通过事件（如 `@submit`）获取。

## 2. Schema 结构说明

Schema 类型为 `JsonToVueSchema`：

- `title`：页面/卡片标题
- `description`：页面描述
- `layout`：布局设置
  - `columns`: `1 | 2 | 3`，对应栅格列数（默认 1）
  - `labelColSpan`：label 列宽（Antd `labelCol.span`）
  - `wrapperColSpan`：输入控件列宽（Antd `wrapperCol.span`）
- `fields`：字段数组（核心）
- `actions`：底部/右上角按钮（默认 submit + reset）
- `effects`：联动副作用（依赖变化时执行动作，如清空字段、动态 options 等）

字段类型为 `JsonToVueField`，常用属性：

- `key`：字段键（必填），用于绑定 `formState[key]`
- `label`：表单项 label（必填）
- `component`：组件类型（必填）
- `placeholder`：占位符
- `help`：表单项提示文本
- `defaultValue`：默认值
- `required`：快捷必填（会自动生成一条 required rule）
- `rules`：校验规则（会转换为 Antd Form 规则）
- `options`：枚举项（select/radio/checkbox 使用）
- `props`：透传给具体组件的 props（如 `allowClear`、`max`、`valueFormat` 等）
- `slot`：字段级插槽名（用于自定义渲染）
- `computed`：计算字段（由其他字段派生）
- `readOnly`：只读（禁用输入，常用于计算字段）
- `colSpan`：栅格宽度（1 行 24），不填则按 `layout.columns` 自动分配
- `visibleWhen`：显隐条件
- `disabledWhen`：禁用条件

## 3. 支持的组件类型

当前内置支持：

- `input` → `a-input`
- `textarea` → `a-textarea`
- `number` → `a-input-number`
- `select` → `a-select`（使用 `options`）
- `radio` → `a-radio-group`（使用 `options`）
- `checkbox` → `a-checkbox-group`（使用 `options`）
- `switch` → `a-switch`
- `date` → `a-date-picker`

如果 `component` 不在上述范围，会显示一个 warning。

## 4. 枚举（options）写法

示例：

```ts
{
  key: 'country',
  label: '国家/地区',
  component: 'select',
  options: [
    { label: '中国', value: 'CN' },
    { label: '美国', value: 'US' },
  ],
  props: { allowClear: true },
}
```

## 5. 条件显隐 / 禁用

条件类型 `JsonToVueWhen`：

- `{ key, equals }`
- `{ key, notEquals }`
- `{ key, in: [...] }`
- `{ key, truthy: true }`
- `{ key, falsy: true }`

示例：当 `subscribe` 为 true 时才显示 `email`：

```ts
{
  key: 'email',
  label: '邮箱',
  component: 'input',
  visibleWhen: { key: 'subscribe', truthy: true },
  rules: [{ required: true, message: '请输入邮箱' }],
}
```

示例：当 `country === 'US'` 时禁用某字段：

```ts
{
  key: 'note',
  label: '备注',
  component: 'input',
  disabledWhen: { key: 'country', equals: 'US' },
}
```

## 6. 校验规则（rules）

`rules` 支持常用字段：

- `required`
- `min` / `max`
- `pattern`（字符串形式正则，会在组件内转换为 `RegExp`）
- `type`: `'string' | 'number' | 'boolean' | 'array'`

示例：

```ts
rules: [
  { required: true, message: '必填' },
  { pattern: '^\\S+@\\S+\\.\\S+$', message: '邮箱格式不正确' },
]
```

## 7. 事件与调试

- `@submit`：校验通过后触发，参数为当前表单值
- `@reset`：点击重置后触发

## 8. 计算字段（computed）

用于描述“由其他字段计算出来”的字段，例如 `fullName = firstName + lastName`。

示例：

```ts
{
  key: 'fullName',
  label: '姓名（计算字段）',
  component: 'input',
  readOnly: true,
  computed: {
    deps: ['firstName', 'lastName'],
    expr: {
      op: '+',
      args: [{ var: 'firstName' }, { const: ' ' }, { var: 'lastName' }],
    },
  },
}
```

说明：

- `deps` 显式声明依赖字段，组件只监听这些字段变化
- `expr` 是“受控表达式 DSL”，不允许写任意 JS，便于安全管控与可维护

## 9. 联动副作用（effects）

用于描述“当某些字段变化时，自动执行动作”的联动能力。

示例：关闭订阅时清空邮箱：

```ts
effects: [
  {
    deps: ['subscribe'],
    when: { key: 'subscribe', falsy: true },
    actions: [
      { type: 'setValue', key: 'email', value: '' },
      { type: 'toast', level: 'warning', message: '已关闭订阅：邮箱已自动清空' },
    ],
  },
]
```

动作（actions）是白名单原语，例如：

- `setValue`：设置某字段值
- `patchValues`：批量设置
- `resetFields`：重置字段
- `setOptions`：动态设置 select/radio/checkbox 的 options（运行时覆盖层）
- `toast`：提示信息

## 10. 插槽（slot）扩展

当内置组件类型不足以覆盖业务需求时，可以用插槽接管渲染。

两种方式：

1）字段级插槽：在 field 上声明 `slot`，然后在使用处提供同名插槽。

```ts
{ key: 'customNote', label: '自定义渲染', component: 'custom', slot: 'customNote' }
```

```vue
<JsonToVue :schema="demoFormSchema">
  <template #customNote="{ field, value, setValue, formState }">
    <div class="rounded bg-gray-50 p-3 text-sm">
      <div class="font-medium">{{ field.label }}</div>
      <div class="mt-2">当前值：{{ value }}</div>
      <a-button size="small" class="mt-2" @click="setValue('来自插槽')">写入</a-button>
      <pre class="mt-2 text-xs">{{ formState }}</pre>
    </div>
  </template>
</JsonToVue>
```

2）全局字段插槽：提供 `#field`，可统一接管所有字段渲染（必要时再按 field.slot 分流）。

## 8. 注意事项

- 日期组件：`date` 使用 Ant Design Vue DatePicker，项目依赖 `dayjs`（用于类型与运行时）。
- select/radio 的 options：Antd 默认只接受 `string | number` 作为 value。
  - 本组件会把 boolean value 自动转成字符串 `'true'/'false'` 以兼容 Antd。
  - checkbox-group 仍保留 boolean value（因为其 options 类型更宽松）。

---

如需支持更多组件类型（比如 `upload`、`cascader`、`treeSelect`、`timePicker` 等），可以在 `src/views/jsonToVue/jsonToVue.vue` 里新增分支，并在 `types.ts` 扩展 `JsonToVueComponentType`。
