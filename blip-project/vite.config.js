// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1500,
  },
  plugins: [react()],
  server: {
    proxy: {
      "/external_api.js": {
        target: "https://meet.jit.si",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/external_api.js/, "/external_api.js"),
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  assetsInclude: ["**/*.svg"],
});
