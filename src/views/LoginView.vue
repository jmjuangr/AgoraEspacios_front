<template>
  <v-container class="login-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 login-card" elevation="6">
          <v-card-title class="text-h6 text-center mb-4">
            Iniciar sesión
          </v-card-title>

          <!-- Mensaje de error -->
          <v-alert
            type="error"
            v-if="errorMessage"
            class="mb-4"
            border="start"
            prominent
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Formulario -->
          <v-form ref="formRef" @submit.prevent="onSubmit" v-model="isValid">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Correo electrónico"
              variant="outlined"
              hide-details="auto"
              prepend-inner-icon="mdi-email-outline"
              class="mb-4"
              type="email"
            />

            <v-text-field
              v-model="password"
              :rules="passwordRules"
              label="Contraseña"
              variant="outlined"
              hide-details="auto"
              prepend-inner-icon="mdi-lock-outline"
              class="mb-6"
              type="password"
            />

            <v-btn type="submit" color="primary" block :loading="loading">
              Entrar
            </v-btn>
          </v-form>

          <div class="text-center mt-4">
            <span class="no-account-text">¿No tienes cuenta?</span>
            <v-btn
              variant="text"
              color="primary"
              class="ml-1"
              @click="router.push('/register')"
            >
              Regístrate
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const isValid = ref(false);
const formRef = ref();

// Validaciones
const emailRules = [
  (v: string) => !!v || "El email es obligatorio",
  (v: string) => /.+@.+\..+/.test(v) || "Email inválido",
];

const passwordRules = [(v: string) => !!v || "La contraseña es obligatoria"];

// Enviar formulario
const onSubmit = async () => {
  errorMessage.value = null;

  const form = formRef.value;
  if (form && !(await form.validate())) {
    return;
  }

  loading.value = true;

  try {
    await auth.login({
      email: email.value,
      password: password.value,
    });

    if (auth.isAdmin) {
      router.push("/admin");
    } else {
      router.push("/espacios");
    }
  } catch (err: any) {
    errorMessage.value =
      err?.message || "Error desconocido al intentar iniciar sesión";
  } finally {
    loading.value = false;
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
  .no-account-text {
    color: $color-primary-soft;
  }
}

.text-h6 {
  font-weight: 600;
  color: $color-heading;
}
</style>
