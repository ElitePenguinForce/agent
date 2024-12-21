import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
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
  },
  {
    files: ["**/*.ts"],

    rules: {
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
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];
