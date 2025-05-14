import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { splitVendorChunkPlugin } from "vite";

// 선택적 플러그인 로드 시도
let compressionPlugin = null;
let legacyPlugin = null;
let visualizerPlugin = null;

try {
  const compression = require("vite-plugin-compression").default;
  compressionPlugin = [
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ];
} catch (e) {
  console.warn("vite-plugin-compression not found, compression disabled");
}

try {
  const legacy = require("@vitejs/plugin-legacy").default;
  legacyPlugin = legacy({ targets: ["defaults", "not IE 11"] });
} catch (e) {
  console.warn("@vitejs/plugin-legacy not found, legacy support disabled");
}

try {
  const { visualizer } = require("rollup-plugin-visualizer");
  visualizerPlugin = visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
  });
} catch (e) {
  console.warn("rollup-plugin-visualizer not found, bundle analysis disabled");
}

export default defineConfig({
  root: "./",
  base: "/",
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ["@babel/plugin-transform-runtime"],
          // Material UI의 direct import 기능 비활성화
          // ["babel-plugin-direct-import", { modules: ["@mui/material", "@mui/icons-material"] }]
        ],
      },
    }),
    splitVendorChunkPlugin(),
    ...(compressionPlugin || []),
    legacyPlugin,
    visualizerPlugin,
  ].filter(Boolean),
  server: {
    open: true,
    port: 5173,
    proxy: {
      "/jitsi-api": {
        target: "https://your-jitsi-server.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jitsi-api/, ""),
      },
    },
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.trace",
        ],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "jitsi-meet": ["lib-jitsi-meet"],
          "ui-libs": ["@mui/material", "@mui/icons-material"],
          utils: ["lodash", "moment", "axios"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "lodash",
      "axios",
    ],
    exclude: ["lib-jitsi-meet"],
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
