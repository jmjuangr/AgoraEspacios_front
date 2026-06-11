// src/types/agora.ts

//AUTENTICACIÓN
// Datos iniciar sesion
export interface LoginRequest {
  email: string;
  password: string;
}

// Datos  cuenta nueva
export interface RegisterRequest {
  nombre: string;
  email: string;
  nif: string;
  password: string;
}

// Respuesta  cuando login o registro ok
export interface AuthResponse {
  usuarioId: number;
  nombre: string;
  email: string;
  nif: string;
  rol: string; // "Admin" | "User"
  token: string;
  expiresAt: string;
}

// USUARIOS (Admin)

export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  nif: string;
  rol: string;
}

export interface UsuarioCreateDTO {
  nombre: string;
  email: string;
  nif: string;
  password: string;
  rol: string;
}

export interface UsuarioUpdateDTO {
  nombre: string;
  email: string;
  nif: string;
  rol: string;
}

// CATEGORÍAS DE ESPACIO

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
  id: number;
  nombre: string;
  descripcion?: string;
}

//  ESPACIOS

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

// Al actualizar se reutilizan los campos de creacion y se anade el id
export interface EspacioUpdateDTO extends EspacioCreateDTO {
  id: number;
}

//  RESERVAS

export interface ReservaDTO {
  id: number;
  espacioId: number;
  espacioNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
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
}
