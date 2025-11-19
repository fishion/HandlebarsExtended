import js from "@eslint/js"
import tslint from "typescript-eslint"
import globals from "globals"
import prettier from "eslint-config-prettier"
import jestPlugin from "eslint-plugin-jest"

export default [
  js.configs.recommended,
  ...tslint.configs.recommended,
  prettier,
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.test.js", "**/*.test.ts", "**/*.spec.js", "**/*.spec.ts"],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ["node_modules", "**/node_modules", "dist/**/*", "coverage/**/*"],
  },
  {
    rules: {
      "one-var": ["warn", "never"],
      "@typescript-eslint/consistent-indexed-object-style": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]
