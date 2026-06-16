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
  // We removed the strict 'external' blocks to allow the server to find its dependencies.
  // The 'require is not defined' error is already handled by our shims in router.tsx and __root.tsx.
});
