// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import EspaciosView from "../views/EspaciosView.vue";
import EspacioDetalleView from "../views/EspacioDetalleView.vue";
import MisReservasView from "../views/MisReservasView.vue";
import AdminView from "../views/AdminView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // PÚBLICAS
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { public: true },
    },

    // USUARIO AUTENTICADO
    {
      path: "/espacios",
      name: "espacios",
      component: EspaciosView,
      meta: { requiresAuth: true },
    },
    {
      path: "/espacio/:id",
      name: "espacioDetalle",
      component: EspacioDetalleView,
      meta: { requiresAuth: true },
    },

    {
      path: "/mis-reservas",
      name: "misReservas",
      component: MisReservasView,
      meta: { requiresAuth: true },
    },

    // ADMIN
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // CUALQUIER OTRA COSA → ESPACIOS
    { path: "/:pathMatch(.*)*", redirect: "/espacios" },
  ],
});

// Guard global antes de cada navegación
router.beforeEach((to, _from) => {
  const auth = useAuthStore();

  // Rutas públicas -> siempre permitidas
  if (to.meta.public) {
    // Si ya estoy logueado y voy a /login o /register, redirígeme
    if (auth.isLoggedIn && (to.name === "login" || to.name === "register")) {
      return "/espacios";
    }
    return true;
  }

  // Rutas privadas -> requieren login
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return "/login";
  }

  // Ruta admin -> requiere rol Admin
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return "/espacios";
  }

  return true;
});

export default router;
