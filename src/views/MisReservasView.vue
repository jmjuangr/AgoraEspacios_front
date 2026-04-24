<template>
  <v-container class="mis-reservas-container">
    <v-card class="ag-card mis-reservas-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Mis reservas</span>
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          @click="recargar"
          :loading="cargando"
        >
          Recargar
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4" density="comfortable">
          {{ error }}
        </v-alert>

        <section class="mis-reservas__filters mb-6">
          <div class="mis-reservas__filters-header">
            <div>
              <h3 class="mis-reservas__subtitle">Filtrar reservas</h3>
              <p class="mis-reservas__filters-text">
                Puedes filtrar por espacio, categoria y rango de fechas.
              </p>
            </div>

            <v-chip size="small" class="mis-reservas__chip">
              {{ reservasFiltradas.length }} resultados
            </v-chip>
          </div>

          <v-row>
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

            <v-col cols="12" md="3">
              <v-select
                v-model="filtros.categoria"
                :items="categoriasOptions"
                label="Categoria"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="filtros.fechaInicio"
                label="Fecha inicio"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="filtros.fechaFin"
                label="Fecha fin"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div class="mis-reservas__filters-actions">
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

        <section>
          <h3 class="mis-reservas__subtitle mb-3">Listado de mis reservas</h3>

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
            :expanded="expandedRows"
            item-value="rowKey"
            density="comfortable"
          >
            <template #item.rango="{ item }">
              <div class="mis-reservas__rango">
                <span>{{ formatearFechaHora(item.fechaInicio) }}</span>
                <span class="mis-reservas__rango-separador">-></span>
                <span>{{ formatearFechaHora(item.fechaFin) }}</span>
              </div>
            </template>

            <template #item.detalles="{ item }">
              <v-btn
                size="small"
                variant="outlined"
                class="ag-btn-secondary"
                @click="toggleDetalles(item.rowKey)"
              >
                {{ isExpanded(item.rowKey) ? "Ocultar" : "+ Detalles" }}
              </v-btn>
            </template>

            <template #item.acciones="{ item }">
              <v-btn
                icon
                size="small"
                color="error"
                variant="text"
                @click="borrar(item.id)"
              >
                <v-icon size="18">mdi-delete-outline</v-icon>
              </v-btn>
            </template>

            <template #expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length" class="mis-reservas__expanded-cell">
                  <v-expand-transition>
                    <div
                      v-if="isExpanded(item.rowKey)"
                      class="mis-reservas__detalle-sala"
                    >
                      <div
                        v-if="getEspacioReserva(item)?.imagenUrl"
                        class="mis-reservas__detalle-media"
                      >
                        <v-img
                          :src="getEspacioReserva(item)?.imagenUrl"
                          height="180"
                          cover
                          class="mis-reservas__detalle-image"
                        />
                      </div>
                      <div
                        v-else
                        class="mis-reservas__detalle-media mis-reservas__detalle-placeholder"
                      >
                        <v-icon size="40">mdi-image-off-outline</v-icon>
                        <span>Sin imagen disponible</span>
                      </div>

                      <div class="mis-reservas__detalle-body">
                        <div class="mis-reservas__detalle-title">
                          {{ getEspacioReserva(item)?.nombre || item.espacioNombre }}
                        </div>
                        <div class="mis-reservas__detalle-category">
                          {{
                            getEspacioReserva(item)?.categoriaNombre ||
                            "Sin categoria"
                          }}
                        </div>

                        <div class="mis-reservas__detalle-meta">
                          <div
                            v-if="getEspacioReserva(item)?.ubicacion"
                            class="mis-reservas__detalle-meta-item"
                          >
                            <v-icon size="18" class="mr-1">
                              mdi-map-marker-outline
                            </v-icon>
                            <span>
                              Ubicacion:
                              {{ getEspacioReserva(item)?.ubicacion }}
                            </span>
                          </div>

                          <div class="mis-reservas__detalle-meta-item">
                            <v-icon size="18" class="mr-1">
                              mdi-account-group
                            </v-icon>
                            <span>
                              Aforo maximo:
                              {{
                                getEspacioReserva(item)?.capacidad ??
                                "No disponible"
                              }}
                            </span>
                          </div>
                        </div>

                        <p class="mis-reservas__detalle-description">
                          {{
                            getEspacioReserva(item)?.descripcion ||
                            "Este espacio no tiene descripcion disponible."
                          }}
                        </p>
                      </div>
                    </div>
                  </v-expand-transition>
                </td>
              </tr>
            </template>
          </v-data-table>
        </section>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useEspaciosStore } from "../store/espacios";
import type { EspacioDTO } from "../types/agora";

type ReservaTablaItem = {
  id: number;
  rowKey: string;
  espacioId: number;
  espacioNombre: string;
  categoriaNombre: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
};

const espaciosStore = useEspaciosStore();

const expandedRows = ref<string[]>([]);

const filtros = reactive({
  espacioId: null as number | null,
  categoria: "",
  fechaInicio: "",
  fechaFin: "",
});

const cargando = computed(() => espaciosStore.cargando);
const error = computed(() => espaciosStore.error);
const reservas = computed(() => espaciosStore.reservasUsuario);
const espaciosOptions = computed(() => espaciosStore.espacios);

const headers = [
  { title: "Espacio", value: "espacioNombre" },
  { title: "Titulo", value: "titulo" },
  { title: "Rango", value: "rango" },
  { title: "Estado", value: "estado" },
  { title: "Detalles", value: "detalles", sortable: false },
  { title: "Acciones", value: "acciones", sortable: false },
];

const reservasTabla = computed<ReservaTablaItem[]>(() =>
  reservas.value.map((r: any) => {
    const espacioId = r.espacioId ?? r.EspacioId ?? 0;
    const espacio = espaciosStore.espacios.find((e) => e.id === espacioId);
    const categoriaNombre = getCategoriaEspacio(espacio);

    return {
      id: r.id ?? r.Id,
      rowKey: String(r.id ?? r.Id),
      espacioId,
      espacioNombre:
        r.espacioNombre ??
        r.EspacioNombre ??
        r.espacio?.nombre ??
        r.Espacio?.Nombre ??
        espacio?.nombre ??
        "-",
      categoriaNombre,
      titulo: r.titulo ?? r.Titulo ?? "",
      fechaInicio: r.fechaInicio ?? r.FechaInicio,
      fechaFin: r.fechaFin ?? r.FechaFin,
      estado: r.estado ?? r.Estado ?? "",
    };
  })
);

const categoriasOptions = computed(() => {
  const categorias = new Set<string>();

  reservasTabla.value.forEach((reserva) => {
    if (reserva.categoriaNombre.trim()) {
      categorias.add(reserva.categoriaNombre);
    }
  });

  return Array.from(categorias).sort((a, b) => a.localeCompare(b));
});

const reservasFiltradas = computed(() =>
  reservasTabla.value.filter((reserva) => {
    const coincideEspacio = filtros.espacioId
      ? reserva.espacioId === filtros.espacioId
      : true;

    const coincideCategoria = filtros.categoria
      ? reserva.categoriaNombre === filtros.categoria
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
      coincideEspacio &&
      coincideCategoria &&
      coincideFechaInicio &&
      coincideFechaFin
    );
  })
);

const hayFiltrosActivos = computed(
  () =>
    filtros.espacioId !== null ||
    filtros.categoria.trim().length > 0 ||
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

function getEspacioReserva(item: ReservaTablaItem): EspacioDTO | undefined {
  return espaciosStore.espacios.find((e) => e.id === item.espacioId);
}

function getCategoriaEspacio(espacio?: EspacioDTO): string {
  if (!espacio) return "";
  if (espacio.categoriaNombre?.trim()) return espacio.categoriaNombre;

  const categoria = espaciosStore.categorias.find(
    (c) => c.id === espacio.categoriaEspacioId
  );

  return categoria?.nombre ?? "";
}

function isExpanded(rowKey: string): boolean {
  return expandedRows.value.includes(rowKey);
}

function toggleDetalles(rowKey: string) {
  if (isExpanded(rowKey)) {
    expandedRows.value = expandedRows.value.filter((value) => value !== rowKey);
    return;
  }

  expandedRows.value = [...expandedRows.value, rowKey];
}

function limpiarFiltros() {
  filtros.espacioId = null;
  filtros.categoria = "";
  filtros.fechaInicio = "";
  filtros.fechaFin = "";
}

onMounted(async () => {
  await espaciosStore.cargarCategorias();
  await espaciosStore.cargarEspacios();
  await espaciosStore.cargarMisReservas();
});

async function recargar() {
  await espaciosStore.cargarMisReservas();
}

async function borrar(id: number) {
  if (!confirm("Seguro que quieres borrar esta reserva?")) return;
  expandedRows.value = expandedRows.value.filter(
    (value) => value !== String(id)
  );
  await espaciosStore.borrarReserva(id);
}
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.mis-reservas-container {
  margin-top: $spacing-10 + $spacing-2;
}

.mis-reservas-card {
  @include ag-section($spacing-4);
}

.mis-reservas__subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: $color-heading;
  margin-bottom: $spacing-2;
}

.mis-reservas__filters {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.mis-reservas__filters-header {
  @include ag-card-header;
  margin-bottom: 0;
}

.mis-reservas__filters-text {
  color: $color-text-muted;
  font-size: 0.85rem;
}

.mis-reservas__filters-actions {
  display: flex;
  justify-content: flex-end;
}

.mis-reservas__chip {
  background-color: rgba(37, 99, 235, 0.18);
  color: $color-primary-soft;
}

.mis-reservas__rango {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.mis-reservas__rango-separador {
  opacity: 0.7;
}

.mis-reservas__expanded-cell {
  padding: 0 !important;
}

.mis-reservas__detalle-sala {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: $spacing-4;
  padding: $spacing-4;
  background-color: $color-background-soft;
  border-top: 1px solid $color-border;
}

.mis-reservas__detalle-media {
  min-height: 180px;
  border-radius: $radius-md;
  overflow: hidden;
}

.mis-reservas__detalle-image {
  border-radius: $radius-md;
}

.mis-reservas__detalle-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-text-muted;
  background-color: $color-surface-soft;
  border: 1px dashed $color-border;
}

.mis-reservas__detalle-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.mis-reservas__detalle-title {
  font-size: 1rem;
  font-weight: 600;
  color: $color-heading;
}

.mis-reservas__detalle-category {
  font-size: 0.85rem;
  color: $color-primary-soft;
}

.mis-reservas__detalle-meta {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  color: $color-text;
}

.mis-reservas__detalle-meta-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.mis-reservas__detalle-description {
  margin: 0;
  font-size: 0.9rem;
  color: $color-text-muted;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}

@media (max-width: 768px) {
  .mis-reservas__detalle-sala {
    grid-template-columns: 1fr;
  }
}
</style>
