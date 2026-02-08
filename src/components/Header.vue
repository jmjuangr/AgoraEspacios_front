<template>
  <v-app-bar density="comfortable" class="ag-header" flat theme="dark">
    <!-- Marca / título -->
    <div class="ag-header__brand" @click="goHome">
      <div class="ag-header__logo">
        <v-icon size="22">mdi-city-variant-outline</v-icon>
      </div>
      <div class="ag-header__titles">
        <span class="ag-header__app-name">{{ $t("appName") }}</span>
        <span class="ag-header__app-subtitle">
          Gestión de espacios públicos
        </span>
      </div>
    </div>

    <v-spacer />

    <!-- Navegación cuando estoy logueado -->
    <div v-if="isLoggedIn" class="ag-header__nav">
      <v-btn
        variant="text"
        :class="[
          'ag-header__nav-btn',
          { 'ag-header__nav-btn--active': isActiveRoute('/espacios') },
        ]"
        color="grey-lighten-4"
        @click="goTo('/espacios')"
      >
        {{ $t("header.espacios") }}
      </v-btn>

      <v-btn
        variant="text"
        :class="[
          'ag-header__nav-btn',
          { 'ag-header__nav-btn--active': isActiveRoute('/mis-reservas') },
        ]"
        color="grey-lighten-4"
        @click="goTo('/mis-reservas')"
      >
        {{ $t("header.misReservas") }}
      </v-btn>

      <v-btn
        v-if="isAdmin"
        variant="text"
        :class="[
          'ag-header__nav-btn',
          'ag-header__nav-btn--admin',
          { 'ag-header__nav-btn--active': isActiveRoute('/admin') },
        ]"
        color="cyan-lighten-2"
        @click="goTo('/admin')"
      >
        {{ $t("header.admin") }}
      </v-btn>
    </div>

    <v-spacer />

    <!-- Zona derecha: usuario / logout -->
    <div class="ag-header__right">
      <div v-if="isLoggedIn" class="ag-header__user">
        <v-icon size="20" class="mr-1">mdi-account-circle-outline</v-icon>
        <span class="ag-header__user-name">
          {{ displayName }}
        </span>
      </div>

      <v-btn
        v-if="isLoggedIn"
        class="ag-btn-secondary ml-2"
        variant="outlined"
        size="small"
        @click="handleLogout"
      >
        {{ $t("header.logout") }}
      </v-btn>
      <!-- 👉 Si no estoy logueado, aquí ya no hay nada -->
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLoggedIn = computed(() => auth.isAuthenticated);
const isAdmin = computed(() => auth.isAdmin);
const displayName = computed(() => auth.nombre || auth.email || "Invitado");

const goHome = () => {
  if (auth.isAuthenticated) {
    router.push("/espacios");
  } else {
    router.push("/login");
  }
};

const goTo = (path: string) => {
  router.push(path);
};

const isActiveRoute = (path: string) =>
  route.path === path || route.path.startsWith(`${path}/`);

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.ag-header {
  background-color: $color-background-soft;
  border-bottom: 1px solid $color-border;
  padding-inline: $spacing-4;
  box-shadow: 0 4px 14px rgba(2, 6, 23, 0.35);
}

.ag-header__brand {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;

  & .v-icon {
    color: $color-heading;
  }
}

.ag-header__logo {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-primary-strong;
  box-shadow: 0 0 0 1px $color-border;
}

.ag-header__titles {
  display: flex;
  flex-direction: column;
}

.ag-header__app-name {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
}

.ag-header__app-subtitle {
  font-size: 0.75rem;
  color: #cbd5e1;
}

.ag-header__nav {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.ag-header__nav-btn {
  text-transform: none;
  font-size: 0.9rem;
  border-radius: $radius-pill;
  padding-inline: $spacing-3;
  min-height: 32px;

  &:hover {
    background-color: rgba(37, 99, 235, 0.12);
  }

  &--active {
    background-color: rgba(37, 99, 235, 0.2);
    border: 1px solid rgba(148, 163, 184, 0.45);
  }

  :deep(.v-btn__content) {
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  &--admin {
    &:hover {
      background-color: rgba(6, 182, 212, 0.12);
    }

    &.ag-header__nav-btn--active {
      background-color: rgba(6, 182, 212, 0.18);
      border-color: rgba(6, 182, 212, 0.35);
    }
  }
}

.ag-header__right {
  display: flex;
  align-items: center;
}

.ag-header__user {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: $color-heading;
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid $color-border;
  border-radius: $radius-pill;
  padding: 4px 10px;

  .v-icon {
    color: $color-primary-soft;
  }
}

.ag-header__user-name {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ag-btn-primary {
  @include ag-button-primary;
}

.ag-btn-secondary {
  @include ag-button-secondary;
}
</style>
