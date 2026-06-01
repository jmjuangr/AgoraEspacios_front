// src/store/auth.ts
import { defineStore } from "pinia";
import { apiSend } from "../services/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/agora";

const STORAGE_KEYS = [
  "agora_token",
  "agora_rol",
  "agora_nombre",
  "agora_email",
  "agora_usuarioId",
  "agora_expiresAt",
];

function sesionExpirada(expiresAt: string): boolean {
  if (!expiresAt) return true;

  const expiresAtTime = new Date(expiresAt).getTime();

  return Number.isNaN(expiresAtTime) || expiresAtTime <= Date.now();
}

function limpiarLocalStorageSesion() {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export const useAuthStore = defineStore("auth", {
  // datos del usuario autenticado
  state: () => ({
    usuarioId: null as number | null,
    nombre: "" as string,
    email: "" as string,
    rol: "" as string, // admin o user
    token: "" as string,
    expiresAt: "" as string,
  }),

  getters: {
    // si hay token esta autenticado
    isAuthenticated: (state) =>
      !!state.token && !sesionExpirada(state.expiresAt),
    // comprobacion rol de amdmin
    isAdmin: (state) =>
      !!state.token &&
      !sesionExpirada(state.expiresAt) &&
      state.rol === "Admin",
  },

  actions: {
    // Recuperar datos de sesion al recargar la pagina para no perder el login
    cargarDesdeLocalStorage() {
      const token = localStorage.getItem("agora_token");
      const rol = localStorage.getItem("agora_rol");
      const nombre = localStorage.getItem("agora_nombre");
      const email = localStorage.getItem("agora_email");
      const usuarioId = localStorage.getItem("agora_usuarioId");
      const expiresAt = localStorage.getItem("agora_expiresAt");

      //Si en el localStorage queda una session antigua o incompleta se elimina

      if (!token || !expiresAt || sesionExpirada(expiresAt)) {
        this.logout();
        return;
      }

      if (token) this.token = token;
      if (rol) this.rol = rol;
      if (nombre) this.nombre = nombre;
      if (email) this.email = email;
      if (usuarioId) this.usuarioId = Number(usuarioId);
      if (expiresAt) this.expiresAt = expiresAt;
    },

    // se envia email y password al backend y guarda la sesion si el login es ok
    async login(payload: LoginRequest) {
      const data = await apiSend<AuthResponse>("/auth/login", "POST", payload);
      this._guardarSesion(data);
    },

    //  envio los datos de registro al backend y se guarda la sesión del nuevo usuario
    async register(payload: RegisterRequest) {
      const data = await apiSend<AuthResponse>(
        "/auth/register",
        "POST",
        payload,
      );
      this._guardarSesion(data);
    },

    // metodo para centralizar como se guarda una sesion en Pinia y localStorage
    _guardarSesion(data: AuthResponse) {
      this.usuarioId = data.usuarioId;
      this.nombre = data.nombre;
      this.email = data.email;
      this.rol = data.rol;
      this.token = data.token;
      this.expiresAt = data.expiresAt;

      localStorage.setItem("agora_token", data.token);
      localStorage.setItem("agora_rol", data.rol);
      localStorage.setItem("agora_nombre", data.nombre);
      localStorage.setItem("agora_email", data.email);
      localStorage.setItem("agora_usuarioId", String(data.usuarioId));
      localStorage.setItem("agora_expiresAt", String(data.expiresAt));
    },

    // Cirre de sesion se limpia el estado de Pinia y localStorage
    logout() {
      this.usuarioId = null;
      this.nombre = "";
      this.email = "";
      this.rol = "";
      this.token = "";
      this.expiresAt = "";

      limpiarLocalStorageSesion();
    },
  },
});
