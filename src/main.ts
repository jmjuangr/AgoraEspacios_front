import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";

// Importamos los iconos opcionales (recomendado)
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";

// Estilos base del proyecto
import "./assets/base.css";
import "./assets/main.css";
import "./assets/styles/_variables.scss";
import "./assets/styles/_mixins.scss";

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#2563EB",
          secondary: "#06B6D4",
          background: "#F3F4F6",
        },
      },
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(i18n);

app.mount("#app");
