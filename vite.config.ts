import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Global definitions to stop libraries from crashing the browser
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
  ssr: {
    external: ["mongodb"],
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
});
