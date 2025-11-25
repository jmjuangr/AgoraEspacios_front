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
  state: () => ({
    categorias: [] as CategoriaEspacioDTO[],
    espacios: [] as EspacioDTO[],
    reservasUsuario: [] as ReservaDTO[],
    reservasAdmin: [] as ReservaDTO[],
    cargando: false,
    error: "" as string,
  }),

  actions: {
    setError(msg: string) {
      this.error = msg;
      console.error(msg);
    },

    // ---------- CATEGORÍAS ----------
    async cargarCategorias() {
      this.cargando = true;
      this.error = "";
      try {
        // Ajusta la ruta si tu controlador usa otro nombre
        this.categorias = await apiGet<CategoriaEspacioDTO[]>(
          "/categoriaespacio"
        );
      } catch (err: any) {
        this.setError(err.message || "Error al cargar categorías");
      } finally {
        this.cargando = false;
      }
    },

    async crearCategoria(dto: CategoriaEspacioCreateDTO) {
      this.error = "";
      try {
        await apiSend<CategoriaEspacioDTO>("/categoriaespacio", "POST", dto);
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al crear categoría");
      }
    },

    async actualizarCategoria(id: number, dto: CategoriaEspacioUpdateDTO) {
      this.error = "";
      try {
        await apiSend<CategoriaEspacioDTO>(
          `/categoriaespacio/${id}`,
          "PUT",
          dto
        );
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar categoría");
      }
    },

    async borrarCategoria(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/categoriaespacio/${id}`, "DELETE");
        await this.cargarCategorias();
      } catch (err: any) {
        this.setError(err.message || "Error al borrar categoría");
      }
    },

    // ---------- ESPACIOS ----------
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

    async crearEspacio(dto: EspacioCreateDTO) {
      this.error = "";
      try {
        await apiSend<EspacioDTO>("/espacio", "POST", dto);
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al crear espacio");
      }
    },

    async actualizarEspacio(id: number, dto: EspacioUpdateDTO) {
      this.error = "";
      try {
        await apiSend<EspacioDTO>(`/espacio/${id}`, "PUT", dto);
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar espacio");
      }
    },

    async borrarEspacio(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/espacio/${id}`, "DELETE");
        await this.cargarEspacios();
      } catch (err: any) {
        this.setError(err.message || "Error al borrar espacio");
      }
    },

    // ---------- RESERVAS ----------
    async cargarMisReservas() {
      this.cargando = true;
      this.error = "";
      try {
        // Ajusta la ruta al endpoint real (por ejemplo /reservas/mis)
        this.reservasUsuario = await apiGet<ReservaDTO[]>("/reservas/mias");
      } catch (err: any) {
        this.setError(err.message || "Error al cargar mis reservas");
      } finally {
        this.cargando = false;
      }
    },

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

    async crearReserva(dto: ReservaCreateDTO) {
      this.error = "";
      try {
        await apiSend<ReservaDTO>("/reservas", "POST", dto);
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al crear reserva");
      }
    },

    async actualizarReserva(id: number, dto: ReservaUpdateDTO) {
      this.error = "";
      try {
        await apiSend<ReservaDTO>(`/reservas/${id}`, "PUT", dto);
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al actualizar reserva");
      }
    },

    async borrarReserva(id: number) {
      this.error = "";
      try {
        await apiSend<void>(`/reservas/${id}`, "DELETE");
        await this.cargarMisReservas();
      } catch (err: any) {
        this.setError(err.message || "Error al borrar reserva");
      }
    },
  },
});
