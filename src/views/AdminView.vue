<template>
  <v-container class="admin-container">
    <v-card class="ag-card pa-4">
      <!-- Título principal -->
      <v-card-title class="text-h6 mb-2">
        Administración de AgoraEspacios
      </v-card-title>

      <!-- Subtítulo / ayuda -->
      <v-card-subtitle class="mb-4">
        Gestiona categorías y espacios. Otras funciones de administración
        (usuarios, reservas, informes) se ampliarán más adelante.
      </v-card-subtitle>

      <!-- Mensaje de error general del store -->
      <v-alert
        v-if="espaciosStore.error"
        type="error"
        density="comfortable"
        class="mb-4"
      >
        {{ espaciosStore.error }}
      </v-alert>

      <!-- Selector de pestañas -->
      <v-tabs v-model="tab" class="mb-4" grow>
        <v-tab value="categorias">Categorías</v-tab>
        <v-tab value="espacios">Espacios</v-tab>
      </v-tabs>

      <v-divider class="mb-4" />

      <!-- Contenido de categorías -->
      <div v-if="tab === 'categorias'">
        <v-row>
          <!-- Formulario de categoría -->
          <v-col cols="12" md="4">
            <h3 class="text-subtitle-1 mb-2">
              {{ categoriaEditId ? "Editar categoría" : "Nueva categoría" }}
            </h3>

            <v-form @submit.prevent="guardarCategoria">
              <v-text-field
                v-model="categoriaNombre"
                label="Nombre"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                required
              />

              <v-textarea
                v-model="categoriaDescripcion"
                label="Descripción"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" class="mr-2">
                {{ categoriaEditId ? "Guardar cambios" : "Crear categoría" }}
              </v-btn>

              <v-btn
                v-if="categoriaEditId"
                type="button"
                variant="text"
                @click="resetCategoriaForm"
              >
                Cancelar
              </v-btn>
            </v-form>
          </v-col>

          <!-- Tabla de categorías -->
          <v-col cols="12" md="8">
            <h3 class="text-subtitle-1 mb-2">Listado de categorías</h3>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Nombre</th>
                  <th class="text-left">Descripción</th>
                  <th class="text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in espaciosStore.categorias" :key="cat.id">
                  <td>{{ cat.id }}</td>
                  <td>{{ cat.nombre }}</td>
                  <td>{{ cat.descripcion }}</td>
                  <td>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="editarCategoria(cat)"
                    >
                      Editar
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="borrarCategoria(cat.id)"
                    >
                      Eliminar
                    </v-btn>
                  </td>
                </tr>

                <tr v-if="!espaciosStore.categorias.length">
                  <td colspan="4" class="text-center text-disabled py-4">
                    No hay categorías todavía.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </div>

      <!-- Contenido de espacios -->
      <div v-else-if="tab === 'espacios'">
        <v-row>
          <!-- Formulario de espacio -->
          <v-col cols="12" md="5">
            <h3 class="text-subtitle-1 mb-2">
              {{ espacioEditId ? "Editar espacio" : "Nuevo espacio" }}
            </h3>

            <v-form @submit.prevent="guardarEspacio">
              <v-text-field
                v-model="espacioNombre"
                label="Nombre"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                required
              />

              <v-select
                v-model="espacioCategoriaId"
                :items="espaciosStore.categorias"
                item-title="nombre"
                item-value="id"
                label="Categoría"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                required
              />

              <v-text-field
                v-model.number="espacioCapacidad"
                label="Capacidad"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                required
              />

              <v-text-field
                v-model="espacioUbicacion"
                label="Ubicación"
                variant="outlined"
                density="comfortable"
                class="mb-2"
              />

              <v-textarea
                v-model="espacioDescripcion"
                label="Descripción"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
                class="mb-2"
              />

              <v-text-field
                v-model="espacioImagenUrl"
                label="URL de imagen (opcional)"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" class="mr-2">
                {{ espacioEditId ? "Guardar cambios" : "Crear espacio" }}
              </v-btn>

              <v-btn
                v-if="espacioEditId"
                type="button"
                variant="text"
                @click="resetEspacioForm"
              >
                Cancelar
              </v-btn>
            </v-form>
          </v-col>

          <!-- Tabla de espacios -->
          <v-col cols="12" md="7">
            <h3 class="text-subtitle-1 mb-2">Listado de espacios</h3>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Nombre</th>
                  <th class="text-left">Categoría</th>
                  <th class="text-left">Capacidad</th>
                  <th class="text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="esp in espaciosStore.espacios" :key="esp.id">
                  <td>{{ esp.id }}</td>
                  <td>{{ esp.nombre }}</td>
                  <!-- si tienes categoriaNombre en el DTO, úsalo; si no, mostramos el id -->
                  <td>
                    {{ (esp as any).categoriaNombre || esp.categoriaEspacioId }}
                  </td>
                  <td>{{ esp.capacidad }}</td>
                  <td>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="editarEspacio(esp)"
                    >
                      Editar
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="borrarEspacio(esp.id)"
                    >
                      Eliminar
                    </v-btn>
                  </td>
                </tr>

                <tr v-if="!espaciosStore.espacios.length">
                  <td colspan="5" class="text-center text-disabled py-4">
                    No hay espacios todavía.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useEspaciosStore } from "../store/espacios";

const espaciosStore = useEspaciosStore();

// pestaña activa
const tab = ref<"categorias" | "espacios">("categorias");

// ---------- CATEGORÍAS ----------
const categoriaEditId = ref<number | null>(null);
const categoriaNombre = ref("");
const categoriaDescripcion = ref("");

// Cargar datos iniciales
onMounted(async () => {
  await espaciosStore.cargarCategorias();
  await espaciosStore.cargarEspacios();
});

// Crear / actualizar categoría
const guardarCategoria = async () => {
  if (!categoriaNombre.value.trim()) return;

  const dto = {
    nombre: categoriaNombre.value.trim(),
    descripcion: categoriaDescripcion.value.trim(),
  };

  if (categoriaEditId.value) {
    await espaciosStore.actualizarCategoria(categoriaEditId.value, dto);
  } else {
    await espaciosStore.crearCategoria(dto);
  }

  resetCategoriaForm();
};

// Rellenar formulario para edición
const editarCategoria = (cat: any) => {
  categoriaEditId.value = cat.id;
  categoriaNombre.value = cat.nombre;
  categoriaDescripcion.value = cat.descripcion || "";
};

// Eliminar categoría
const borrarCategoria = async (id: number) => {
  if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;
  await espaciosStore.borrarCategoria(id);
};

// Reset formulario categoría
const resetCategoriaForm = () => {
  categoriaEditId.value = null;
  categoriaNombre.value = "";
  categoriaDescripcion.value = "";
};

// ---------- ESPACIOS ----------
const espacioEditId = ref<number | null>(null);
const espacioNombre = ref("");
const espacioCategoriaId = ref<number | null>(null);
const espacioCapacidad = ref<number | null>(null);
const espacioUbicacion = ref("");
const espacioDescripcion = ref("");
const espacioImagenUrl = ref("");

// Crear / actualizar espacio
const guardarEspacio = async () => {
  if (
    !espacioNombre.value.trim() ||
    !espacioCategoriaId.value ||
    !espacioCapacidad.value
  ) {
    return;
  }

  const dto = {
    nombre: espacioNombre.value.trim(),
    categoriaEspacioId: espacioCategoriaId.value,
    capacidad: Number(espacioCapacidad.value),
    ubicacion: espacioUbicacion.value.trim(),
    descripcion: espacioDescripcion.value.trim(),
    imagenUrl: espacioImagenUrl.value.trim(),
  };

  if (espacioEditId.value) {
    await espaciosStore.actualizarEspacio(espacioEditId.value, dto);
  } else {
    await espaciosStore.crearEspacio(dto);
  }

  resetEspacioForm();
};

// Rellenar formulario para edición
const editarEspacio = (esp: any) => {
  espacioEditId.value = esp.id;
  espacioNombre.value = esp.nombre;
  espacioCategoriaId.value = esp.categoriaEspacioId;
  espacioCapacidad.value = esp.capacidad;
  espacioUbicacion.value = esp.ubicacion || "";
  espacioDescripcion.value = esp.descripcion || "";
  espacioImagenUrl.value = esp.imagenUrl || "";
};

// Eliminar espacio
const borrarEspacio = async (id: number) => {
  if (!confirm("¿Seguro que quieres eliminar este espacio?")) return;
  await espaciosStore.borrarEspacio(id);
};

// Reset formulario espacio
const resetEspacioForm = () => {
  espacioEditId.value = null;
  espacioNombre.value = "";
  espacioCategoriaId.value = null;
  espacioCapacidad.value = null;
  espacioUbicacion.value = "";
  espacioDescripcion.value = "";
  espacioImagenUrl.value = "";
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.ag-card {
  @include ag-section($spacing-4);
}

.admin-container {
  margin-top: $spacing-10 + $spacing-2;
}
</style>
