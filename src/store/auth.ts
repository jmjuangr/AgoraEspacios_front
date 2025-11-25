// src/store/auth.ts
import { defineStore } from "pinia";
import { apiSend } from "../services/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/agora";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    usuarioId: null as number | null,
    nombre: "" as string,
    email: "" as string,
    rol: "" as string, // "Admin" | "User" | ""
    token: "" as string,
    expiresAt: "" as string,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.rol === "Admin",
  },

  actions: {
    cargarDesdeLocalStorage() {
      const token = localStorage.getItem("agora_token");
      const rol = localStorage.getItem("agora_rol");
      const nombre = localStorage.getItem("agora_nombre");
      const email = localStorage.getItem("agora_email");
      const usuarioId = localStorage.getItem("agora_usuarioId");
      const expiresAt = localStorage.getItem("agora_expiresAt");

      if (token) this.token = token;
      if (rol) this.rol = rol;
      if (nombre) this.nombre = nombre;
      if (email) this.email = email;
      if (usuarioId) this.usuarioId = Number(usuarioId);
      if (expiresAt) this.expiresAt = expiresAt;
    },

    async login(payload: LoginRequest) {
      const data = await apiSend<AuthResponse>("/auth/login", "POST", payload);
      this._guardarSesion(data);
    },

    async register(payload: RegisterRequest) {
      const data = await apiSend<AuthResponse>(
        "/auth/register",
        "POST",
        payload
      );
      this._guardarSesion(data);
    },

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

    logout() {
      this.usuarioId = null;
      this.nombre = "";
      this.email = "";
      this.rol = "";
      this.token = "";
      this.expiresAt = "";

      localStorage.removeItem("agora_token");
      localStorage.removeItem("agora_rol");
      localStorage.removeItem("agora_nombre");
      localStorage.removeItem("agora_email");
      localStorage.removeItem("agora_usuarioId");
      localStorage.removeItem("agora_expiresAt");
    },
  },
});
