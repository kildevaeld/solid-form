import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
  },
});
