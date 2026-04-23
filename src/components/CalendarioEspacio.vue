<template>
  <div class="calendario-espacio">
    <div class="calendario-espacio__header">
      <div>
        <div class="title">Disponibilidad del espacio</div>
        <div class="subtitle">
          Revisa los bloques ocupados y crea tu reserva sin solapes.
        </div>
      </div>
      <v-btn
        size="small"
        variant="outlined"
        class="ag-btn-secondary"
        :loading="cargandoReservas"
        @click="cargarReservas"
      >
        Recargar
      </v-btn>
    </div>

    <v-alert v-if="storeError" type="error" density="comfortable" class="mb-2">
      {{ storeError }}
    </v-alert>

    <div class="calendario-espacio__month-nav">
      <v-btn size="small" variant="text" @click="mesAnterior">
        <v-icon size="18">mdi-chevron-left</v-icon>
      </v-btn>
      <strong>{{ mesActualLabel }}</strong>
      <v-btn size="small" variant="text" @click="mesSiguiente">
        <v-icon size="18">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <div class="calendario-espacio__grid">
      <div
        v-for="weekday in weekDays"
        :key="weekday"
        class="calendario-espacio__weekday"
      >
        {{ weekday }}
      </div>

      <button
        v-for="day in diasCalendario"
        :key="day.iso + String(day.inCurrentMonth)"
        type="button"
        class="calendario-espacio__day"
        :class="{
          'is-outside': !day.inCurrentMonth,
          'is-selected': day.isSelected,
          'is-today': day.isToday,
          'is-blocked': day.blockedCount > 0,
        }"
        :disabled="!day.inCurrentMonth"
        @click="seleccionarDia(day.iso)"
      >
        <span>{{ day.day }}</span>
        <small v-if="day.blockedCount > 0">{{ day.blockedCount }} bloqueos</small>
      </button>
    </div>

    <v-divider />

    <div class="calendario-espacio__selected-day">
      <div class="title">Reservas del {{ formatearFecha(selectedDate) }}</div>

      <v-list v-if="reservasDelDia.length" density="compact" class="listado-dia">
        <v-list-item v-for="reserva in reservasDelDia" :key="reserva.id">
          <v-list-item-title>
            {{ formatearHora(reserva.fechaInicio) }} - {{ formatearHora(reserva.fechaFin) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ reserva.titulo || "Reserva sin titulo" }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div v-else class="calendario-espacio__empty-day">
        No hay reservas para esta fecha.
      </div>
    </div>

    <v-divider />

    <div class="calendario-espacio__form">
      <div class="title">Crear reserva desde calendario</div>

      <v-form @submit.prevent="crearReserva">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              :model-value="selectedDate"
              label="Fecha"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="seleccionarDia"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.horaInicio"
              label="Hora inicio"
              type="time"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.horaFin"
              label="Hora fin"
              type="time"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.titulo"
              label="Titulo (opcional)"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <v-btn
          type="submit"
          color="primary"
          class="ag-btn-primary calendario-espacio__submit"
          :loading="enviando"
        >
          Reservar fecha seleccionada
        </v-btn>

        <v-alert v-if="formError" type="error" class="mt-3" density="compact">
          {{ formError }}
        </v-alert>
        <v-alert
          v-if="formSuccess"
          type="success"
          class="mt-3"
          density="comfortable"
        >
          {{ formSuccess }}
        </v-alert>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useEspaciosStore } from "../store/espacios";
import type { ReservaDTO } from "../types/agora";

const props = defineProps<{
  espacioId: number;
}>();

const emit = defineEmits<{
  (e: "reserva-creada"): void;
}>();

const espaciosStore = useEspaciosStore();
const now = new Date();
const selectedDate = ref(formatISODate(now));
const monthCursor = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const enviando = ref(false);
const formError = ref("");
const formSuccess = ref("");

const form = reactive({
  horaInicio: "09:00",
  horaFin: "10:00",
  titulo: "",
});

const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const storeError = computed(() => espaciosStore.error);
const cargandoReservas = computed(() => espaciosStore.cargando);

const reservasEspacio = computed<ReservaDTO[]>(() =>
  espaciosStore.reservasEspacio
    .map(normalizarReserva)
    .filter((r): r is ReservaDTO => Boolean(r))
);

const mesActualLabel = computed(() =>
  new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(monthCursor.value)
);

const reservasDelDia = computed(() => reservasEnDia(selectedDate.value));

const diasCalendario = computed(() => {
  const first = new Date(
    monthCursor.value.getFullYear(),
    monthCursor.value.getMonth(),
    1
  );
  const weekdayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(start.getDate() - weekdayOffset);

  const todayIso = formatISODate(new Date());
  const result: Array<{
    iso: string;
    day: number;
    inCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    blockedCount: number;
  }> = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const iso = formatISODate(current);
    const blockedCount = reservasEnDia(iso).length;

    result.push({
      iso,
      day: current.getDate(),
      inCurrentMonth: current.getMonth() === monthCursor.value.getMonth(),
      isSelected: iso === selectedDate.value,
      isToday: iso === todayIso,
      blockedCount,
    });
  }

  return result;
});

onMounted(() => {
  cargarReservas();
});

watch(
  () => props.espacioId,
  () => {
    formError.value = "";
    formSuccess.value = "";
    cargarReservas();
  }
);

async function cargarReservas() {
  await espaciosStore.cargarReservasPorEspacio(props.espacioId);
}

function normalizarReserva(r: any): ReservaDTO | null {
  const id = r.id ?? r.Id;
  const fechaInicio = r.fechaInicio ?? r.FechaInicio;
  const fechaFin = r.fechaFin ?? r.FechaFin;

  if (id == null || !fechaInicio || !fechaFin) {
    return null;
  }

  return {
    id,
    espacioId: r.espacioId ?? r.EspacioId ?? props.espacioId,
    espacioNombre: r.espacioNombre ?? r.EspacioNombre ?? "",
    usuarioId: r.usuarioId ?? r.UsuarioId ?? 0,
    usuarioNombre: r.usuarioNombre ?? r.UsuarioNombre ?? "",
    fechaInicio,
    fechaFin,
    estado: r.estado ?? r.Estado ?? "",
    titulo: r.titulo ?? r.Titulo ?? "",
  };
}

function seleccionarDia(value: string | null) {
  if (!value) return;

  selectedDate.value = value;

  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12) {
    monthCursor.value = new Date(year, month - 1, 1);
  }
}

function mesAnterior() {
  monthCursor.value = new Date(
    monthCursor.value.getFullYear(),
    monthCursor.value.getMonth() - 1,
    1
  );
}

function mesSiguiente() {
  monthCursor.value = new Date(
    monthCursor.value.getFullYear(),
    monthCursor.value.getMonth() + 1,
    1
  );
}

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatearFecha(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString("es-ES", { dateStyle: "full" });
}

function formatearHora(value: string): string {
  const d = new Date(value);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function reservasEnDia(isoDate: string): ReservaDTO[] {
  const inicioDia = new Date(`${isoDate}T00:00:00`);
  const finDiaExclusivo = new Date(inicioDia);
  finDiaExclusivo.setDate(finDiaExclusivo.getDate() + 1);

  return reservasEspacio.value
    .filter((r) => haySolape(new Date(r.fechaInicio), new Date(r.fechaFin), inicioDia, finDiaExclusivo))
    .sort((a, b) => +new Date(a.fechaInicio) - +new Date(b.fechaInicio));
}

function haySolape(
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date
): boolean {
  return inicioA < finB && inicioB < finA;
}

async function crearReserva() {
  formError.value = "";
  formSuccess.value = "";

  if (!selectedDate.value || !form.horaInicio || !form.horaFin) {
    formError.value = "Debes indicar fecha y rango horario.";
    return;
  }

  const fechaInicio = `${selectedDate.value}T${form.horaInicio}`;
  const fechaFin = `${selectedDate.value}T${form.horaFin}`;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    formError.value = "Formato de fecha/hora invalido.";
    return;
  }

  if (inicio >= fin) {
    formError.value = "La hora de fin debe ser posterior a la de inicio.";
    return;
  }

  const conflicto = reservasEspacio.value.some((r) =>
    haySolape(
      inicio,
      fin,
      new Date(r.fechaInicio),
      new Date(r.fechaFin)
    )
  );

  if (conflicto) {
    formError.value =
      "Ese tramo ya esta ocupado. Selecciona otro horario.";
    return;
  }

  enviando.value = true;
  try {
    await espaciosStore.crearReserva({
      espacioId: props.espacioId,
      fechaInicio,
      fechaFin,
      titulo: form.titulo.trim() || undefined,
    });

    if (espaciosStore.error) {
      formError.value = espaciosStore.error;
      return;
    }

    form.titulo = "";
    formSuccess.value = "Reserva creada correctamente.";

    await cargarReservas();
    emit("reserva-creada");
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.calendario-espacio {
  @include ag-calendar-container;
}

.calendario-espacio__header {
  @include ag-card-header;
}

.calendario-espacio__month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-heading;
}

.calendario-espacio__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: $spacing-1;
}

.calendario-espacio__weekday {
  text-align: center;
  font-size: 0.8rem;
  color: $color-text-muted;
  padding: $spacing-1 0;
}

.calendario-espacio__day {
  min-height: 64px;
  border-radius: $radius-md;
  border: 1px solid $color-border;
  background-color: $color-background-soft;
  color: $color-text;
  padding: $spacing-1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  transition: background-color $transition-fast, border-color $transition-fast;

  span {
    font-weight: 600;
    font-size: 0.85rem;
  }

  small {
    font-size: 0.7rem;
    color: $color-warning;
  }

  &:hover:not(:disabled) {
    background-color: $color-surface-muted;
    border-color: $color-border-strong;
    cursor: pointer;
  }

  &.is-outside {
    opacity: 0.45;
  }

  &.is-selected {
    border-color: $color-primary;
    background-color: $color-primary-soft;
    color: $color-background;
  }

  &.is-today {
    box-shadow: inset 0 0 0 1px $color-info;
  }

  &.is-blocked {
    border-color: $color-warning;
  }
}

.calendario-espacio__selected-day {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.listado-dia {
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background-color: $color-background-soft;

  ::v-deep(.v-list-item-title) {
    color: $color-heading !important;
  }

  ::v-deep(.v-list-item-subtitle) {
    color: $color-text !important;
    opacity: 1;
  }
}

.calendario-espacio__empty-day {
  color: $color-text-muted;
  font-size: 0.9rem;
}

.calendario-espacio__form {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.calendario-espacio__submit {
  margin-top: $spacing-3;
}

.ag-btn-primary {
  @include ag-button-primary;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
