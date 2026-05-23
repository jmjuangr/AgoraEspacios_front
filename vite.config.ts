import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

// Configuracion de Vite para compilar Vue 3 con Vuetify.
export default defineConfig({
  plugins: [
    // Plugin necesario para que Vite entienda archivos .vue.
    vue(),
    // Plugin de Vuetify para importar componentes automaticamente.
    vuetify({
      autoImport: true,
    }),
  ],
  resolve: {
    alias: {
      // Permite importar desde src usando "@/..." en vez de rutas relativas largas.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
