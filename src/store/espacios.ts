// src/store/espacios.ts
import { defineStore } from "pinia";
import { apiGet, apiSend } from "../services/api";
import type {
  CategoriaEspacioDTO,
  CategoriaEspacioCreateDTO,
  CategoriaEspacioUpdateDTO,
  EspacioDTO,
  EspacioCreateDTO,
  EspacioUpdateDTO,
  ReservaDTO,
  ReservaCreateDTO,
  ReservaUpdateDTO,
} from "../types/agora";

export const useEspaciosStore = defineStore("espacios", {
  // datos principales de espacios, categorias y reservas
  state: () => ({
    categorias: [] as CategoriaEspacioDTO[],
    espacios: [] as EspacioDTO[],
    reservasUsuario: [] as ReservaDTO[],
    reservasAdmin: [] as ReservaDTO[],
    reservasEspacio: [] as ReservaDTO[],
    cargando: false,
    error: "" as string,
  }),

  actions: {
    // guardo error
    setError(msg: string) {
      this.error = msg;
      console.error(msg);
    },

    // CATEGORÍAS
    // Carga todas las categorias desde la API
    async cargarCategorias() {
      this.cargando = true;
      this.error = "";
      try {
        // ajuste de ruta
        this.categorias =
          await apiGet<CategoriaEspacioDTO[]>("/categoriaespacio");
      } catch (err: any) {
        this.setError(err.message || "Error al cargar categorías");
      } finally {
        this.cargando = false;
      }
    },

    // Crea una categoria nueva y recarga el listado para verlo actualizado
    async crearCategoria(dto: CategoriaEspacioCreateDTO) {
      this.error = "";
      try {
        await apiSend<CategoriaEspacioDTO>("/categoriaespacio", "POST", dto);
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al crear categoría");
      }
    },

    // Actualiza una categoria existente usando id
    async actualizarCategoria(id: number, dto: CategoriaEspacioUpdateDTO) {
      this.error = "";
      try {
        await apiSend<CategoriaEspacioDTO>(
          `/categoriaespacio/${id}`,
          "PUT",
          dto,
        );
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar categoría");
      }
    },

    // Borra una categoria y refrescar
    async borrarCategoria(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/categoriaespacio/${id}`, "DELETE");
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al borrar categoría");
      }
    },

    // ESPACIOS
    // Carga todos los espacios disponibles
    async cargarEspacios() {
      this.cargando = true;
      this.error = "";
      try {
        this.espacios = await apiGet<EspacioDTO[]>("/espacio");
      } catch (err: any) {
        this.setError(err.message || "Error al cargar espacios");
      } finally {
        this.cargando = false;
      }
    },

    // Crea un espacio nuevo
    async crearEspacio(dto: EspacioCreateDTO) {
      this.error = "";
      try {
        await apiSend<EspacioDTO>("/espacio", "POST", dto);
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al crear espacio");
      }
    },

    // modifcar datos de espacio
    async actualizarEspacio(id: number, dto: EspacioUpdateDTO) {
      this.error = "";
      try {
        await apiSend<EspacioDTO>(`/espacio/${id}`, "PUT", dto);
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar espacio");
      }
    },

    // Elimina un espacio por id y recarga la lista
    async borrarEspacio(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/espacio/${id}`, "DELETE");
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al borrar espacio");
      }
    },

    // RESERVAS
    // Carga las reservas del usuario que ha iniciado sesion
    async cargarMisReservas() {
      this.cargando = true;
      this.error = "";
      try {
        // Ajusta la ruta
        this.reservasUsuario = await apiGet<ReservaDTO[]>("/reservas/mias");
      } catch (err: any) {
        this.setError(err.message || "Error al cargar mis reservas");
      } finally {
        this.cargando = false;
      }
    },

    // Carga todas las reservas para la vista de admin
    async cargarReservasAdmin() {
      this.cargando = true;
      this.error = "";
      try {
        this.reservasAdmin = await apiGet<ReservaDTO[]>("/reservas");
      } catch (err: any) {
        this.setError(err.message || "Error al cargar reservas (admin)");
      } finally {
        this.cargando = false;
      }
    },

    // Carga las reservas de un espacio  para pintar calendario
    async cargarReservasPorEspacio(espacioId: number) {
      this.cargando = true;
      this.error = "";
      try {
        this.reservasEspacio = await apiGet<ReservaDTO[]>(
          `/reservas/espacio/${espacioId}`,
        );
      } catch (err: any) {
        this.setError(err.message || "Error al cargar reservas del espacio");
      } finally {
        this.cargando = false;
      }
    },

    // Crea una reserva nueva y actualiza el listado personal del usuario
    async crearReserva(dto: ReservaCreateDTO) {
      this.error = "";
      try {
        await apiSend<ReservaDTO>("/reservas", "POST", dto);
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al crear reserva");
      }
    },

    // Actualiza una reserva propia del usuario
    async actualizarReserva(id: number, dto: ReservaUpdateDTO) {
      this.error = "";
      try {
        await apiSend<ReservaDTO>(`/reservas/${id}`, "PUT", dto);
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar reserva");
      }
    },

    // Actualiza una reserva desde admin y refrescar
    async actualizarReservaAdmin(id: number, dto: ReservaUpdateDTO) {
      this.error = "";
      try {
        await apiSend<ReservaDTO>(`/reservas/${id}`, "PUT", dto);
        await this.cargarReservasAdmin();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar reserva (admin)");
      }
    },

    // Cancelar una reserva propia del usuario
    async cancelarReserva(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/reservas/${id}/cancelar`, "PATCH");
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al cancelar reserva");
      }
    },

    // Cancelar una reserva desde la pantalla de admin
    async cancelarReservaAdmin(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/reservas/${id}/cancelar`, "PATCH");
        await this.cargarReservasAdmin();
      } catch (err: any) {
        this.setError(err.message || "Error al cancelar reserva (admin)");
      }
    },

    // Marca una reserva como aprobada desde admin
    async aprobarReservaAdmin(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/reservas/${id}/aprobar`, "PATCH");
        await this.cargarReservasAdmin();
      } catch (err: any) {
        this.setError(err.message || "Error al aprobar reserva");
      }
    },

    // Marca una reserva como rechazada desde admin
    async rechazarReservaAdmin(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/reservas/${id}/rechazar`, "PATCH");
        await this.cargarReservasAdmin();
      } catch (err: any) {
        this.setError(err.message || "Error al rechazar reserva");
      }
    },
  },
});
