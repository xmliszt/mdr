import { FlatCompat } from "@eslint/eslintrc";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
    },
  },
  {
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
];

export default eslintConfig;
