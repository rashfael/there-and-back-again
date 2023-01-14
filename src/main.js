import { createApp } from 'vue'
import Buntpapier from 'buntpapier'

import '~/styles/base.styl'
import App from './App.vue'

import '@fontsource/quattrocento'
import '@fontsource/quattrocento/400.css'
import '@fontsource/quattrocento/700.css'
import '@mdi/font/css/materialdesignicons.css'

import store from '~/store'

store.signInWithGitHub()
const app = createApp(App)
app.use(Buntpapier)
app.mount('#app')
