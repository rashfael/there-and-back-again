<!-- eslint-disable vue/no-setup-props-destructure -->
<script setup>
import { watchEffect } from 'vue'
import mapSvg from '~/assets/middle-earth.svg?raw'

const PATHS_VIEWBOX = {
	x: 0,
	y: 0,
	height: 2400,
	width: 3200
}

const {
	journey,
	user
} = defineProps({
	journey: Object,
	user: Object
})

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
		} else if (currentPath) {
			currentPath.totalDistance += leg.distance
			currentPath.travelledDistance += leg.distance - leg.remainingDistance
		}
	}
	return paths
})

let pathEls = $ref([])

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

let zoomLevel = $ref(2)
let panPosition = $ref({ x: 0, y: 0 })

let mapEl = $ref(null)

let mapStyle = $computed(() => {
	return {
		'--map-height': PATHS_VIEWBOX.height,
		'--map-width': PATHS_VIEWBOX.width,
		'--zoom': zoomLevel,
		'--pan-x': panPosition.x,
		'--pan-y': panPosition.y
	}
})

let mapDimensions = $ref(null)

function onMapResize ([entry]) {
	mapDimensions = {
		height: entry.contentRect.height,
		width: entry.contentRect.width
	}
}

function onMapWheel (event) {
	// zoom on mouse position
	const zoomDelta = -1 * event.deltaY / 1000
	const zoomRatio = 1 - (zoomLevel + zoomDelta) / zoomLevel
	panPosition = {
		x: panPosition.x + (event.offsetX - panPosition.x) * zoomRatio,
		y: panPosition.y + (event.offsetY - panPosition.y) * zoomRatio
	}
	zoomLevel = Math.max(0.1, zoomLevel + zoomDelta)
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
		mapEl.removeEventListener('pointermove', onPointerMove)
		mapEl.removeEventListener('pointerup', onPointerUp)
	}
	mapEl.addEventListener('pointermove', onPointerMove)
	mapEl.addEventListener('pointerup', onPointerUp)
}

function centerPin () {
	// TODO does not work on !1 zoom
	panPosition = {
		x: mapDimensions.width / 2 - userPosition.x * zoomLevel,
		y: mapDimensions.height / 2 - userPosition.y * zoomLevel
	}
}

const stopCentering = watchEffect(() => {
	if (!userPosition || !mapDimensions) return
	centerPin()
	stopCentering()
})

</script>
<template lang="pug">
.c-map(ref="mapEl", :style="mapStyle", v-resize-observer="onMapResize", @wheel.passive="onMapWheel", @pointerdown="onMapPointerDown")
	.svg(v-html="mapSvg")
	svg.paths(v-if="journey", :viewBox="`${PATHS_VIEWBOX.x} ${PATHS_VIEWBOX.y} ${PATHS_VIEWBOX.width} ${PATHS_VIEWBOX.height}`")
		path.remaining(v-for="path in paths", ref="pathEls", :d="path.d")
		template(v-for="path in paths")
			path(v-if="path.travelledDistance > 0", :d="path.d",:style="path.style", pathLength="1")
	.user-pin(v-if="journey", :style="userPinStyle")
		img(:src="user.avatar_url || user.profile.avatar_url")
</template>
<style lang="stylus">
.c-map
	flex: auto
	display: flex
	position: relative
	overflow: hidden
	> .svg svg
		height: calc(var(--map-height) * 1px)
		width: calc(var(--map-width) * 1px)
		transform: translate(calc(var(--pan-x) * 1px), calc(var(--pan-y) * 1px)) scale(var(--zoom))
		transform-origin: top left
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
			stroke-dasharray: calc(var(--travelled-distance-ratio) * var(--zoom) * 1px) 999999
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
</style>
