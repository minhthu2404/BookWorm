import './assets/css/global.css'
import 'vue3-toastify/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'

const app = createApp(App)

app.use(router)

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right'
})

app.mount('#app')
