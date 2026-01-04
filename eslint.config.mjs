import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint 配置（Flat Config）
 *
 * 说明：
 * - Next.js 官方推荐的规则集：
 *   - core-web-vitals：包含更严格的性能/最佳实践规则
 *   - typescript：TypeScript 相关规则
 * - globalIgnores：用于覆盖/补充忽略目录（避免把构建产物纳入 lint）
 */

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    // - `.next`：Next 构建产物
    // - `out/build`：导出/构建产物
    // - `next-env.d.ts`：Next 自动生成的类型声明
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
