<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const route = useRoute()

const isRegister = computed(() => route.path === '/auth/register')
</script>

<template>
  <div class="login-container h-screen w-screen flex items-center justify-center bg-cover ">

    <!-- <DotLottieVue class="absolute inset-0 w-full h-full object-cover pointer-events-none bg-blue-900" autoplay loop
      src="/src/assets/Wave Animation.lottie">
    </DotLottieVue> -->

    <!-- <DotLottieVue class="absolute inset-0 w-full h-full object-cover pointer-events-none bg-blue-900" autoplay loop
      src="/src/assets/Abstract blue and yellow.lottie">
    </DotLottieVue> -->

    <DotLottieVue class="absolute inset-0 w-full h-full object-cover pointer-events-none bg-blue-100" autoplay loop
      src="/src/assets/Wave Lines Animation.lottie">
    </DotLottieVue>

    <!-- <Vue3Lottie :animationData="Backfround" class="absolute inset-0 z-0" /> -->
    <div
      class="login-mask z-10 box-border relative flex w-[75%] h-[90%] px-[50px] rounded-[10px] bg-white/60 blur-sm pointer-events-auto">
    </div>
    <div
      class="login-box absolute inset-0 m-auto bg-white w-[90%] max-w-[800px] h-[90%] max-h-[600px] flex justify-between z-20 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
      <div class="login-form flex-1 h-full flex flex-col px-[30px] overflow-y-auto"
        :class="isRegister ? 'w-full' : 'w-full md:w-1/2'">
        <div class="my-auto py-10 ">
          <router-view></router-view>
        </div>
      </div>
      <div v-if="!isRegister" class="login-banner hidden w-1/2 h-full bg-cover bg-center md:block"></div>
    </div>
  </div>
</template>

<style scoped>
.login-banner {
  background-image: url('@/assets/cozy-workspace-with-laptop-notebook.jpg');
}
</style>
