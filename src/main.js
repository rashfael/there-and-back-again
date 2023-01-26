import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Buntpapier from 'buntpapier'

import '~/styles/base.styl'
import routes from '~/routes'
import App from './App.vue'

import '@fontsource/quattrocento'
import '@fontsource/quattrocento/400.css'
import '@fontsource/quattrocento/700.css'
import '@mdi/font/css/materialdesignicons.css'
import '@fontsource/playfair-display'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/800.css'
import '@fontsource/playfair-display/900.css'
import '@fontsource/mirza'
import '@fontsource/mirza/400.css'
import '@fontsource/mirza/500.css'
import '@fontsource/mirza/600.css'
import '@fontsource/mirza/700.css'

import store from '~/store'

await store.signInWithGitHub()
const app = createApp(App)
app.use(Buntpapier)
// use router
const router = createRouter({
	history: createWebHistory(),
	routes
})
app.use(router)
app.mount('#app')
