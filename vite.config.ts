import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

// NOTE: the `@shell` / `@plugins` / `@shared` aliases mirror the parent
// Tidy DS Toolbox so that files under src/plugins/tidy-color-finder/ resolve
// their imports identically in both repos. Keep these in sync with tsconfig.
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      "@shell": "/src",
      "@plugins": "/src/plugins",
      "@shared": "/src/shared",
    },
  },
});
