import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Çekirdek testleri saf Node'da koşar; yalnızca React testleri DOM ister.
    environmentMatchGlobs: [["test/react.test.tsx", "jsdom"]],
  },
});
