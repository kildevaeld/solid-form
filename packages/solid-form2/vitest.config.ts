import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    browser: {
      enabled: true,
      instances: [
        {
          browser: "chromium",
          provider: playwright(),
        },
      ],
      headless: true,
    },
  },
});
