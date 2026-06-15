import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    // Only enable Nitro for production builds to avoid SSR dev errors
    process.env.NODE_ENV === "production" && nitro(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ].filter(Boolean),
});
