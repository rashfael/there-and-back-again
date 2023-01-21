import { computed, reactive, watch } from 'vue'

import supabase from '~/supabase'

import journeyData from '../../data/data.json'
import { miToKm } from '~/lib/utils'

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
		loading: false,
		user: null,
		journeys: [],
		entries: []
	}),
	getters: {
		travelledDistance () {
			return this.entries?.reduce((sum, entry) => sum + entry.distance, 0)
		},
		activeJourney () {
			const activeJourney = this.journeys?.find(journey => !journey.finished_at)
			if (!activeJourney) return
			const activeJourneyData = journeyData.find(journey => journey.id === activeJourney.journey)
			const journey = {
				...activeJourneyData,
				...activeJourney,
				legs: activeJourneyData.legs.map(leg => ({
					...leg,
					distance: miToKm(leg.length_miles) * 1000
				}))
			}

			journey.totalDistance = journey.legs.reduce((sum, leg) => sum + leg.distance, 0)

			let remainingDistance = this.travelledDistance
			for (const leg of journey.legs) {
				if (remainingDistance <= 0) {
					leg.remainingDistance = leg.distance
					leg.show = false
					continue
				}
				leg.remainingDistance = Math.max(0, leg.distance - remainingDistance)
				remainingDistance -= leg.distance
				leg.show = true
			}
			journey.legs[0].show = true

			return journey
		}
	},
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
			const { data: profile } = await supabase
				.from('profiles')
				.select('*')
			this.user = user
			this.user.profile = profile?.[0]
		},
		async loadData () {
			this.loading = true
			await this.fetchJourneys()
			await this.fetchEntries()
			this.loading = false
		},
		async fetchJourneys () {
			const { data: journeys, error } = await supabase
				.from('journeys')
				.select('*')
			if (error) console.error(error)
			this.journeys = journeys
		},
		async fetchEntries () {
			const { data: entries, error } = await supabase
				.from('entries')
				.select('*')
				.eq('journey_id', this.activeJourney?.id)
			if (error) console.error(error)
			this.entries = entries
		},
		async startJourney (journey) {
			const { data, error } = await supabase
				.from('journeys')
				.insert({
					journey
				})
				.select()
			if (error) return console.error(error)
			this.journeys.push(data[0])
			await this.fetchEntries()
		},
		async abortActiveJourney () {
			const { data, error } = await supabase
				.from('journeys')
				.update({
					finished_at: new Date()
				})
				.eq('id', this.activeJourney.id)
				.select()
			if (error) return console.error(error)
			this.activeJourney.finished_at = data[0].finished_at
			this.journeys = []
		},
		async createEntry (entry) {
			const { data, error } = await supabase
				.from('entries')
				.insert({
					...entry,
					journey_id: this.activeJourney.id
				})
				.select()
			if (error) return console.error(error)
			this.entries.push(data[0])
		},
		async updateEntry (entry) {
			const { data, error } = await supabase
				.from('entries')
				.update(entry)
				.eq('id', entry.id)
				.select()
			if (error) return console.error(error)
			const index = this.entries.findIndex(e => e.id === entry.id)
			this.entries[index] = data[0]
		},
		async deleteEntry (entry) {
			const { error } = await supabase
				.from('entries')
				.delete()
				.eq('id', entry.id)
			if (error) return console.error(error)
			const index = this.entries.findIndex(e => e.id === entry.id)
			this.entries.splice(index, 1)
		}
	}
})

export default store
