import { createApp } from 'vue'
import Buntpapier from 'buntpapier'

import '~/styles/base.styl'
import App from './App.vue'

import '@fontsource/roboto'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@mdi/font/css/materialdesignicons.css'

import store from '~/store'

store.signInWithGitHub()
const app = createApp(App)
app.use(Buntpapier)
app.mount('#app')
