<template>
  <div>123 <button @click="router.push('/')">///</button></div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped></style>
