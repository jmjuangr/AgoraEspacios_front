<template>
  <v-container class="espacios-container">
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

    <!-- Filtros -->
    <v-card class="ag-card espacios-filtros">
      <div class="espacios-filtros__header">
        <div>
          <div class="title">Filtrar espacios</div>
          <div class="subtitle">Filtra por texto, categoría o capacidad.</div>
        </div>
        <v-chip size="small" class="espacios-filtros__chip">
          {{ espaciosFiltrados.length }} resultados
        </v-chip>
      </div>

      <v-row>
        <v-col cols="12" md="5">
          <v-text-field
            v-model="filtros.texto"
            label="Buscar por nombre, ubicación o descripción"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filtros.categoria"
            :items="categoriasOptions"
            label="Categoría"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            clearable
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="filtros.capacidadMin"
            label="Capacidad mínima"
            type="number"
            min="0"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
        </v-col>
      </v-row>

      <div class="espacios-filtros__actions">
        <v-btn
          size="small"
          variant="outlined"
          class="ag-btn-secondary"
          :disabled="!hayFiltrosActivos"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          class="ag-btn-secondary"
          :loading="espaciosStore.cargando"
          @click="recargar"
        >
          Recargar
        </v-btn>
      </div>
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
import { computed, onMounted, reactive } from "vue";
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

const filtros = reactive({
  texto: "",
  categoria: "",
  capacidadMin: null as number | null,
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

const categoriasOptions = computed(() => {
  const valores = new Set<string>();
  espaciosStore.espacios.forEach((e) => {
    valores.add(e.categoriaNombre ?? "Sin categoría");
  });
  return Array.from(valores).sort((a, b) => a.localeCompare(b));
});

const espaciosFiltrados = computed(() => {
  const texto = filtros.texto.trim().toLowerCase();
  const categoria = filtros.categoria.trim();
  const capacidadMin = filtros.capacidadMin ?? 0;

  return espaciosStore.espacios.filter((e) => {
    const categoriaEspacio = e.categoriaNombre ?? "Sin categoría";
    const coincideCategoria = categoria ? categoriaEspacio === categoria : true;
    const coincideCapacidad = capacidadMin ? e.capacidad >= capacidadMin : true;

    if (!texto) {
      return coincideCategoria && coincideCapacidad;
    }

    const textoEspacio = [
      e.nombre,
      e.ubicacion,
      e.descripcion,
      categoriaEspacio,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      coincideCategoria && coincideCapacidad && textoEspacio.includes(texto)
    );
  });
});

const espaciosParaCards = computed<EspacioCardData[]>(() =>
  espaciosFiltrados.value.map((e: EspacioDTO) => ({
    id: e.id,
    nombre: e.nombre,
    // En el DTO viene como categoriaNombre, no como e.categoria?.nombre
    categoriaNombre: e.categoriaNombre ?? "Sin categoría",
    capacidad: e.capacidad,
    ubicacion: e.ubicacion,
    descripcion: e.descripcion,
    imagenUrl: e.imagenUrl,
    accesible: undefined, // preparado para futuro
  })),
);

const hayFiltrosActivos = computed(
  () =>
    filtros.texto.trim().length > 0 ||
    filtros.categoria.trim().length > 0 ||
    (filtros.capacidadMin ?? 0) > 0,
);

const limpiarFiltros = () => {
  filtros.texto = "";
  filtros.categoria = "";
  filtros.capacidadMin = null;
};

const recargar = async () => {
  await espaciosStore.cargarEspacios();
};

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

.espacios-container {
  margin-top: $spacing-10 + $spacing-2;
}

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

.espacios-filtros {
  @include ag-section($spacing-4);
}

.espacios-filtros__header {
  @include ag-card-header;
  margin-bottom: $spacing-2;
}

.espacios-filtros__actions {
  display: flex;
  gap: $spacing-2;
  justify-content: flex-end;
}

.espacios-filtros__chip {
  background-color: rgba(37, 99, 235, 0.18);
  color: $color-primary-soft;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
