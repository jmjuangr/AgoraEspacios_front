<template>
  <!-- Contenedor principal del calendario -->
  <div class="calendario-espacio">
    <!-- Cabecera -->
    <div class="calendario-espacio__header">
      <div>
        <div class="title">Disponibilidad del espacio</div>

        <div class="subtitle">
          Revisa las reservas aprobadas y solicita tu reserva.
        </div>
      </div>
      <!-- Boton para cargarReservas muestro un loading mientras carga el store  -->
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

    <!-- Alerta  error si hay mensaje de error en store -->
    <v-alert v-if="errorReservas" type="error" density="comfortable" class="mb-2">
      {{ errorReservas }}
    </v-alert>

    <!-- Navegacion para los meses -->
    <div class="calendario-espacio__month-nav">
      <!-- Boton de reotroceder en los meses -->
      <v-btn
        size="small"
        variant="text"
        class="calendario-espacio__month-btn"
        @click="mesAnterior"
      >
        <v-icon size="18">mdi-chevron-left</v-icon>
      </v-btn>
      <!-- pinto el mes -->
      <strong>{{ mesActualLabel }}</strong>
      <!-- boton para avanzar -->
      <v-btn
        size="small"
        variant="text"
        class="calendario-espacio__month-btn"
        @click="mesSiguiente"
      >
        <v-icon size="18">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- Grid del calendario -->
    <div class="calendario-espacio__grid">
      <div
        v-for="weekday in diasSemana"
        :key="weekday"
        class="calendario-espacio__weekday"
      >
        {{ weekday }}
      </div>

      <!-- Esto recorre los dias que   se calculan del calendario y se crea botón para cada uno.
       Al hacer clic en un día del mes actual, se selecciona esa fecha.
  Se añaden clases dinámicas para cambiar el estilo segun si esta eleccionado, pertenece a un rango, es hoy, está bloqueado o no pertenece al mes actual. -->
      <button
        v-for="day in diasCalendario"
        :key="day.iso + String(day.inCurrentMonth)"
        type="button"
        class="calendario-espacio__day"
        :class="{
          'is-outside': !day.inCurrentMonth,
          'is-selected': day.isSelected,
          'is-range-start': day.isRangeStart,
          'is-range-end': day.isRangeEnd,
          'is-in-range': day.isInRange,
          'is-today': day.isToday,
          'is-blocked': day.numeroBloqueos > 0,
        }"
        :disabled="!day.inCurrentMonth"
        @click="seleccionarDia(day.iso)"
      >
        <!-- Numero del dia dentro del mes -->
        <span>{{ day.day }}</span>
        <!-- solo hay reservas aprobadas ese dia se van  a mostrar los bloqueos que tiene -->
        <small v-if="day.numeroBloqueos > 0"
          >{{ day.numeroBloqueos }} bloqueos</small
        >
      </button>
    </div>

    <v-divider />

    <!-- aqui se muestra al usuario el detalle del día seleccionado -->
    <div class="calendario-espacio__selected-day">
      <div class="title">
        Reservas aprobadas del {{ formatearFecha(fechaSeleccionada) }}
      </div>

      <!-- Lista de reservas del dia. Solo aparece si reservasDelDia tiene elementos. -->
      <v-list
        v-if="reservasDelDia.length"
        density="compact"
        class="listado-dia"
      >
        <!-- se recorren las reservas del día y se muestrra horario y titulo d reserva (si no tiene se muestra "reserva sin titulo") -->
        <v-list-item v-for="reserva in reservasDelDia" :key="reserva.id">
          <v-list-item-title>
            {{ formatearRangoReserva(reserva) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ reserva.titulo || "Reserva sin titulo" }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Mensaje alternativo-->
      <div v-else class="calendario-espacio__empty-day">
        No hay reservas aprobadas para esta fecha.
      </div>
    </div>

    <v-divider />

    <!-- formulario de creación de reserva. utiliza las fechas seleccionadas en calednario. -->
    <div class="calendario-espacio__form">
      <div class="title">Crear reserva desde calendario</div>

      <!-- al enviar el formulario se evita recarga de pagina (prevent) y llamo a crearReserva -->
      <v-form @submit.prevent="crearReserva">
        <v-row>
          <!-- fecha inicio de reserva -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.fechaInicio"
              label="Fecha inicio"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              @update:model-value="seleccionarFechaInicio"
            />
          </v-col>

          <!-- hora de inici o de reserva -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.horaInicio"
              label="Hora inicio"
              type="time"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <!-- fecha fin -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.fechaFin"
              label="Fecha fin"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <!-- hora fin -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.horaFin"
              label="Hora fin"
              type="time"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <!-- campo para añadir titulo de reserva -->
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

        <!-- boton de envio de formulario -->
        <v-btn
          type="submit"
          color="primary"
          class="ag-btn-primary calendario-espacio__submit"
          :loading="enviando"
        >
          Reservar fecha seleccionada
        </v-btn>

        <!-- errror del formulario -->
        <v-alert v-if="errorFormulario" type="error" class="mt-3" density="compact">
          {{ errorFormulario }}
        </v-alert>
        <!-- mensaje de confirmación -->
        <v-alert
          v-if="mensajeExito"
          type="success"
          class="mt-3"
          density="comfortable"
        >
          {{ mensajeExito }}
        </v-alert>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useEspaciosStore } from "../store/espacios";
import type { ReservaDTO } from "../types/agora";

// Se recibe id de espacio desde el componente padre para cargar reservas
const props = defineProps<{
  espacioId: number;
}>();

// Se define  evento que se envia al padre cuando se crea la reserva
const emit = defineEmits<{
  (e: "reserva-creada"): void;
}>();

// se accede al store de espacios donde se cargan/crean reservas
const espaciosStore = useEspaciosStore();

// Fechas
const now = new Date();
const fechaSeleccionada = ref(formatISODate(now)); //fecha de hoy
const mesMostrado = ref(new Date(now.getFullYear(), now.getMonth(), 1)); //mes que se mostrará en calendario, se calcula desde el día 1

// vairable de control del ultimo clic del calendario
const seleccionandoFin = ref(false);

// Estados del formulario
const enviando = ref(false);
const errorFormulario = ref("");
const mensajeExito = ref("");

// Datos iniciales del formulario de reserva
const form = reactive({
  fechaInicio: fechaSeleccionada.value,
  horaInicio: "09:00",
  fechaFin: fechaSeleccionada.value,
  horaFin: "10:00",
  titulo: "",
});

// días cabecera del calendario
const diasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

// Estados calculados  del store
const errorReservas = computed(() => espaciosStore.error); //error que viene del store
const cargandoReservas = computed(() => espaciosStore.cargando); //estado de carga

// Reservas normalizadas del espacio actual.
const reservasEspacio = computed<ReservaDTO[]>(
  () =>
    espaciosStore.reservasEspacio //reeservas cargadas del backend
      .map(normalizarReserva) //función para normalizar formatos
      .filter((r): r is ReservaDTO => Boolean(r)), //normaliza que las reservas sean todas tipo ReservaDTO
);

// Texto del mes mostrado en el calendario.
const mesActualLabel = computed(
  () =>
    new Intl.DateTimeFormat("es-ES", {
      //fecha en español
      month: "long",
      year: "numeric",
    }).format(mesMostrado.value), //mesMostrado es la fecha que se está mostrando
);

// claculo reservas aprobadas del día seleccionado
const reservasDelDia = computed(() => reservasEnDia(fechaSeleccionada.value));

// Construye la lista de días que luego se pinta con el v-for
const diasCalendario = computed(() => {
  const first = new Date(
    mesMostrado.value.getFullYear(),
    mesMostrado.value.getMonth(),
    1, //se crea una fecha con el primer día del mes
  );

  // Ajuste para que la semana empiece en lunes.
  const diasAntesDelMes = (first.getDay() + 6) % 7;

  // Primer día que se va a pintar
  const start = new Date(first);
  start.setDate(start.getDate() - diasAntesDelMes);

  const todayIso = formatISODate(new Date()); //día de hoy

  const result: Array<{
    iso: string;
    day: number;
    inCurrentMonth: boolean;
    isSelected: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    isInRange: boolean;
    isToday: boolean;
    numeroBloqueos: number;
  }> = [];

  // Se crean 42 casillas para tener siempre una cuadrícula de 6 semanas
  for (let i = 0; i < 42; i++) {
    // Se calcula la fecha que corresponde a cada casilla del calendario
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const iso = formatISODate(current);
    const numeroBloqueos = reservasEnDia(iso).length;
    // Se añade al array toda la información  para pintar el día
    result.push({
      iso,
      day: current.getDate(),
      inCurrentMonth: current.getMonth() === mesMostrado.value.getMonth(),
      isSelected: iso === fechaSeleccionada.value,
      isRangeStart: iso === form.fechaInicio,
      isRangeEnd: iso === form.fechaFin && form.fechaFin !== form.fechaInicio,
      isInRange:
        Boolean(form.fechaInicio && form.fechaFin) &&
        iso > form.fechaInicio &&
        iso < form.fechaFin,
      isToday: iso === todayIso,
      numeroBloqueos,
    });
  }
  //se devuelve array final
  return result;
});

// se carga componente y se piden las reservas del espacio
onMounted(() => {
  cargarReservas();
});

// Si hay cambio d espacio limpio mensajes y se cargan las reservas nuevas
watch(
  () => props.espacioId,
  () => {
    errorFormulario.value = "";
    mensajeExito.value = "";
    cargarReservas();
  },
);

// función que pide al store las reservas del espacio que se stá mostrando
async function cargarReservas() {
  await espaciosStore.cargarReservasPorEspacio(props.espacioId);
}

// función para adaptar los datos que llegan del backend
function normalizarReserva(r: any): ReservaDTO | null {
  const id = r.id ?? r.Id;
  const fechaInicio = r.fechaInicio ?? r.FechaInicio;
  const fechaFin = r.fechaFin ?? r.FechaFin;

  // si no hay datos minimos (vienen null) no se usa la reserva
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
    fechaCreacion: r.fechaCreacion ?? r.FechaCreacion ?? "",
    estado: r.estado ?? r.Estado ?? "",
    titulo: r.titulo ?? r.Titulo ?? "",
  };
}

// Gestiona la selección de días del calendario.
// El primer clic marca el inicio y el segundo clic marca el final del rango.
function seleccionarDia(value: string | null) {
  if (!value) return;

  fechaSeleccionada.value = value; //guardo fecha seleccionada

  if (!seleccionandoFin.value) {
    //si hay todavia fecha fin entonces fecha fin e inicio es la misma
    form.fechaInicio = value;
    form.fechaFin = value;
    seleccionandoFin.value = true; //se activa fecha fin
  } else {
    if (value < form.fechaInicio) {
      //si la fecha fin que se clica es anterior a fecha inicio entonces se da la vuelta a las fechas
      form.fechaFin = form.fechaInicio;
      form.fechaInicio = value;
    } else {
      form.fechaFin = value; //si no,  se asigna fecha fin
    }

    seleccionandoFin.value = false;
  }

  // Se mueve el calendario al mes de la fecha seleccionada. se hace separando mes y año de la fecha que llega
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  //checkeo para que  el año y el mes sean válidos. Actualizamoscalendario a ese mes.
  if (
    !Number.isNaN(year) &&
    !Number.isNaN(month) &&
    month >= 1 &&
    month <= 12
  ) {
    mesMostrado.value = new Date(year, month - 1, 1);
  }
}

//  Actualiza la fecha de inicio si  usuario la cambia desde el campo manual
function seleccionarFechaInicio(value: string | null) {
  if (!value) return;

  fechaSeleccionada.value = value;
  form.fechaInicio = value;

  if (!form.fechaFin || form.fechaFin < value) {
    form.fechaFin = value;
  }

  seleccionandoFin.value = true;
}

// Cambia el calendario al mes anterio
function mesAnterior() {
  mesMostrado.value = new Date(
    mesMostrado.value.getFullYear(),
    mesMostrado.value.getMonth() - 1,
    1,
  );
}

// Cambia el calendario al mes siguiente
function mesSiguiente() {
  mesMostrado.value = new Date(
    mesMostrado.value.getFullYear(),
    mesMostrado.value.getMonth() + 1,
    1,
  );
}

// Convierte una fecha al formato yyyy-mm-dd
function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); //el mes tenga dos cifras
  const day = String(date.getDate()).padStart(2, "0"); //día con dos cifras

  return `${year}-${month}-${day}`;
}

// formateo de fecha a fecha completa escrita en español
function formatearFecha(value: string): string {
  const d = new Date(`${value}T00:00:00`);

  return d.toLocaleDateString("es-ES", { dateStyle: "full" });
}

// función para devolver las horas y minutos de una fecha
function formatearHora(value: string): string {
  const d = new Date(value);

  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

//si reserva dura mas de un día se usa esta función que formatea fecha y hora
function formatearFechaHora(value: string): string {
  const d = new Date(value);

  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// se reciebe reserva y si prepara texto que se muestra con inicio y final
function formatearRangoReserva(reserva: ReservaDTO): string {
  const inicioFecha = formatISODate(new Date(reserva.fechaInicio));
  const finFecha = formatISODate(new Date(reserva.fechaFin));

  // Si la reserva empieza y termina el mismo día solo se muestran horas
  if (inicioFecha === finFecha) {
    return `${formatearHora(reserva.fechaInicio)} - ${formatearHora(
      reserva.fechaFin,
    )}`;
  }

  // si es mñas de un día se muestran fecha y hora completas
  return `${formatearFechaHora(reserva.fechaInicio)} - ${formatearFechaHora(
    reserva.fechaFin,
  )}`;
}

// Devuelve las reservas aprobadas que coinciden con el dia que seindica
function reservasEnDia(isoDate: string): ReservaDTO[] {
  const inicioDia = new Date(`${isoDate}T00:00:00`); //inicio de día seleccionado
  const finDiaExclusivo = new Date(inicioDia);
  finDiaExclusivo.setDate(finDiaExclusivo.getDate() + 1); //fin de día

  return reservasEspacio.value
    .filter((r) => esReservaAprobada(r)) //filtro aprobadas
    .filter((r) =>
      haySolape(
        //comprobar si hay solapamiento
        new Date(r.fechaInicio),
        new Date(r.fechaFin),
        inicioDia,
        finDiaExclusivo,
      ),
    )
    .sort((a, b) => +new Date(a.fechaInicio) - +new Date(b.fechaInicio)); //ordenar reservas por hora de inicio
}

// comprobar si una reserva está en estado aprobada
function esReservaAprobada(reserva: ReservaDTO): boolean {
  return reserva.estado.toLowerCase() === "aprobada";
}

// funcion para comprobaer si dos fechas coinciden
function haySolape(
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date,
): boolean {
  return inicioA < finB && inicioB < finA;
}

// Valida el formulario y crea una nueva reserva
async function crearReserva() {
  errorFormulario.value = "";
  mensajeExito.value = "";

  if (
    !form.fechaInicio ||
    !form.horaInicio ||
    !form.fechaFin ||
    !form.horaFin
  ) {
    errorFormulario.value = "Debes indicar fecha y hora de inicio y fin.";
    return;
  }

  const fechaInicio = `${form.fechaInicio}T${form.horaInicio}`;
  const fechaFin = `${form.fechaFin}T${form.horaFin}`;

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    errorFormulario.value = "Formato de fecha/hora invalido.";
    return;
  }

  if (inicio >= fin) {
    errorFormulario.value =
      "La fecha y hora de fin debe ser posterior a la de inicio.";
    return;
  }

  //comrprobación de que no coincida con otra reserva aprobada
  const conflicto = reservasEspacio.value
    .filter((r) => esReservaAprobada(r))
    .some((r) =>
      haySolape(inicio, fin, new Date(r.fechaInicio), new Date(r.fechaFin)),
    );

  if (conflicto) {
    errorFormulario.value = "Ese tramo ya esta ocupado. Selecciona otro horario.";
    return;
  }

  enviando.value = true;

  //se crea reserva usando el store
  try {
    await espaciosStore.crearReserva({
      espacioId: props.espacioId,
      fechaInicio,
      fechaFin,
      titulo: form.titulo.trim() || undefined,
    });
    //devuelve si ha habido error
    if (espaciosStore.error) {
      errorFormulario.value = espaciosStore.error;
      return;
    }
    //limpiar formulario y mensaje
    form.titulo = "";
    mensajeExito.value =
      "Reserva creada correctamente. Queda pendiente de revision.";
    //vuelve a cargar reseervas y se emite evento de reserva nueva
    await cargarReservas();
    emit("reserva-creada");
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

/* Caja principal del calendario */
.calendario-espacio {
  @include ag-calendar-container;
}

/* Cabecera del componente */
.calendario-espacio__header {
  @include ag-card-header;
}

/* Barra central donde con botones de mes anterior ysiguiente y nombre mes */
.calendario-espacio__month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-heading;
}

/* botones */
.calendario-espacio__month-btn {
  color: $color-heading !important;

  ::v-deep(.v-btn__content) {
    color: $color-heading !important;
  }

  ::v-deep(.v-icon) {
    color: $color-heading !important;
    opacity: 1 !important;
  }

  &:hover {
    background-color: rgba(15, 23, 42, 0.9);
  }
}

/* Rejilla de 7 columnas para cada díia de la semana */
.calendario-espacio__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: $spacing-1;
}

/* Texto de los dias de la semana */
.calendario-espacio__weekday {
  text-align: center;
  font-size: 0.8rem;
  color: $color-text-muted;
  padding: $spacing-1 0;
}

/* Boton de cada dia del calendario */
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
  transition:
    background-color $transition-fast,
    border-color $transition-fast;

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

  /* Dia seleccionado por el usuario. */
  &.is-selected {
    border-color: $color-primary;
    background-color: $color-primary-soft;
    color: $color-background;
  }

  &.is-in-range {
    border-color: rgba($color-primary, 0.45);
    background-color: rgba($color-primary, 0.16);
  }

  &.is-range-start,
  &.is-range-end {
    border-color: $color-primary;
    background-color: $color-primary-soft;
    color: $color-background;
  }

  /*  dia de hoy. */
  &.is-today {
    box-shadow: inset 0 0 0 1px $color-info;
  }

  /* Borde para dias con reserva aprobada. */
  &.is-blocked {
    border-color: $color-warning;
  }
}

/* bloque donde se muestra la lista de reservas del dia seleccionado. */
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
