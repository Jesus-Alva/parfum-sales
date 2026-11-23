import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),
  // El proyecto ya usa `any` ampliamente; no convertir esos usos en errores
  // de despliegue durante la migración de la configuración de ESLint.
  { rules: { "@typescript-eslint/no-explicit-any": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
