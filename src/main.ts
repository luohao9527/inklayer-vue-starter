import { createApp } from 'vue'
import { inklayerVuePlugin } from 'inklayer-vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(inklayerVuePlugin)
app.use(router)
app.mount('#app')
