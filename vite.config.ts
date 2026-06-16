import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  define: {
    "process.env": {},
    "global": "globalThis",
  },
  plugins: [
    tanstackStart(),
    nitro({
      preset: "vercel",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    // This tells the build to ignore mongodb entirely for the browser
    rollupOptions: {
      external: ["mongodb"],
    },
  },
  ssr: {
    external: ["mongodb"],
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
});
