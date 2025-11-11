import { defineStore } from "pinia";

export interface AuthResponse {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: "User" | "Admin";
  token: string;
  expiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    usuarioId: null as number | null,
    nombre: "" as string,
    email: "" as string,
    rol: "" as "User" | "Admin" | "",
    token: "" as string,
    expiresAt: "" as string,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.rol === "Admin",
    bearerHeader: (state) =>
      state.token ? { Authorization: `Bearer ${state.token}` } : {},
  },

  actions: {
    async login(payload: LoginPayload) {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Error al iniciar sesión: " + errText);
      }

      const data: AuthResponse = await res.json();
      this._applyAuthResponse(data);
    },

    async register(payload: RegisterPayload) {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Error al registrarse: " + errText);
      }

      const data: AuthResponse = await res.json();
      this._applyAuthResponse(data);
    },

    logout() {
      this.usuarioId = null;
      this.nombre = "";
      this.email = "";
      this.rol = "";
      this.token = "";
      this.expiresAt = "";
    },

    _applyAuthResponse(data: AuthResponse) {
      this.usuarioId = data.usuarioId;
      this.nombre = data.nombre;
      this.email = data.email;
      this.rol = data.rol;
      this.token = data.token;
      this.expiresAt = data.expiresAt;
    },
  },
});
