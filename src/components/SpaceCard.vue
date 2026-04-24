<template>
  <v-card class="space-card">
    <v-img
      v-if="espacio.imagenUrl"
      :src="espacio.imagenUrl"
      height="160"
      class="space-card__image"
      cover
    />
    <div v-else class="space-card__image-placeholder">
      <v-icon size="38">mdi-image-off-outline</v-icon>
      <span>Sin imagen disponible</span>
    </div>

    <v-card-text>
      <div class="space-card__header">
        <div class="space-card__title">
          {{ espacio.nombre }}
        </div>

        <div class="space-card__badge">
          <span class="badge badge--category">
            {{ espacio.categoriaNombre || "Sin categorIa" }}
          </span>
        </div>
      </div>

      <v-expand-transition>
        <div v-if="showDetails" class="space-card__details">
          <div v-if="espacio.ubicacion" class="space-card__meta-item">
            <v-icon size="18" class="mr-1">mdi-map-marker-outline</v-icon>
            <span>Ubicacion: {{ espacio.ubicacion }}</span>
          </div>

          <div class="space-card__meta-item">
            <v-icon size="18" class="mr-1">mdi-account-group</v-icon>
            <span>Aforo maximo: {{ espacio.capacidad }}</span>
          </div>

          <p
            v-if="espacio.descripcion"
            class="space-card__description"
          >
            {{ espacio.descripcion }}
          </p>
          <p v-else class="space-card__description space-card__description--empty">
            Sin descripcion disponible.
          </p>
        </div>
      </v-expand-transition>
    </v-card-text>

    <v-card-actions class="space-card__actions">
      <v-btn
        size="small"
        class="ag-btn-secondary"
        variant="outlined"
        @click="toggleDetails"
      >
        {{ showDetails ? "Ocultar detalles" : "+ Detalles" }}
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
import { ref } from "vue";

interface EspacioCard {
  id: number;
  nombre: string;
  categoriaNombre?: string | null;
  capacidad: number;
  ubicacion?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
}

const props = defineProps<{
  espacio: EspacioCard;
}>();

const emit = defineEmits<{
  (e: "ver-detalle", id: number): void;
  (e: "reservar", id: number): void;
}>();

const showDetails = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
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

  &__image-placeholder {
    height: 160px;
    border-top-left-radius: $radius-lg;
    border-top-right-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    background-color: $color-background-soft;
    color: $color-text-muted;
    border-bottom: 1px solid $color-border;
  }

  &__header {
    @include ag-card-header;
    align-items: flex-start;
    margin-bottom: 0;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 600;
    color: $color-heading;
  }

  &__badge {
    display: flex;
    justify-content: flex-end;
  }

  &__details {
    margin-top: $spacing-3;
    padding-top: $spacing-3;
    border-top: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    color: $color-text;
  }

  &__meta-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
  }

  &__description {
    font-size: 0.9rem;
    color: $color-text-muted;

    &--empty {
      font-style: italic;
    }
  }

  &__actions {
    padding: $spacing-3 $spacing-4 $spacing-4;
    margin-top: auto;
  }
}

.badge {
  @include ag-badge();
}

.ag-btn-primary {
  @include ag-button-primary;

  color: #fff !important;

  ::v-deep(.v-btn__content) {
    color: #fff !important;
  }

  ::v-deep(.v-icon) {
    color: #fff !important;
  }
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
