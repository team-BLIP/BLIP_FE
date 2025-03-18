import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      "/users": {
        target: "http://192.168.1.25:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/users/, ""),
      },
    },
  },
});
