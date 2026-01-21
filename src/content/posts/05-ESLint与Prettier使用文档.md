# 05-ESLint 与 Prettier 使用文档

本项目的代码规范主要作用于前端目录 `Vue/`（后端 `server/` 当前未配置 ESLint/Prettier）。

## 1. 前端（Vue/）现状

### 1.1 ESLint 配置

- 配置文件：`Vue/eslint.config.ts`（Flat Config）
- 组合来源：
  - `eslint-plugin-vue`：`flat/essential`
  - `@vue/eslint-config-typescript`：`recommended`
  - `@vue/eslint-config-prettier/skip-formatting`：关闭与 Prettier 冲突的格式化规则
- 忽略目录：`dist/`、`dist-ssr/`、`coverage/`

另外：项目启用了 `unplugin-auto-import`，会生成：

- `Vue/.eslintrc-auto-import.json`：声明自动导入的全局变量（避免 eslint 报未定义）

通常不需要手改它（生成文件）。

### 1.2 Prettier 配置

- 配置：`Vue/.prettierrc.json`
  - `semi: false`
  - `singleQuote: true`
  - `printWidth: 100`
- 忽略：`Vue/.prettierignore`
  - 包含 `types/auto-imports.d.ts`、`types/components.d.ts` 等生成文件

## 2. 常用命令

在 `Vue/` 目录执行：

- ESLint 修复：`pnpm run lint`
- Prettier 格式化：`pnpm run format`
- Prettier 检查：`pnpm run format:check`
- TS 类型检查：`pnpm run type-check`

建议在提交前至少执行：

- `pnpm run type-check`
- `pnpm run lint`
- `pnpm run format:check`

## 3. VS Code 推荐设置（可选）

- 安装扩展：

  - ESLint
  - Prettier - Code formatter

- 建议开启保存格式化（仅供团队约定，按需）：
  - `editor.formatOnSave: true`
  - `editor.defaultFormatter: esbenp.prettier-vscode`

注意：项目已通过 `skip-formatting` 关闭 ESLint 格式化规则，格式化以 Prettier 为准。

## 4. 后端（server/）说明

`server/` 目前没有 ESLint/Prettier 脚本与配置文件。

如果你想让后端也纳入统一规范，建议后续再补：

- `eslint` + `@eslint/js`（或你团队偏好的配置）
- 与 ESM/Node 的规则集
- 与 Prettier 集成（保持与前端一致的格式化风格）
