import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { Plugin } from "vite";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// Resolve the canonical app URL from Replit domains or a fallback
const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
const appUrl = replitDomain
  ? `https://${replitDomain}`
  : "https://candy-crush.replit.app";

// Build the Farcaster Frame v2 (MiniApp) meta-tag content
const frameContent = JSON.stringify({
  version: "next",
  imageUrl: `${appUrl}/og-image.svg`,
  button: {
    title: "🍬 Play Candy Crush",
    action: {
      type: "launch_frame",
      name: "Candy Crush on Base",
      url: appUrl,
      splashImageUrl: `${appUrl}/og-image.svg`,
      splashBackgroundColor: "#1a0a3a",
    },
  },
});

// Vite plugin: inject frame content + resolved app URL into index.html
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
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
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
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
