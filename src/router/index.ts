// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

import HomeView from "../views/LoginView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import AdminView from "../views/AdminView.vue";
import MisReservasView from "../views/MisReservasView.vue";
import ReservasView from "../views/ReservasView.vue";
import EspaciosView from "../views/EspaciosView.vue";
import EspacioDetalleView from "../views/EspacioDetalleView.vue";

const router = createRouter({
  // rutas /
  history: createWebHistory(),
  // paginas de la aplicación y permisos
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/register", name: "register", component: RegisterView },
    {
      path: "/espacios",
      name: "espacios",
      component: EspaciosView,
      meta: { requiresAuth: true },
    },
    {
      path: "/espacios/:id",
      name: "espacioDetalle",
      component: EspacioDetalleView,
      meta: { requiresAuth: true },
    },
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
    {
      path: "/reservas",
      name: "reservas",
      component: ReservasView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

// guard que se ejecuta antes de entrar en cualquier ruta
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  // cargar desde localStorage por si rerefrsca pagina
  if (!auth.token) {
    auth.cargarDesdeLocalStorage();
  }

  // leo los permisos definidos en meta para saber si la ruta necesita login o ser admin
  const requiresAuth = (to.meta as any).requiresAuth;
  const requiresAdmin = (to.meta as any).requiresAdmin;

  // si la ruta necesita login y el usuario no esta autenticado lo mando al login.
  if (requiresAuth && !auth.isAuthenticated) {
    return next({ name: "login" });
  }

  // Si la ruta necesita ser admin y el usuario no lo es lo mando al inicio
  if (requiresAdmin && !auth.isAdmin) {
    return next({ name: "home" });
  }

  next();
});

export default router;
