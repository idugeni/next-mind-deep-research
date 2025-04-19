import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import next from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Base JS/TS config
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // TypeScript support
  {
    files: ["**/*.{ts,tsx}"],
    ...tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },

  // React support
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Next.js doesn't require React in scope
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Next.js support
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...next.configs.recommended.rules,
    },
  },
]);
