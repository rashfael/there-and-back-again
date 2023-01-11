module.exports = {
	plugins: [
		'vue',
		'import'
	],
	rules: {
		'arrow-parens': 0,
		'generator-star-spacing': 0,
		'no-debugger': 'off',
		indent: [2, 'tab', {SwitchCase: 1}],
		'no-tabs': 0,
		'comma-dangle': 0,
		curly: 0,
		'no-return-assign': 0,
		'no-console': 'off',
		'vue/require-default-prop': 0,
		'object-curly-spacing': 0,
		'no-restricted-globals': ['error', 'event'],
		camelcase: ['error', {properties: 'never', ignoreDestructuring: true}],
		'multiline-ternary': 0,
		quotes: ['error', 'single', { allowTemplateLiterals: true }], // not really ideal, but "avoidEscape" only allows double quotes
		'prefer-const': 0,
		'vue/attribute-hyphenation': ['warn', 'never'],
		'vue/v-on-event-hyphenation': ['warn', 'never'],
		'vue/multi-word-component-names': 0,
		'vue/max-attributes-per-line': 0,
		'vue/no-multi-spaces': 0, // TODO disable once upstream
		'vue/attributes-order': ['error', {
			order: [
				'DEFINITION',
				'LIST_RENDERING',
				'CONDITIONALS',
				'RENDER_MODIFIERS',
				'GLOBAL',
				['UNIQUE', 'SLOT'],
				'TWO_WAY_BINDING',
				'OTHER_ATTR',
				'OTHER_DIRECTIVES',
				'EVENTS',
				'CONTENT'
			],
			alphabetical: false
		}],
		'vue/no-v-html': 0,
		'vue/html-end-tags': 0, // TODO disable once upstream
		// only warn for v-for to not get swamped
		'vue/require-v-for-key': ['warn'],
		'vue/valid-v-for': ['warn'],
		'vue/html-indent': 0,
		'vue/no-mutating-props': ['warn'],
		'vue/require-toggle-inside-transition': ['warn'],
		'vue/html-closing-bracket-newline': 0,
		'vue/html-closing-bracket-spacing': 0
	},

	globals: {
		localStorage: false,
		$: 'readonly',
		$$: 'readonly',
		$ref: 'readonly',
		$computed: 'readonly',
	},

	env: {
		browser: true,
		node: true,
		'vue/setup-compiler-macros': true // TODO enable once eslint-vue is updated
	},

	extends: [
		'plugin:vue/vue3-recommended',
		'plugin:vue-pug/vue3-recommended',
		'standard'
	]
}
