import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "cdk.out/"] },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
