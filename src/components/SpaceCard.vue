<template>
  <v-card class="space-card">
    <!-- Imagen del espacio (opcional) -->
    <v-img
      v-if="espacio.imagenUrl"
      :src="espacio.imagenUrl"
      height="160"
      class="space-card__image"
      cover
    />

    <v-card-text>
      <!-- Cabecera: título + categoría -->
      <div class="space-card__header">
        <div>
          <div class="space-card__title">
            {{ espacio.nombre }}
          </div>
          <div class="space-card__subtitle" v-if="espacio.ubicacion">
            {{ espacio.ubicacion }}
          </div>
        </div>

        <div class="space-card__badge">
          <span class="badge badge--category">
            {{ espacio.categoriaNombre || "Sin categoría" }}
          </span>
        </div>
      </div>

      <!-- Datos principales -->
      <div class="space-card__meta">
        <div class="space-card__meta-item">
          <v-icon size="18" class="mr-1">mdi-account-group</v-icon>
          <span>Aforo máximo: {{ espacio.capacidad }}</span>
        </div>

        <div
          v-if="espacio.accesible !== undefined"
          class="space-card__meta-item"
        >
          <v-icon
            size="18"
            class="mr-1"
            :color="espacio.accesible ? 'success' : 'warning'"
          >
            {{
              espacio.accesible
                ? "mdi-wheelchair-accessibility"
                : "mdi-alert-circle-outline"
            }}
          </v-icon>
          <span>
            {{
              espacio.accesible ? "Accesible" : "Accesibilidad no garantizada"
            }}
          </span>
        </div>
      </div>

      <!-- Descripción corta -->
      <p v-if="espacio.descripcion" class="space-card__description">
        {{ shortDescription }}
      </p>
    </v-card-text>

    <v-card-actions class="space-card__actions">
      <v-btn
        size="small"
        class="ag-btn-secondary"
        variant="outlined"
        @click="onVerDetalle"
      >
        Detalles
      </v-btn>

      <v-spacer />

      <v-btn
        size="small"
        class="ag-btn-primary"
        color="primary"
        @click="onReservar"
      >
        Reservar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface EspacioCard {
  id: number;
  nombre: string;
  categoriaNombre?: string | null;
  capacidad: number;
  ubicacion?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
  accesible?: boolean;
}

// Props de la card
const props = defineProps<{
  espacio: EspacioCard;
}>();

// Eventos emitidos al padre
const emit = defineEmits<{
  (e: "ver-detalle", id: number): void;
  (e: "reservar", id: number): void;
}>();

const shortDescription = computed(() => {
  const text = props.espacio.descripcion || "";
  if (text.length <= 140) return text;
  return text.slice(0, 137) + "...";
});

const onVerDetalle = () => {
  emit("ver-detalle", props.espacio.id);
};

const onReservar = () => {
  emit("reservar", props.espacio.id);
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.space-card {
  @include ag-card($spacing-4);
  display: flex;
  flex-direction: column;
  height: 100%;

  &__image {
    border-top-left-radius: $radius-lg;
    border-top-right-radius: $radius-lg;
  }

  &__header {
    @include ag-card-header;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 600;
    color: $color-heading;
  }

  &__subtitle {
    font-size: 0.85rem;
    color: $color-text-muted;
  }

  &__badge {
    display: flex;
    justify-content: flex-end;
  }

  &__meta {
    margin-top: $spacing-3;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    font-size: 0.85rem;
    color: $color-text;
  }

  &__meta-item {
    display: flex;
    align-items: center;
  }

  &__description {
    margin-top: $spacing-3;
    font-size: 0.9rem;
    color: $color-text-muted;
  }

  &__actions {
    padding: $spacing-3 $spacing-4 $spacing-4;
    margin-top: auto;
  }
}

.badge {
  @include ag-badge();

  &--category {
    // categoría, color por defecto
  }
}

.ag-btn-primary {
  @include ag-button-primary;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
