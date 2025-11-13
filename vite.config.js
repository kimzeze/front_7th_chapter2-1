import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // 프로덕션 빌드(GitHub Pages)에만 base path 적용
  base: mode === "production" ? "/front_7th_chapter2-1/" : "/",
  publicDir: "public", // MSW mockServiceWorker.js 포함
  build: {
    outDir: "dist",
  },
}));
