import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "script",
      parserOptions: {
        project: true,
        tsconfigRootDir: "./",
      },
    },
    ignores: [
      "node_modules",
      "dist",
      "logs",
      "*.log",
      "*.tsbuildinfo",
      ".env",
      ".env.*",
    ],
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-cond-assign": ["error", "always"],
      eqeqeq: ["error"],
      "no-constant-binary-expression": "error",
      curly: "error",
      "default-case": "error",
      "default-case-last": "error",
      "no-constant-condition": "error",
      "no-duplicate-imports": "error",
      "no-fallthrough": "error",
      "use-isnan": "error",
      "no-loss-of-precision": "error",
      "no-promise-executor-return": "error",
      "no-useless-escape": "error",
      "prefer-object-spread": "error",
      "prefer-spread": "error",
      "no-empty": "error",
      "no-useless-catch": "error",
    },
  },
];
