import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In dev, forward /api/* to the Worker running on :8787.
    // Use 127.0.0.1 (not "localhost"): workerd binds IPv4, and on Node 17+
    // "localhost" can resolve to IPv6 (::1) first, which fails to connect.
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
