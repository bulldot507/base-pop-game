import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";

// PORT and BASE_PATH are injected by Replit workflows.
// On Vercel (or any other static host) they are absent — safe to ignore.
const port = process.env.PORT ? Number(process.env.PORT) : undefined;
const basePath = process.env.BASE_PATH ?? "/";

const appUrl = process.env.VITE_APP_URL ?? "https://basepop.space";

const frameContent = JSON.stringify({
  version: "next",
  imageUrl: "https://basepop.space/og-image.svg",
  button: {
    title: "🎮 Play Base Pop",
    action: {
      type: "launch_frame",
      name: "Base Pop",
      url: "https://basepop.space",
      splashImageUrl: "https://basepop.space/og-image.svg",
      splashBackgroundColor: "#1a0a3a",
    },
  },
});

function htmlInjectPlugin(): Plugin {
  return {
    name: "html-inject",
    transformIndexHtml(html) {
      return html
        .replace(/__VITE_APP_URL__/g, appUrl)
        .replace(/__FC_FRAME_CONTENT__/g, frameContent.replace(/'/g, "&#39;"));
    },
  };
}

export default defineConfig({
  base: basePath,
  define: {
    "import.meta.env.VITE_CDP_API_KEY": JSON.stringify(
      process.env.VITE_CDP_API_KEY ?? process.env.CDP_API_KEY ?? ""
    ),
    "import.meta.env.VITE_LEADERBOARD_CONTRACT_ADDRESS": JSON.stringify(
      process.env.VITE_LEADERBOARD_CONTRACT_ADDRESS ?? ""
    ),
    "import.meta.env.VITE_APP_URL": JSON.stringify(appUrl),
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  plugins: [
    htmlInjectPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      buffer: "buffer/",
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    ...(port !== undefined && { port, strictPort: true }),
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    ...(port !== undefined && { port }),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
