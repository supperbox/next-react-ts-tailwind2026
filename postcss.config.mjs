/**
 * PostCSS 配置
 *
 * 说明：
 * - Tailwind v4 推荐通过 `@tailwindcss/postcss` 插件接入。
 * - 若后续需要 autoprefixer 或其他插件，也在这里添加。
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
