<template>
  <v-app>
    <Header />

    <v-main class="pa-4">
      <router-view />
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

.v-main {
  flex: 1 0 auto;
  padding-bottom: 60px;
}
</style>
