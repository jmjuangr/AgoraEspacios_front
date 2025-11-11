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
.v-main {
  min-height: calc(100vh - 128px); /* aprox header+footer */
}
</style>
