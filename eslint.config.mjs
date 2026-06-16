import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    settings: {
      react: { version: "19" },
    },
    rules: {
      // false positive for Next.js async Server Components: try/catch wraps
      // the async data fetch, not the JSX render itself
      "react-hooks/error-boundaries": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
