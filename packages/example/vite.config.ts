import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    minify: false,
  },
  server: {
    port: 3000,
  },
});
