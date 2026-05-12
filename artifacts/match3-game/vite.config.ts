import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";

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
  plugins: [htmlInjectPlugin(), react(), tailwindcss()],
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "src"),
      buffer: "buffer/",
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    // PORT is injected by Replit workflows; ignored on Vercel (build only, no dev server).
    ...(process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    ...(process.env.PORT ? { port: Number(process.env.PORT) } : {}),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
