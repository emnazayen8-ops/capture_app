import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api vers le backend Spring Boot en dev pour éviter les soucis de CORS/URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
