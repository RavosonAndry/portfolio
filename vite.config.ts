import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// choix des chemin
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/portfolio/" : "/",
  plugins: [vue(), tailwindcss()],
}));
