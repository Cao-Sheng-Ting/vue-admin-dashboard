<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// import { Vue3Lottie } from 'vue3-lottie'
// import Backfround from '@/assets/Background Grey Wave.json'

const route = useRoute()

const isRegister = computed(() => route.path === '/auth/register')
</script>

<template>
  <div class="login-container h-screen w-screen flex items-center justify-center bg-cover ">
    <!-- <Vue3Lottie :animationData="Backfround" class="absolute inset-0 z-0" /> -->
    <div class="fixed inset-0 z-0 bg-indigo-900 bg-cover "></div>
    <div
      class="login-mask z-10 box-border relative flex w-[90%] h-[85%] px-[50px] rounded-[10px] bg-white/80 pointer-events-auto">
      <div
        class="login-box absolute inset-0 m-auto bg-white w-[90%] max-w-[800px] h-[90%] max-h-[600px] flex justify-between rounded-xl shadow-xl overflow-hidden">
        <div class="login-form flex-1 h-full flex flex-col px-[30px] overflow-y-auto"
          :class="isRegister ? 'w-full' : 'w-full md:w-1/2'">
          <div class="my-auto py-10 ">
            <router-view></router-view>
          </div>
        </div>
        <div v-if="!isRegister" class="login-banner hidden w-1/2 h-full bg-cover bg-center md:block"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-banner {
  background-image: url('@/assets/Gemini_Generated_Image_6wd2m46wd2m46wd2.png');
}
</style>
