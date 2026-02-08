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
        <!-- Mensaje de error global del store -->
        <v-alert v-if="error" type="error" class="mb-4" density="comfortable">
          {{ error }}
        </v-alert>

        <!-- FORMULARIO NUEVA RESERVA -->
        <section class="mis-reservas__form mb-6">
          <h3 class="mis-reservas__subtitle">Nueva reserva</h3>

          <v-form ref="formRef" @submit.prevent="crearNuevaReserva">
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formReserva.espacioId"
                  :items="espaciosOptions"
                  item-title="nombre"
                  item-value="id"
                  label="Espacio"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  :disabled="cargandoEspacios"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formReserva.fechaInicio"
                  label="Fecha y hora inicio"
                  type="datetime-local"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formReserva.fechaFin"
                  label="Fecha y hora fin"
                  type="datetime-local"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formReserva.titulo"
                  label="Título (opcional)"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <v-btn
              type="submit"
              color="primary"
              class="mt-2"
              :loading="enviando"
            >
              Crear reserva
            </v-btn>

            <v-alert
              v-if="formError"
              type="error"
              class="mt-3"
              density="compact"
            >
              {{ formError }}
            </v-alert>
          </v-form>
        </section>

        <!-- LISTADO DE RESERVAS -->
        <section>
          <h3 class="mis-reservas__subtitle mb-3">Listado de mis reservas</h3>

          <v-skeleton-loader
            v-if="cargando && reservasTabla.length === 0"
            type="table"
            class="mb-4"
          />

          <div v-else-if="reservasTabla.length === 0" class="text-caption">
            No tienes reservas todavía.
          </div>

          <v-data-table
            v-else
            :items="reservasTabla"
            :headers="headers"
            density="comfortable"
          >
            <template #item.rango="{ item }">
              <div class="mis-reservas__rango">
                <span>{{ formatearFechaHora(item.fechaInicio) }}</span>
                <span class="mis-reservas__rango-separador">→</span>
                <span>{{ formatearFechaHora(item.fechaFin) }}</span>
              </div>
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
          </v-data-table>
        </section>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useEspaciosStore } from "../store/espacios";

const espaciosStore = useEspaciosStore();

// refs para formulario
const formRef = ref();
const enviando = ref(false);
const formError = ref("");

const formReserva = reactive({
  espacioId: null as number | null,
  fechaInicio: "",
  fechaFin: "",
  titulo: "",
});

// computed que leen del store
const cargando = computed(() => espaciosStore.cargando);
const error = computed(() => espaciosStore.error);
const reservas = computed(() => espaciosStore.reservasUsuario);
const espaciosOptions = computed(() => espaciosStore.espacios);
const cargandoEspacios = computed(
  () => espaciosStore.cargando && espaciosStore.espacios.length === 0
);

// cabeceras de la tabla
const headers = [
  { title: "Espacio", value: "espacioNombre" },
  { title: "Título", value: "titulo" },
  { title: "Rango", value: "rango" },
  { title: "Estado", value: "estado" },
  { title: "Acciones", value: "acciones", sortable: false },
];

const reservasTabla = computed(() =>
  reservas.value.map((r: any) => ({
    id: r.id ?? r.Id,
    espacioNombre:
      r.espacioNombre ??
      r.EspacioNombre ??
      r.espacio?.nombre ??
      r.Espacio?.Nombre ??
      "—",
    titulo: r.titulo ?? r.Titulo ?? "",
    fechaInicio: r.fechaInicio ?? r.FechaInicio,
    fechaFin: r.fechaFin ?? r.FechaFin,
    estado: r.estado ?? r.Estado ?? "",
  }))
);

function formatearFechaHora(valor: string | Date): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// cargar datos iniciales
onMounted(async () => {
  await espaciosStore.cargarEspacios();
  await espaciosStore.cargarMisReservas();
});

// recargar manualmente
async function recargar() {
  await espaciosStore.cargarMisReservas();
}

// crear una nueva reserva
async function crearNuevaReserva() {
  formError.value = "";

  if (!formReserva.espacioId) {
    formError.value = "Debes seleccionar un espacio.";
    return;
  }
  if (!formReserva.fechaInicio || !formReserva.fechaFin) {
    formError.value = "Debes indicar fecha y hora de inicio y fin.";
    return;
  }

  // validación
  const inicio = new Date(formReserva.fechaInicio);
  const fin = new Date(formReserva.fechaFin);
  if (inicio >= fin) {
    formError.value = "La fecha/hora de fin debe ser posterior a la de inicio.";
    return;
  }

  enviando.value = true;
  try {
    await espaciosStore.crearReserva({
      espacioId: formReserva.espacioId,
      fechaInicio: formReserva.fechaInicio,
      fechaFin: formReserva.fechaFin,
      titulo: formReserva.titulo,
      estado: "Activa",
    } as any);

    // limpiar formulario
    formReserva.fechaInicio = "";
    formReserva.fechaFin = "";
    formReserva.titulo = "";
  } catch (e: any) {
    formError.value =
      e?.message || "Error al crear la reserva. Revisa los datos.";
  } finally {
    enviando.value = false;
  }
}

// borrar una reserva
async function borrar(id: number) {
  if (!confirm("¿Seguro que quieres borrar esta reserva?")) return;
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

.mis-reservas__rango {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.mis-reservas__rango-separador {
  opacity: 0.7;
}
</style>
