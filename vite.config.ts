import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  ssr: {
    external: ["mongodb"],
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
  plugins: [
    tanstackStart(),
    // Nitro is required for stable Vercel deployment of server functions
    nitro({
      preset: "vercel",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
