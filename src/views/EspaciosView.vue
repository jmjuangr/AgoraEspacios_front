<template>
  <v-container>
    <!-- Cabecera de la sección -->
    <v-card class="espacios-header">
      <v-card-text>
        <div class="espacios-header__title">
          <h1>Espacios disponibles</h1>
          <p>
            Consulta los espacios públicos disponibles para reserva. Puedes ver
            su capacidad, ubicación y acceder al detalle para realizar una
            solicitud.
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Estado de carga -->
    <v-row class="mt-4" v-if="espaciosStore.cargando" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
        <div class="mt-2 text-caption">Cargando espacios...</div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row class="mt-4" v-else-if="espaciosStore.error">
      <v-col cols="12">
        <v-alert type="error" border="start" prominent>
          {{ espaciosStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Listado -->
    <v-row class="mt-4" v-else>
      <v-col
        v-for="espacio in espaciosParaCards"
        :key="espacio.id"
        cols="12"
        md="6"
        lg="4"
      >
        <SpaceCard
          :espacio="espacio"
          @ver-detalle="handleVerDetalle"
          @reservar="handleReservar"
        />
      </v-col>

      <v-col v-if="!espaciosParaCards.length" cols="12">
        <v-alert type="info" border="start" prominent>
          No hay espacios disponibles en este momento.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useEspaciosStore } from "../store/espacios";
import SpaceCard from "../components/SpaceCard.vue";

import type { EspacioDTO } from "../types/agora";

const espaciosStore = useEspaciosStore();
const router = useRouter();

onMounted(() => {
  if (!espaciosStore.espacios.length) {
    espaciosStore.cargarEspacios();
  }
});

type EspacioCardData = {
  id: number;
  nombre: string;
  categoriaNombre?: string | null;
  capacidad: number;
  ubicacion?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
  accesible?: boolean;
};

const espaciosParaCards = computed<EspacioCardData[]>(() =>
  espaciosStore.espacios.map((e: EspacioDTO) => ({
    id: e.id,
    nombre: e.nombre,
    // En el DTO viene como categoriaNombre, no como e.categoria?.nombre
    categoriaNombre: e.categoriaNombre ?? "Sin categoría",
    capacidad: e.capacidad,
    ubicacion: e.ubicacion,
    descripcion: e.descripcion,
    imagenUrl: e.imagenUrl,
    accesible: undefined, // preparado para futuro
  }))
);

// Navegar al detalle
const handleVerDetalle = (id: number) => {
  router.push({ name: "espacioDetalle", params: { id } });
};

// De momento, al pulsar Reservar también iremos al detalle
const handleReservar = (id: number) => {
  router.push({ name: "espacioDetalle", params: { id } });
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.espacios-header {
  @include ag-section($spacing-4);

  &__title {
    h1 {
      color: $color-heading;
      font-size: 1.4rem;
      margin-bottom: $spacing-2;
    }

    p {
      color: $color-text-muted;
      font-size: 0.95rem;
      max-width: 640px;
    }
  }
}
</style>
