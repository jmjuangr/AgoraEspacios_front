<template>
  <v-container class="d-flex justify-center">
    <v-card class="ag-card" width="400">
      <v-card-title class="text-h6 text-center">
        {{ $t("login.title") }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            :label="$t('login.email')"
            type="email"
            required
          />
          <v-text-field
            v-model="password"
            :label="$t('login.password')"
            type="password"
            required
          />

          <v-alert v-if="errorMsg" type="error" class="mb-4" density="compact">
            {{ errorMsg }}
          </v-alert>

          <v-btn type="submit" block class="mb-2" color="primary">
            {{ $t("login.submit") }}
          </v-btn>
        </v-form>

        <router-link to="/register" class="text-caption">
          {{ $t("login.registerLink") }}
        </router-link>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMsg = ref("");

const handleLogin = async () => {
  errorMsg.value = "";
  try {
    await auth.login({ email: email.value, password: password.value });

    if (auth.isAdmin) {
      router.push("/admin");
    } else {
      router.push("/espacios");
    }
  } catch (err: any) {
    errorMsg.value = err.message || "Error desconocido al iniciar sesión";
  }
};
</script>
