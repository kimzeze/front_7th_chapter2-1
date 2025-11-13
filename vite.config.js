import { defineConfig } from "vite";

export default defineConfig({
  base: "/front_7th_chapter2-1/",
  publicDir: "public", // MSW mockServiceWorker.js 포함
  build: {
    outDir: "dist",
  },
});
