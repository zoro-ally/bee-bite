import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Ensure mongodb (CommonJS) is never bundled into the client or
  // pre-bundled by Vite — it must stay server-only at runtime.
  ssr: {
    external: ["mongodb"],
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
