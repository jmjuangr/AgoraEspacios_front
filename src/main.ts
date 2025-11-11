import { createApp } from "vue";
import { createPinia } from "pinia";

import { createVuetify } from "vuetify";
import "vuetify/_styles.scss";

import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

import "./styles/globals.scss";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1E88E5",
          secondary: "#1565C0",
          background: "#F5F7FA",
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
