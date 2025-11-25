<template>
  <v-card class="reserva-card">
    <v-card-text>
      <div class="reserva-card__header">
        <div>
          <div class="reserva-card__title">
            {{ reserva.espacioNombre }}
          </div>
          <div class="reserva-card__subtitle">
            Reserva #<span class="reserva-id">{{ reserva.id }}</span>
          </div>
        </div>

        <div class="reserva-card__badge">
          <span :class="['badge', estadoClass]">
            {{ reserva.estado }}
          </span>
        </div>
      </div>

      <div class="reserva-card__body">
        <div class="reserva-card__dates">
          <div class="reserva-card__date-row">
            <v-icon size="18" class="mr-1">mdi-calendar-start</v-icon>
            <span>Inicio: {{ reserva.fechaInicio }}</span>
          </div>
          <div class="reserva-card__date-row">
            <v-icon size="18" class="mr-1">mdi-calendar-end</v-icon>
            <span>Fin: {{ reserva.fechaFin }}</span>
          </div>
        </div>

        <p v-if="reserva.detalle" class="reserva-card__detalle">
          {{ reserva.detalle }}
        </p>
      </div>
    </v-card-text>

    <v-card-actions class="reserva-card__actions">
      <v-btn
        v-if="mostrarVerEspacio"
        size="small"
        class="ag-btn-secondary"
        variant="outlined"
        @click="onVerEspacio"
      >
        Ver espacio
      </v-btn>

      <v-spacer />

      <v-btn
        v-if="sePuedeCancelar"
        size="small"
        class="ag-btn-primary"
        color="primary"
        @click="onCancelar"
      >
        Cancelar reserva
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

type EstadoReserva =
  | "Activa"
  | "Pendiente"
  | "Cancelada"
  | "Rechazada"
  | string;

interface ReservaCard {
  id: number;
  espacioId: number;
  espacioNombre: string;
  fechaInicio: string; // luego lo formatearemos si queremos
  fechaFin: string;
  estado: EstadoReserva;
  detalle?: string | null;
}

const props = defineProps<{
  reserva: ReservaCard;
  mostrarVerEspacio?: boolean;
}>();

const emit = defineEmits<{
  (e: "ver-espacio", espacioId: number): void;
  (e: "cancelar", reservaId: number): void;
}>();

const estadoClass = computed(() => {
  const estado = props.reserva.estado.toLowerCase();
  if (estado.includes("activa") || estado.includes("confirmada")) {
    return "success";
  }
  if (estado.includes("pendiente")) {
    return "warning";
  }
  if (estado.includes("cancel") || estado.includes("rechaz")) {
    return "error";
  }
  return "";
});

const sePuedeCancelar = computed(() => {
  const e = props.reserva.estado.toLowerCase();
  return e.includes("activa") || e.includes("pendiente");
});

const onVerEspacio = () => {
  emit("ver-espacio", props.reserva.espacioId);
};

const onCancelar = () => {
  emit("cancelar", props.reserva.id);
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.reserva-card {
  @include ag-card($spacing-4);
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    @include ag-card-header;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $color-heading;
  }

  &__subtitle {
    font-size: 0.8rem;
    color: $color-text-muted;

    .reserva-id {
      @include ag-code-text;
    }
  }

  &__badge {
    display: flex;
    justify-content: flex-end;
  }

  &__body {
    margin-top: $spacing-3;
    font-size: 0.9rem;
  }

  &__dates {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__date-row {
    display: flex;
    align-items: center;
    color: $color-text;
  }

  &__detalle {
    margin-top: $spacing-3;
    color: $color-text-muted;
  }

  &__actions {
    padding: $spacing-3 $spacing-4 $spacing-4;
    margin-top: auto;
  }
}

.badge {
  @include ag-badge();

  &.success {
    @include ag-badge($bg: rgba(34, 197, 94, 0.15), $color: $color-success);
  }

  &.warning {
    @include ag-badge($bg: rgba(234, 179, 8, 0.15), $color: $color-warning);
  }

  &.error {
    @include ag-badge($bg: rgba(239, 68, 68, 0.15), $color: $color-error);
  }
}

.ag-btn-primary {
  @include ag-button-primary;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
