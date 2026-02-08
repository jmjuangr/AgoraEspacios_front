<template>
  <v-footer app class="ag-footer justify-center">
    <div class="ag-footer__text py-2">
      © {{ new Date().getFullYear() }} AgoraEspacios
    </div>
  </v-footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import "@/assets/styles/_mixins.scss";

.ag-footer {
  background-color: $color-background-soft;
  border-top: 1px solid $color-border;
  box-shadow: 0 -4px 14px rgba(2, 6, 23, 0.35);
  min-height: 44px;
}

.ag-footer__text {
  color: $color-text;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
}
</style>
