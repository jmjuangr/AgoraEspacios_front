<template>
  <v-app>
    <Header />

    <v-main class="app-main">
      <div class="app-main__content">
        <router-view />
      </div>
    </v-main>

    <Footer />
  </v-app>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<style scoped>
.v-app {
  min-height: 100vh;
}

.app-main {
  flex: 1 0 auto;
}

.app-main__content {
  padding: 32px 16px 88px;
}
</style>
