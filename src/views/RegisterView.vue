<template>
  <v-container class="login-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 login-card" elevation="6">
          <v-card-title class="text-h6 text-center mb-4">
            Registro
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field v-model="nombre" label="Nombre" required />

              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                required
              />

              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
              />

              <v-text-field
                v-model="password2"
                label="Repite la contraseña"
                type="password"
                required
                :error="password2Error"
                :error-messages="
                  password2Error ? 'Las contraseñas no coinciden' : ''
                "
              />

              <v-alert
                v-if="errorMsg"
                type="error"
                class="mb-4"
                density="compact"
              >
                {{ errorMsg }}
              </v-alert>

              <v-btn
                type="submit"
                block
                color="primary"
                :disabled="password2Error"
              >
                Crear cuenta
              </v-btn>

              <div class="text-caption mt-3 text-center">
                <router-link to="/login">
                  ¿Ya tienes cuenta? Inicia sesión
                </router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const nombre = ref("");
const email = ref("");
const password = ref("");
const password2 = ref("");
const errorMsg = ref("");

const password2Error = computed<boolean>(
  () =>
    !!(password.value && password2.value && password.value !== password2.value)
);

const handleRegister = async () => {
  errorMsg.value = "";

  if (password2Error.value) return;

  try {
    await auth.register({
      nombre: nombre.value,
      email: email.value,
      password: password.value,
    });

    if (auth.isAdmin) router.push("/admin");
    else router.push("/espacios");
  } catch (err: any) {
    errorMsg.value = err.message || "Error desconocido al registrar";
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 16px;
  background-color: $color-surface;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.45);
  max-width: 420px;
  width: 100%;
  margin: 0 auto;

  @include ag-auth-fields;
}

.text-h6 {
  font-weight: 600;
  color: $color-heading;
}

.text-caption a {
  color: $color-primary-soft;
}
</style>
