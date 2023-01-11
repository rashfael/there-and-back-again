import { computed, reactive, watch } from 'vue'

import supabase from '~/supabase'

window.stores = {}

// creates a simple reactive instance with:
// - config.state as reactive state
// - config.getters as computed props on the state object
// - config.actions as methods on the state object
//
// store.$reset() resets the state to the initial state
// store.watch(() => this.foo, (foo) => {})

export function createStore (storeName, config) {
	const store = reactive(config.state())

	if (config.getters) {
		Object.assign(store, Object.fromEntries(
			Object.entries(config.getters).map(([key, getter]) => [key, computed(getter.bind(store))])
		))
	}

	const actionSubscriptions = []

	// callback is called with ({store, name, args, after, onError}) when an action is about to be invoked
	// TODO after, onError
	store.$onAction = function (callback) {
		actionSubscriptions.push(callback)
		return () => {
			const index = actionSubscriptions.indexOf(callback)
			if (index >= 0) actionSubscriptions.splice(index, 1)
		}
	}

	for (const [name, action] of Object.entries(config.actions)) {
		store[name] = function (...args) {
			for (const callback of actionSubscriptions) {
				// eslint-disable-next-line n/no-callback-literal
				callback({store, name, args})
			}
			return action.call(store, ...args)
		}
	}

	store.$reset = function () {
		// TODO does not get rid of unspecified properties
		Object.assign(store, config.state())
	}

	// TODO store key watch?
	store.$watch = store.watch = function (getter, callback) {
		watch(getter.bind(store), callback.bind(store))
	}

	window.stores[storeName] = store
	return store
}

export function mapState (store, arrOrObj) {
	if (Array.isArray(arrOrObj)) {
		return Object.fromEntries(arrOrObj.map(key => [key, () => store[key]]))
	} else {
		return Object.fromEntries(
			Object.entries(arrOrObj).map(([key, value]) => [key, () => store[value]])
		)
	}
}

export function mapActions (store, arrOrObj) {
	if (Array.isArray(arrOrObj)) {
		return Object.fromEntries(arrOrObj.map(key => [key, store[key].bind(store)]))
	} else {
		return Object.fromEntries(
			Object.entries(arrOrObj).map(([key, value]) => [key, store[value].bind(store)])
		)
	}
}

const store = createStore('store', {
	state: () => ({
		user: null,
		entries: null
	}),
	getters: {},
	actions: {
		async signInWithGitHub () {
			let user, error
			({ data: { user } } = await supabase.auth.getUser())
			if (!user) {
				({ data: { user }, error } = await supabase.auth.signInWithOAuth({
					provider: 'github',
				}))
			}
			if (error) console.error(error)
			this.user = user
		},
		async fetchEntries () {
			const { data: entries, error } = await supabase
				.from('entries')
				.select('*')
			if (error) console.error(error)
			this.entries = entries
		},
		async createEntry (entry) {
			const { data, error } = await supabase
				.from('entries')
				.insert(entry)
				.select()
			if (error) console.error(error)
			this.entries.push(data[0])
		}
	}
})

export default store
