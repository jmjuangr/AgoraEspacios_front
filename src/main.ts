import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";

// iconos
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";

//Estilos base
import "./assets/base.css";
import "./assets/main.css";

//conf vuetify
const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "agoraDark",
    themes: {
      agoraDark: {
        dark: true,
        colors: {
          primary: "#2563EB",
          secondary: "#06B6D4",
          background: "#020617",
          surface: "#0B1120",
          error: "#EF4444",
          warning: "#EAB308",
          success: "#22C55E",
          info: "#38BDF8",
        },
      },
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount("#app");
