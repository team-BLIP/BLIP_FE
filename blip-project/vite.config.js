import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "./", // root를 현재 디렉토리로 설정
  base: "/", // 배포 시의 기본 URL을 프로젝트의 루트로 설정
  plugins: [react()],
  server: {
    open: true, // 서버 시작 시 브라우저 자동 열기
    port: 5173, // 기본 포트 설정
  },
  build: {
    chunkSizeWarningLimit: 1500, // 번들 크기 경고 크기 설정
  },
});
