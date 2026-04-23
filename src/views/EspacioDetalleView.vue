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

    <v-row v-if="cargandoEspacio" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
        <div class="mt-2 text-caption">Cargando espacio...</div>
      </v-col>
    </v-row>

    <v-alert v-else-if="errorEspacio" type="error" border="start" prominent>
      {{ errorEspacio }}
    </v-alert>

    <v-alert
      v-else-if="espacioNoEncontrado"
      type="warning"
      border="start"
      prominent
    >
      No se ha encontrado el espacio solicitado.
    </v-alert>

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
                <p class="espacio-detalle__subtitle">Informacion del espacio</p>
              </div>
              <span class="badge badge--category">
                {{ espacio?.categoriaNombre || "Sin categoria" }}
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
              Este espacio no tiene una descripcion detallada todavia.
            </p>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="ag-card espacio-detalle__reserva">
        <div class="espacio-detalle__header espacio-detalle__header--calendar">
          <div>
            <div class="title">Reservas y disponibilidad</div>
            <div class="subtitle">Gestiona tu reserva desde el calendario.</div>
          </div>

          <v-btn
            variant="outlined"
            class="ag-btn-secondary"
            @click="irMisReservas"
          >
            Ver mis reservas
          </v-btn>
        </div>

        <CalendarioEspacio v-if="espacio" :espacio-id="espacio.id" />
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEspaciosStore } from "../store/espacios";
import CalendarioEspacio from "../components/CalendarioEspacio.vue";

const espaciosStore = useEspaciosStore();
const route = useRoute();
const router = useRouter();

const espacioId = computed(() => Number(route.params.id));
const idValido = computed(() => !Number.isNaN(espacioId.value));

const cargandoEspacio = ref(false);
const errorEspacio = ref("");
const espacio = computed(() =>
  espaciosStore.espacios.find((e) => e.id === espacioId.value)
);

const espacioNoEncontrado = computed(
  () => idValido.value && !cargandoEspacio.value && !espacio.value
);

onMounted(async () => {
  if (!espaciosStore.espacios.length) {
    cargandoEspacio.value = true;
    errorEspacio.value = "";
    await espaciosStore.cargarEspacios();
    if (espaciosStore.error) {
      errorEspacio.value = espaciosStore.error;
    }
    cargandoEspacio.value = false;
  }
});

const volver = () => {
  router.push({ name: "espacios" });
};

const irMisReservas = () => {
  router.push({ name: "mis-reservas" });
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

.espacio-detalle__header--calendar {
  margin-bottom: 0;
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
  border: 1px dashed $color-border;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-text-muted;
  background: $color-background-soft;
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

.badge {
  @include ag-badge();
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
