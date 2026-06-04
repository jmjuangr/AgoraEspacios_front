<template>
  <v-app-bar density="comfortable" class="ag-header" flat theme="dark">
    <div class="ag-header__brand" @click="goHome">
      <div class="ag-header__logo">
        <img :src="agoraLogo" alt="AgoraEspacios" class="ag-header__logo-img" />
      </div>
      <div class="ag-header__titles">
        <span class="ag-header__app-name">AgoraEspacios</span>
        <span class="ag-header__app-subtitle">
          Gestión de espacios públicos
        </span>
      </div>
    </div>

    <v-spacer />

    <!-- navegacion con hay login -->
    <div v-if="isLoggedIn" class="ag-header__nav">
      <v-btn
        variant="text"
        :class="[
          'ag-header__nav-btn',
          { 'ag-header__nav-btn--active': isActiveRoute('/espacios') },
        ]"
        @click="goTo('/espacios')"
      >
        Espacios
      </v-btn>

      <v-btn
        variant="text"
        :class="[
          'ag-header__nav-btn',
          { 'ag-header__nav-btn--active': isActiveRoute('/mis-reservas') },
        ]"
        @click="goTo('/mis-reservas')"
      >
        Mis reservas
      </v-btn>

      <v-btn
        v-if="isAdmin"
        variant="text"
        :class="[
          'ag-header__nav-btn',
          'ag-header__nav-btn--admin',
          { 'ag-header__nav-btn--active': isActiveRoute('/admin') },
        ]"
        @click="goTo('/admin')"
      >
        Admin
      </v-btn>

      <v-btn
        v-if="isAdmin"
        variant="text"
        :class="[
          'ag-header__nav-btn',
          'ag-header__nav-btn--admin',
          { 'ag-header__nav-btn--active': isActiveRoute('/reservas') },
        ]"
        @click="goTo('/reservas')"
      >
        Reservas
      </v-btn>
    </div>

    <v-spacer />

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
        Cerrar sesión
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import agoraLogo from "@/assets/agora-espacios-icon.svg";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// estado de autenticación
const isLoggedIn = computed(() => auth.isAuthenticated);
const isAdmin = computed(() => auth.isAdmin);
// Nombre que se muestra en pantalla; si falta el nombre se usa el email.
const displayName = computed(() => auth.nombre || auth.email || "Invitado");

const goHome = () => {
  if (auth.isAuthenticated) {
    router.push("/espacios");
  } else {
    router.push("/login");
  }
};

// Navegacion
const goTo = (path: string) => {
  router.push(path);
};

const isActiveRoute = (path: string) =>
  route.path === path || route.path.startsWith(`${path}/`);

// Cierra sesion y vuelve al login
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

  :deep(.v-toolbar__content) {
    min-width: 0;
    gap: $spacing-2;
  }
}

.ag-header__brand {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex: 0 0 auto;
  min-width: 0;
  cursor: pointer;

  & .v-icon {
    color: $color-heading;
  }
}

.ag-header__logo {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-white;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.45),
    0 8px 18px rgba(2, 6, 23, 0.28);
}

.ag-header__logo-img {
  width: 30px;
  height: 30px;
  display: block;
  object-fit: contain;
}

.ag-header__titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ag-header__app-name {
  font-size: 1rem;
  font-weight: 600;
  color: $color-white;
  white-space: nowrap;
}

.ag-header__app-subtitle {
  font-size: 0.75rem;
  color: $color-text;
  white-space: nowrap;
}

.ag-header__nav {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex: 0 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.ag-header__nav-btn {
  flex: 0 0 auto;
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
    color: $color-heading;
  }

  &--admin {
    &:hover {
      background-color: rgba(6, 182, 212, 0.12);
    }

    &.ag-header__nav-btn--active {
      background-color: rgba(6, 182, 212, 0.18);
      border-color: rgba(6, 182, 212, 0.35);
    }

    :deep(.v-btn__content) {
      color: $color-secondary-soft;
    }
  }
}

.ag-header__right {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  min-width: 0;
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
  white-space: nowrap;
}

@media (max-width: 960px) {
  .ag-header {
    padding-inline: $spacing-3;
  }

  .ag-header__nav {
    gap: $spacing-1;
  }

  .ag-header__nav-btn {
    font-size: 0.85rem;
    padding-inline: $spacing-2;
  }

  .ag-header__user-name {
    max-width: 110px;
  }
}

@media (max-width: 700px) {
  .ag-header {
    padding-inline: $spacing-2;
  }

  .ag-header__app-subtitle,
  .ag-header__user {
    display: none;
  }

  .ag-header__nav-btn {
    font-size: 0.8rem;
    min-height: 30px;
  }
}

@media (max-width: 480px) {
  .ag-header__logo {
    width: 32px;
    height: 32px;
  }

  .ag-header__logo-img {
    width: 26px;
    height: 26px;
  }

  .ag-header__app-name {
    font-size: 0.9rem;
  }

  .ag-btn-secondary {
    padding-inline: $spacing-2;
  }
}
</style>
