import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)), resolvePluginsRelativeTo: dirname(require.resolve("eslint-config-next/package.json")) });
export default [...compat.extends("next/core-web-vitals", "next/typescript")];
