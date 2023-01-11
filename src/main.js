import { createApp } from 'vue'
import Buntpapier from 'buntpapier'

import '~/styles/base.styl'
import App from './App.vue'

import '@fontsource/roboto'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)
app.use(Buntpapier)
app.mount('#app')
