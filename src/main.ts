import { createApp } from 'vue'
import pinia from '@/stores'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import '@/styles/index.scss'

import './firebase'

const app = createApp(App)

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
