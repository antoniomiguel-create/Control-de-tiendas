// Construye la vista previa como un solo HTML, sin servidor ni backend.
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const src = path.resolve(__dirname, "../src");

export default defineConfig({
  root: __dirname,
  plugins: [
    {
      name: "preview-root",
      enforce: "pre",
      resolveId(id, importer) {
        if (id === "./routes/__root" && importer?.endsWith("routeTree.gen.ts")) {
          return path.resolve(__dirname, "root.tsx");
        }
      },
    },
    react(),
    tailwindcss(),
    viteSingleFile(),
  ],
  resolve: { alias: { "@": src } },
  build: { outDir: path.resolve(__dirname, "dist"), emptyOutDir: true, rollupOptions: { input: path.resolve(__dirname, "app.html") } },
});
