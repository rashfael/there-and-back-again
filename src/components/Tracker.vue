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

let pathEls = $ref([])

// TODO recompute on resize

let userPosition = $computed(() => {
	if (pathEls.length === 0) return
	for (const [index, path] of paths.entries()) {
		if (path.travelledDistance === path.totalDistance) continue
		const pathEl = pathEls[index]
		const travelledDistance = pathEl.getTotalLength() * path.travelledDistance / path.totalDistance
		return pathEl.getPointAtLength(travelledDistance)
	}
})

let userPinStyle = $computed(() => {
	if (!userPosition) return
	return {
		'--user-x': userPosition.x,
		'--user-y': userPosition.y
	}
})

let zoomLevel = $ref(1)
let panPosition = $ref({ x: 0, y: 0 })

let mapEl = $ref(null)

let mapStyle = $computed(() => {
	return {
		'--map-height': journey.paths_viewbox.height,
		'--map-width': journey.paths_viewbox.width,
		'--zoom': zoomLevel,
		'--pan-x': panPosition.x,
		'--pan-y': panPosition.y
	}
})

function onMapWheel (event) {
	zoomLevel = Math.max(1, zoomLevel - event.deltaY / 1000)
}

function onMapPointerDown (event) {
	event.preventDefault()
	// capture pointer and move map
	mapEl.setPointerCapture(event.pointerId)
	let lastPosition = {
		x: event.clientX,
		y: event.clientY
	}
	function onPointerMove (event) {
		event.preventDefault()
		panPosition = {
			x: panPosition.x + (event.clientX - lastPosition.x),
			y: panPosition.y + (event.clientY - lastPosition.y)
		}
		lastPosition = {
			x: event.clientX,
			y: event.clientY
		}
	}
	function onPointerUp (event) {
		// mapEl.releasePointerCapture(event.pointerId)
		mapEl.removeEventListener('pointermove', onPointerMove)
		mapEl.removeEventListener('pointerup', onPointerUp)
	}
	mapEl.addEventListener('pointermove', onPointerMove)
	mapEl.addEventListener('pointerup', onPointerUp)
}

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
	.map(ref="mapEl", :style="mapStyle", @wheel.passive="onMapWheel", @pointerdown="onMapPointerDown")
		img(src="~~/assets/middle-earth.svg")
		svg.paths(v-if="journey", :viewBox="`${journey.paths_viewbox.x} ${journey.paths_viewbox.y} ${journey.paths_viewbox.width} ${journey.paths_viewbox.height}`")
			path.remaining(v-for="path in paths", ref="pathEls", :d="path.d")
			template(v-for="path in paths")
				path(v-if="path.travelledDistance > 0", :d="path.d",:style="path.style", pathLength="1")
		.user-pin(v-if="journey", :style="userPinStyle")
			img(:src="user.profile.avatar_url")
	.sidebar
		form.add-entry(v-if="showingAddEntryForm", @submit.prevent="createEntry")
			bunt-input(v-model="newEntry.distance", name="distance", label="Distance", type="number", hint="in meters")
			bunt-input(v-model="newEntry.date", name="date", label="Date", type="datetime-local", placeholder=" ")
			bunt-select(v-model="newEntry.mode", name="mode", label="Mode", :options="['walk', 'ride']")
			bunt-input(v-model="newEntry.comment", name="comment", label="Comment")
			bunt-button#btn-create-entry(type="submit") Create Entry
		template(v-else)
			bunt-tabs(v-model="activeTab")
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
	min-width: 0
	min-height: 0
	.map
		flex: auto
		display: flex
		position: relative
		overflow: hidden
		> img
			height: calc(var(--map-height) * 1px)
			width: calc(var(--map-width) * 1px)
			transform: translate(calc(var(--pan-x) * 1px), calc(var(--pan-y) * 1px)) scale(var(--zoom))
			transform-origin: top left
			filter: saturate(0.5) opacity(0.85)
		svg.paths
			position: absolute
			top: 0
			left: 0
			height: calc(var(--map-height) * 1px)
			width: calc(var(--map-width) * 1px)
			path
				stroke: $clr-success
				stroke-width: 4px
				fill: none
				vector-effect: non-scaling-stroke
				// HACK multiply by zoom or non-scaling-stroke won't work
				stroke-dasharray: calc(var(--travelled-distance-ratio) * var(--zoom)) 999999
				transform: translate(calc(var(--pan-x) * 1px), calc(var(--pan-y) * 1px)) scale(var(--zoom))
				transform-origin: top left
				&.remaining
					stroke: $clr-green-a700
					stroke-dasharray: 16 6
		.user-pin
			position: absolute
			left: calc(var(--user-x) * var(--zoom) * 1px + var(--pan-x) * 1px - 12px)
			top: calc(var(--user-y) * var(--zoom) * 1px + var(--pan-y) * 1px - 24px)
			background-color: $clr-success
			height: 24px
			width: 24px
			border-radius: 50% 50% 50% 0
			padding: 3px
			transform: rotate(-45deg)
			img
				height: 100%
				width: @height
				border-radius: 50%
				transform: rotate(45deg)

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
