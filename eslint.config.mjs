import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,

  {
    ignores: [
      "dist/",
      "build",
      "tsoa/",
      "*.js",
      "src/database/migrations",
      "src/database/seeders",
    ],
  },
]);
