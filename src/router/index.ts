// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

import HomeView from "../views/LoginView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AdminView from "../views/AdminView.vue";
import MisReservasView from "../views/MisReservasView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/register", name: "register", component: RegisterView },
    {
      path: "/mis-reservas",
      name: "mis-reservas",
      component: MisReservasView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (!auth.token) {
    auth.cargarDesdeLocalStorage();
  }

  const requiresAuth = (to.meta as any).requiresAuth;
  const requiresAdmin = (to.meta as any).requiresAdmin;

  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: "login" });
  }

  if (requiresAdmin && !auth.isAdmin) {
    return next({ name: "home" });
  }

  next();
});

export default router;
