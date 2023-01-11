import path from 'path'
import { defineConfig } from 'vite'
import BuntpapierStylus from 'buntpapier/stylus.js'
import vue from './plugin-vue.js'

const stylusOptions = {
	paths: [
		// stylus does not allow for dynamic resolves, so we just list all paths here and hope it won't explode
		path.resolve(__dirname, './src/styles'),
		'node_modules'
	],
	use: [BuntpapierStylus({implicit: false})],
	imports: ['buntpapier/buntpapier/index.styl', `${path.resolve(__dirname, './src/styles/variables.styl')}`]
}

export default defineConfig({
	plugins: [vue({
		reactivityTransform: true,
	})],
	css: {
		preprocessorOptions: {
			stylus: stylusOptions,
			styl: stylusOptions
		}
	},
	resolve: {
		mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
		extensions: ['.js', '.json', '.vue'],
		alias: [
			{find: 'lodash', replacement: 'lodash-es'},
			{find: '~', replacement: path.resolve(__dirname, './src')},
		],
	},
})
