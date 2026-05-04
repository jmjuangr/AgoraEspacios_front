<template>
  <v-container class="reservas-container">
    <v-card class="ag-card reservas-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span class="text-h6">Reservas</span>
          <p class="reservas-card__subtitle">
            Vista de administracion para revisar, aprobar, rechazar o cancelar
            reservas de todos los usuarios.
          </p>
        </div>

        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          :loading="cargando"
          @click="recargar"
        >
          Recargar
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4" density="comfortable">
          {{ error }}
        </v-alert>

        <section class="reservas__filters mb-6">
          <div class="reservas__filters-header">
            <div>
              <h3 class="reservas__subtitle">Filtrar reservas</h3>
              <p class="reservas__filters-text">
                Puedes filtrar por usuario, espacio, estado y rango de fechas.
              </p>
            </div>

            <v-chip size="small" class="reservas__chip">
              {{ reservasFiltradas.length }} resultados
            </v-chip>
          </div>

          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filtros.usuario"
                label="Usuario"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filtros.espacioId"
                :items="espaciosOptions"
                item-title="nombre"
                item-value="id"
                label="Espacio"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="filtros.estado"
                :items="estadosOptions"
                label="Estado"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="filtros.fechaInicio"
                label="Desde"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="filtros.fechaFin"
                label="Hasta"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div class="reservas__filters-actions">
            <v-btn
              size="small"
              variant="outlined"
              class="ag-btn-secondary"
              :disabled="!hayFiltrosActivos"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </v-btn>
          </div>
        </section>

        <v-skeleton-loader
          v-if="cargando && reservasTabla.length === 0"
          type="table"
          class="mb-4"
        />

        <div v-else-if="reservasFiltradas.length === 0" class="text-caption">
          No hay reservas que coincidan con los filtros actuales.
        </div>

        <v-data-table
          v-else
          :items="reservasFiltradas"
          :headers="headers"
          item-value="id"
          density="comfortable"
        >
          <template #item.usuario="{ item }">
            <div class="reservas__cell-main">
              <span>{{ item.usuarioNombre }}</span>
              <small>ID usuario: {{ item.usuarioId }}</small>
            </div>
          </template>

          <template #item.espacio="{ item }">
            <div class="reservas__cell-main">
              <span>{{ item.espacioNombre }}</span>
              <small>ID espacio: {{ item.espacioId }}</small>
            </div>
          </template>

          <template #item.rango="{ item }">
            <div class="reservas__rango">
              <span>{{ formatearFechaHora(item.fechaInicio) }}</span>
              <span class="reservas__rango-separador">-></span>
              <span>{{ formatearFechaHora(item.fechaFin) }}</span>
            </div>
          </template>

          <template #item.acciones="{ item }">
            <v-btn
              v-if="sePuedeEditar(item)"
              size="small"
              color="primary"
              variant="text"
              @click="abrirEditar(item)"
            >
              Editar
            </v-btn>

            <v-btn
              v-if="estaPendiente(item)"
              size="small"
              color="success"
              variant="text"
              @click="aprobar(item.id)"
            >
              Aprobar
            </v-btn>

            <v-btn
              v-if="estaPendiente(item)"
              size="small"
              color="warning"
              variant="text"
              @click="rechazar(item.id)"
            >
              Rechazar
            </v-btn>

            <v-btn
              v-if="sePuedeCancelar(item)"
              size="small"
              color="error"
              variant="text"
              @click="cancelar(item.id)"
            >
              Cancelar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="editDialog" max-width="520">
      <v-card class="ag-card">
        <v-card-title>Editar reserva</v-card-title>

        <v-card-text>
          <v-form @submit.prevent="guardarEdicion">
            <v-text-field
              v-model="editForm.fechaInicio"
              label="Fecha inicio"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="editForm.fechaFin"
              label="Fecha fin"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="editForm.titulo"
              label="Titulo"
              variant="outlined"
              density="comfortable"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarEditar">Cancelar</v-btn>
          <v-btn color="primary" :loading="cargando" @click="guardarEdicion">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useEspaciosStore } from "../store/espacios";

type ReservaTablaItem = {
  id: number;
  espacioId: number;
  espacioNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
};

const espaciosStore = useEspaciosStore();
const editDialog = ref(false);

const filtros = reactive({
  usuario: null as string | null,
  espacioId: null as number | null,
  estado: null as string | null,
  fechaInicio: "",
  fechaFin: "",
});

const editForm = reactive({
  id: null as number | null,
  fechaInicio: "",
  fechaFin: "",
  titulo: "",
});

const cargando = computed(() => espaciosStore.cargando);
const error = computed(() => espaciosStore.error);
const espaciosOptions = computed(() => espaciosStore.espacios);

const headers = [
  { title: "Usuario", value: "usuario" },
  { title: "Espacio", value: "espacio" },
  { title: "Titulo", value: "titulo" },
  { title: "Rango", value: "rango" },
  { title: "Estado", value: "estado" },
  { title: "Acciones", value: "acciones", sortable: false },
];

const reservasTabla = computed<ReservaTablaItem[]>(() =>
  espaciosStore.reservasAdmin.map((r: any) => {
    const espacioId = r.espacioId ?? r.EspacioId ?? 0;
    const usuarioId = r.usuarioId ?? r.UsuarioId ?? 0;
    const espacio = espaciosStore.espacios.find((e) => e.id === espacioId);

    return {
      id: r.id ?? r.Id,
      espacioId,
      espacioNombre:
        r.espacioNombre ??
        r.EspacioNombre ??
        r.espacio?.nombre ??
        r.Espacio?.Nombre ??
        espacio?.nombre ??
        "-",
      usuarioId,
      usuarioNombre:
        r.usuarioNombre ??
        r.UsuarioNombre ??
        r.usuario?.nombre ??
        r.Usuario?.Nombre ??
        "-",
      titulo: r.titulo ?? r.Titulo ?? "",
      fechaInicio: r.fechaInicio ?? r.FechaInicio,
      fechaFin: r.fechaFin ?? r.FechaFin,
      estado: r.estado ?? r.Estado ?? "",
    };
  })
);

const estadosOptions = computed(() => {
  const estados = new Set<string>();

  reservasTabla.value.forEach((reserva) => {
    if (reserva.estado.trim()) {
      estados.add(reserva.estado);
    }
  });

  return Array.from(estados).sort((a, b) => a.localeCompare(b));
});

const reservasFiltradas = computed(() =>
  reservasTabla.value.filter((reserva) => {
    const usuarioFiltro = (filtros.usuario ?? "").trim().toLowerCase();

    const coincideUsuario = usuarioFiltro
      ? reserva.usuarioNombre.toLowerCase().includes(usuarioFiltro) ||
        String(reserva.usuarioId).includes(usuarioFiltro)
      : true;

    const coincideEspacio = filtros.espacioId
      ? reserva.espacioId === filtros.espacioId
      : true;

    const coincideEstado = filtros.estado
      ? reserva.estado === filtros.estado
      : true;

    const fechaInicioReserva = extraerFecha(reserva.fechaInicio);
    const fechaFinReserva = extraerFecha(reserva.fechaFin);

    const coincideFechaInicio = filtros.fechaInicio
      ? fechaInicioReserva >= filtros.fechaInicio
      : true;

    const coincideFechaFin = filtros.fechaFin
      ? fechaFinReserva <= filtros.fechaFin
      : true;

    return (
      coincideUsuario &&
      coincideEspacio &&
      coincideEstado &&
      coincideFechaInicio &&
      coincideFechaFin
    );
  })
);

const hayFiltrosActivos = computed(
  () =>
    (filtros.usuario ?? "").trim().length > 0 ||
    filtros.espacioId !== null ||
    (filtros.estado ?? "").trim().length > 0 ||
    filtros.fechaInicio.length > 0 ||
    filtros.fechaFin.length > 0
);

function extraerFecha(valor: string): string {
  if (!valor) return "";
  return valor.slice(0, 10);
}

function formatearFechaHora(valor: string | Date): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function limpiarFiltros() {
  filtros.usuario = "";
  filtros.espacioId = null;
  filtros.estado = "";
  filtros.fechaInicio = "";
  filtros.fechaFin = "";
}

function toDatetimeLocal(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function recargar() {
  await espaciosStore.cargarReservasAdmin();
}

function estaPendiente(item: ReservaTablaItem): boolean {
  return item.estado.toLowerCase() === "pendiente";
}

function sePuedeEditar(item: ReservaTablaItem): boolean {
  const estado = item.estado.toLowerCase();
  return estado === "pendiente" || estado === "aprobada";
}

function sePuedeCancelar(item: ReservaTablaItem): boolean {
  const estado = item.estado.toLowerCase();
  return estado === "pendiente" || estado === "aprobada";
}

function abrirEditar(item: ReservaTablaItem) {
  editForm.id = item.id;
  editForm.fechaInicio = toDatetimeLocal(item.fechaInicio);
  editForm.fechaFin = toDatetimeLocal(item.fechaFin);
  editForm.titulo = item.titulo;
  editDialog.value = true;
}

function cerrarEditar() {
  editDialog.value = false;
  editForm.id = null;
  editForm.fechaInicio = "";
  editForm.fechaFin = "";
  editForm.titulo = "";
}

async function guardarEdicion() {
  if (!editForm.id || !editForm.fechaInicio || !editForm.fechaFin) return;

  await espaciosStore.actualizarReservaAdmin(editForm.id, {
    fechaInicio: editForm.fechaInicio,
    fechaFin: editForm.fechaFin,
    titulo: editForm.titulo.trim() || undefined,
  });

  if (!espaciosStore.error) {
    cerrarEditar();
  }
}

async function aprobar(id: number) {
  if (!confirm("Seguro que quieres aprobar esta reserva?")) return;
  await espaciosStore.aprobarReservaAdmin(id);
}

async function rechazar(id: number) {
  if (!confirm("Seguro que quieres rechazar esta reserva?")) return;
  await espaciosStore.rechazarReservaAdmin(id);
}

async function cancelar(id: number) {
  if (!confirm("Seguro que quieres cancelar esta reserva?")) return;
  await espaciosStore.cancelarReservaAdmin(id);
}

onMounted(async () => {
  await espaciosStore.cargarEspacios();
  await espaciosStore.cargarReservasAdmin();
});
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.reservas-container {
  @include ag-page-container;
}

.reservas-card {
  @include ag-section($spacing-4);
}

.reservas-card__subtitle {
  margin: $spacing-1 0 0;
  color: $color-text-muted;
  font-size: 0.85rem;
  font-weight: 400;
}

.reservas__subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: $color-heading;
  margin-bottom: $spacing-2;
}

.reservas__filters {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.reservas__filters-header {
  @include ag-card-header;
  margin-bottom: 0;
}

.reservas__filters-text {
  color: $color-text-muted;
  font-size: 0.85rem;
}

.reservas__filters-actions {
  display: flex;
  justify-content: flex-end;
}

.reservas__chip {
  background-color: rgba(6, 182, 212, 0.18);
  color: $color-secondary-soft;
}

.reservas__cell-main {
  display: flex;
  flex-direction: column;
  gap: 2px;

  small {
    color: $color-text-muted;
    font-size: 0.75rem;
  }
}

.reservas__rango {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.reservas__rango-separador {
  opacity: 0.7;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
