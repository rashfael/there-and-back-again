<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import store from '~/store'

const router = useRouter()
const route = useRoute()

const {
	user,
	activeJourney: journey
} = $(store)

const paths = $computed(() => {
	if (!journey) return
	const paths = []
	let currentPath
	for (const [index, leg] of journey.legs.entries()) {
		if (currentPath && (leg.path || index === journey.legs.length - 1)) {
			if (currentPath.travelledDistance > 0 && currentPath.travelledDistance < currentPath.totalDistance) {
				currentPath.style = {
					'--travelled-distance-ratio': currentPath.travelledDistance / currentPath.totalDistance
				}
			}
		}
		if (leg.path) {
			currentPath = {
				d: leg.path,
				totalDistance: 0,
				travelledDistance: 0
			}
			paths.push(currentPath)
		} else {
			currentPath.totalDistance += leg.distance
			currentPath.travelledDistance += leg.distance - leg.remainingDistance
		}
	}
	return paths
})

let showingAddEntryForm = $ref(false)
let activeTab = $ref(route.name)

let newEntry = $ref(null)

function showAddEntryForm () {
	showingAddEntryForm = true
	newEntry = {
		date: moment().format('YYYY-MM-DDTHH:mm'),
		distance: 0,
		mode: 'walk',
		comment: ''
	}
}

async function createEntry () {
	await store.createEntry({
		...newEntry,
		date: moment(newEntry.date).toISOString()
	})
	showingAddEntryForm = false
}

watch(() => activeTab, () => {
	router.push({ name: activeTab })
})

</script>
<template lang="pug">
.c-tracker
	.map
		img(src="~~/assets/middle-earth.svg")
		svg.paths(v-if="journey", :viewBox="journey.paths_viewbox")
			path.remaining(v-for="path in paths", :d="path.d")
			template(v-for="path in paths")
				path(v-if="path.travelledDistance > 0", :d="path.d",:style="path.style", pathLength="1")
	.sidebar
		form.add-entry(v-if="showingAddEntryForm", @submit.prevent="createEntry")
			bunt-input(v-model="newEntry.distance", name="distance", label="Distance", type="number", hint="in meters")
			bunt-input(v-model="newEntry.date", name="date", label="Date", type="datetime-local", placeholder=" ")
			bunt-select(v-model="newEntry.mode", name="mode", label="Mode", :options="['walk', 'bike', 'horse']")
			bunt-input(v-model="newEntry.comment", name="comment", label="Comment")
			bunt-button#btn-create-entry(type="submit") Create Entry
		bunt-tabs(v-else, v-model="activeTab")
			bunt-tab(id="journey", header="journey")
			bunt-tab(id="log", header="log")
			bunt-tab(id="fellowship", header="fellowship")
		router-view
		bunt-icon-button#btn-add-entry(v-if="activeTab !== 'fellowship'", @click="showAddEntryForm") plus
	router-link.profile-link(:to="{ name: 'profile' }")
		img(:src="user.profile.avatar_url")
#bunt-teleport-target
</template>
<style lang="stylus">
.c-tracker
	flex: auto
	display: flex
	.map
		flex: auto
		display: flex
		justify-content: center
		position: relative
		svg.paths
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			path
				stroke: $clr-success
				stroke-width: 8px
				fill: none
				stroke-dasharray: var(--travelled-distance-ratio) 1
				&.remaining
					stroke: $clr-danger
					stroke-dasharray: 10 16

	form.add-entry
		display: flex
		flex-direction: column
		padding: 16px

		#btn-create-entry
			button-style(color: $clr-primary)

	.sidebar
		card()
		flex: none
		width: 480px
		display: flex
		flex-direction: column
		.bunt-tabs
			display: flex
			flex-direction: column
			tabs-style()
			min-height: 0
			margin: 0
			.bunt-tabs-body
				display: flex
				flex-direction: column
				min-height: 0

		#btn-add-entry
			position: fixed
			right: 16px
			bottom: 16px
			icon-button-style(style: flat, color: $clr-white)
			background-color: $clr-primary
			height: 48px
			width: @height
			align-self: flex-end
			.mdi
				font-size: 32px
	.profile-link
		position: fixed
		top: 16px
		left: 16px
		img
			height: 72px
			width: @height
			border-radius: 50%
</style>
