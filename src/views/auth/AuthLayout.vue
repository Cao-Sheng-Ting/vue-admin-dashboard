<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import waveAnimation from '@/assets/wave-lines-animation.lottie?url'

const route = useRoute()

const isRegister = computed(() => route.path === '/auth/register')
</script>

<template>
  <div class="login-container relative h-screen w-screen flex items-center justify-center bg-cover overflow-hidden">

    <DotLottieVue class="absolute inset-0 w-full h-full object-cover pointer-events-none bg-blue-100" autoplay loop
      :src="waveAnimation">
    </DotLottieVue>

    <div class="relative z-10 flex w-[75%] h-[90%]">
      <div class="login-mask absolute -inset-x-20 -inset-y-2 rounded-[10px] bg-white/60 blur-sm">
      </div>
      <div
        class="login-box absolute inset-0 m-auto bg-white flex justify-between z-20 max-w-[800px] max-h-[600px] rounded-xl shadow-xl shadow-black/30 overflow-hidden">
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
  background-image: url('@/assets/cozy-workspace-with-laptop-notebook.webp');
}
</style>
