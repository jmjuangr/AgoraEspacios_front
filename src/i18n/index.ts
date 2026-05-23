import { createI18n } from "vue-i18n";

// textos traducidos
const messages = {
  es: {
    appName: "AgoraEspacios",
    header: {
      espacios: "Espacios",
      misReservas: "Mis reservas",
      reservas: "Reservas",
      admin: "Administración",
      login: "Acceder",
      logout: "Cerrar sesión",
    },
    login: {
      title: "Iniciar sesión",
      email: "Correo electrónico",
      password: "Contraseña",
      submit: "Entrar",
      registerLink: "¿No tienes cuenta? Regístrate",
    },
  },
  en: {
    appName: "AgoraEspacios",
    header: {
      espacios: "Spaces",
      misReservas: "My bookings",
      reservas: "Bookings",
      admin: "Administration",
      login: "Login",
      logout: "Logout",
    },
    login: {
      title: "Log in",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      registerLink: "No account yet? Register",
    },
  },
};

// Configuracion de i18n Se usa español por defecto y tambien como idioma de fallback
const i18n = createI18n({
  legacy: false,
  locale: "es",
  fallbackLocale: "es",
  messages,
});

export default i18n;
