import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/dom/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.json",
  //   splitting: true,
});
