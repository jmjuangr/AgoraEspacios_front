// src/types/agora.ts

// ---------- AUTENTICACIÓN ----------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string; // "Admin" | "User"
  token: string;
  expiresAt: string;
}

// ---------- USUARIOS (para Admin) ----------
export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

// ---------- CATEGORÍAS DE ESPACIO ----------
export interface CategoriaEspacioDTO {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CategoriaEspacioCreateDTO {
  nombre: string;
  descripcion?: string;
}

export interface CategoriaEspacioUpdateDTO {
  nombre: string;
  descripcion?: string;
}

// ---------- ESPACIOS ----------
export interface EspacioDTO {
  id: number;
  nombre: string;
  categoriaEspacioId: number;
  categoriaNombre: string;
  capacidad: number;
  ubicacion: string;
  descripcion: string;
  imagenUrl: string;
}

export interface EspacioCreateDTO {
  nombre: string;
  categoriaEspacioId: number;
  capacidad: number;
  ubicacion?: string;
  descripcion?: string;
  imagenUrl?: string;
}

export interface EspacioUpdateDTO extends EspacioCreateDTO {}

// ---------- RESERVAS ----------
export interface ReservaDTO {
  id: number;
  espacioId: number;
  espacioNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  titulo: string;
}

export interface ReservaCreateDTO {
  espacioId: number;
  fechaInicio: string;
  fechaFin: string;
  titulo?: string;
}

export interface ReservaUpdateDTO {
  fechaInicio: string;
  fechaFin: string;
  titulo?: string;
  estado: string;
}
