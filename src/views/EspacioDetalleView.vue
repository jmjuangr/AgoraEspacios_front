<template>
  <v-container class="espacio-detalle">
    <v-btn
      size="small"
      variant="outlined"
      class="ag-btn-secondary mb-4"
      @click="volver"
    >
      <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
      Volver a espacios
    </v-btn>

    <!-- Estado de carga -->
    <v-row v-if="cargando" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
        <div class="mt-2 text-caption">Cargando espacio...</div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-alert v-else-if="error" type="error" border="start" prominent>
      {{ error }}
    </v-alert>

    <!-- No encontrado -->
    <v-alert
      v-else-if="espacioNoEncontrado"
      type="warning"
      border="start"
      prominent
    >
      No se ha encontrado el espacio solicitado.
    </v-alert>

    <!-- Contenido -->
    <div v-else>
      <v-card class="ag-card espacio-detalle__info">
        <v-row>
          <v-col cols="12" md="5">
            <v-img
              v-if="espacio?.imagenUrl"
              :src="espacio.imagenUrl"
              height="260"
              cover
              class="espacio-detalle__image"
            />
            <div v-else class="espacio-detalle__image-placeholder">
              <v-icon size="48">mdi-image-off-outline</v-icon>
              <span>Sin imagen disponible</span>
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <div class="espacio-detalle__header">
              <div>
                <h2>{{ espacio?.nombre }}</h2>
                <p class="espacio-detalle__subtitle">Información del espacio</p>
              </div>
              <span class="badge badge--category">
                {{ espacio?.categoriaNombre || "Sin categoría" }}
              </span>
            </div>

            <div class="espacio-detalle__meta">
              <div class="espacio-detalle__meta-item">
                <v-icon size="18" class="mr-1">mdi-account-group</v-icon>
                <span>Capacidad: {{ espacio?.capacidad }}</span>
              </div>
              <div v-if="espacio?.ubicacion" class="espacio-detalle__meta-item">
                <v-icon size="18" class="mr-1">mdi-map-marker-outline</v-icon>
                <span>{{ espacio?.ubicacion }}</span>
              </div>
            </div>

            <p v-if="espacio?.descripcion" class="espacio-detalle__descripcion">
              {{ espacio?.descripcion }}
            </p>
            <p v-else class="espacio-detalle__descripcion is-empty">
              Este espacio no tiene una descripción detallada todavía.
            </p>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="ag-card espacio-detalle__reserva">
        <div class="espacio-detalle__header">
          <div>
            <div class="title">Reservar este espacio</div>
            <div class="subtitle">Selecciona fecha y hora para tu reserva.</div>
          </div>
        </div>

        <v-alert
          v-if="formSuccess"
          type="success"
          class="mb-3"
          density="comfortable"
        >
          {{ formSuccess }}
        </v-alert>

        <v-form @submit.prevent="crearReserva">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formReserva.fechaInicio"
                label="Fecha y hora inicio"
                type="datetime-local"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6">
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

          <div class="espacio-detalle__actions">
            <v-btn
              type="submit"
              color="primary"
              class="ag-btn-primary"
              :loading="enviando"
            >
              Confirmar reserva
            </v-btn>

            <v-btn
              variant="outlined"
              class="ag-btn-secondary"
              @click="irMisReservas"
            >
              Ver mis reservas
            </v-btn>
          </div>

          <v-alert v-if="formError" type="error" class="mt-3" density="compact">
            {{ formError }}
          </v-alert>
        </v-form>

        <div class="espacio-detalle__nota">
          <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
          Las reservas quedarán pendientes de validación según la normativa
          municipal.
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEspaciosStore } from "../store/espacios";

const espaciosStore = useEspaciosStore();
const route = useRoute();
const router = useRouter();

const formReserva = reactive({
  fechaInicio: "",
  fechaFin: "",
  titulo: "",
});

const enviando = ref(false);
const formError = ref("");
const formSuccess = ref("");

const espacioId = computed(() => Number(route.params.id));
const idValido = computed(() => !Number.isNaN(espacioId.value));

const cargando = computed(() => espaciosStore.cargando);
const error = computed(() => espaciosStore.error);
const espacio = computed(() =>
  espaciosStore.espacios.find((e) => e.id === espacioId.value),
);

const espacioNoEncontrado = computed(
  () => idValido.value && !cargando.value && !espacio.value,
);

onMounted(async () => {
  if (!espaciosStore.espacios.length) {
    await espaciosStore.cargarEspacios();
  }
});

const volver = () => {
  router.push({ name: "espacios" });
};

const irMisReservas = () => {
  router.push({ name: "mis-reservas" });
};

const crearReserva = async () => {
  formError.value = "";
  formSuccess.value = "";

  if (!espacio.value) {
    formError.value = "No se ha podido identificar el espacio.";
    return;
  }

  if (!formReserva.fechaInicio || !formReserva.fechaFin) {
    formError.value = "Debes indicar fecha y hora de inicio y fin.";
    return;
  }

  const inicio = new Date(formReserva.fechaInicio);
  const fin = new Date(formReserva.fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    formError.value = "Revisa las fechas introducidas.";
    return;
  }

  if (inicio >= fin) {
    formError.value = "La fecha/hora de fin debe ser posterior a la de inicio.";
    return;
  }

  enviando.value = true;
  try {
    await espaciosStore.crearReserva({
      espacioId: espacio.value.id,
      fechaInicio: formReserva.fechaInicio,
      fechaFin: formReserva.fechaFin,
      titulo: formReserva.titulo,
    });

    formReserva.fechaInicio = "";
    formReserva.fechaFin = "";
    formReserva.titulo = "";

    formSuccess.value = "Reserva enviada correctamente.";
  } catch (e: any) {
    formError.value =
      e?.message || "Error al crear la reserva. Revisa los datos.";
  } finally {
    enviando.value = false;
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.espacio-detalle {
  margin-top: $spacing-6;
}

.espacio-detalle__info {
  @include ag-section($spacing-4);
  margin-bottom: $spacing-6;
}

.espacio-detalle__reserva {
  @include ag-section($spacing-4);
}

.espacio-detalle__header {
  @include ag-card-header;
}

.espacio-detalle__subtitle {
  color: $color-text-muted;
  font-size: 0.85rem;
}

.espacio-detalle__image {
  border-radius: $radius-lg;
}

.espacio-detalle__image-placeholder {
  height: 260px;
  border-radius: $radius-lg;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-text-muted;
  background: rgba(15, 23, 42, 0.6);
}

.espacio-detalle__meta {
  margin-top: $spacing-3;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  color: $color-text;
}

.espacio-detalle__meta-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.espacio-detalle__descripcion {
  margin-top: $spacing-3;
  font-size: 0.95rem;
  color: $color-text-muted;

  &.is-empty {
    font-style: italic;
  }
}

.espacio-detalle__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-top: $spacing-2;
}

.espacio-detalle__nota {
  margin-top: $spacing-3;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: 0.8rem;
  color: $color-text-muted;
}

.badge {
  @include ag-badge();
}

.ag-btn-primary {
  @include ag-button-primary;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
