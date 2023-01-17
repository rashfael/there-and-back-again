<script setup>
import moment from 'moment'
import store from '~/store'
import Scrollbars from '~/components/Scrollbars.vue'

import journeyData from '../../data/data.json'

const MODE_ICON_MAP = {
	walk: 'walk',
	bike: 'bike',
	horse: 'horse-human'
}

function miToKm (mi) {
	return mi * 1.609344
}

const {
	user,
	activeJourney,
	entries
} = $(store)

const travelledDistance = $computed(() => {
	return entries.reduce((sum, entry) => sum + entry.distance, 0)
})

const journey = $computed(() => {
	const activeJourneyId = activeJourney?.journey
	if (!activeJourneyId) return
	const activeJourneyData = journeyData.find(journey => journey.id === activeJourneyId)
	const journey = {
		...activeJourneyData,
		legs: activeJourneyData.legs.map(leg => ({
			...leg,
			distance: miToKm(leg.length_miles) * 1000
		}))
	}

	journey.totalDistance = journey.legs.reduce((sum, leg) => sum + leg.distance, 0)

	let remainingDistance = travelledDistance
	for (const [index, leg] of journey.legs.entries()) {
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
		} else {
			currentPath.totalDistance += leg.distance
			currentPath.travelledDistance += leg.distance - leg.remainingDistance
		}
	}
	return paths
})

let showingAddEntryForm = $ref(false)
let activeTab = $ref('journey')

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

async function editEntry (entry) {
	
}
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
		bunt-tabs(v-else, :active-tab="activeTab")
			bunt-tab(id="journey", header="journey")
				.journey-chooser(v-if="!journey")
					h2 Choose a Journey
					.journeys
						.journey(v-for="journey of journeyData", @click="store.startJourney(journey.id)")
							.name {{ journey.name }}
							.length {{ Math.ceil(miToKm(journey.length_miles)) }} km
				.journey-tracker(v-else)
					.journey
						.text
							h3.name {{ journey.name }}
							.description {{ journey.description }}
						.distances
							.travelled {{ (travelledDistance / 1000).toFixed(2) }} km
							span /
							.total {{ (journey.totalDistance / 1000).toFixed(2) }} km
					Scrollbars.journey-legs-scroller(y)
						.journey-legs
							template(v-for="(leg, index) of journey.legs")
								.journey-leg(v-if="leg.show", :class="{start: index === 0, end: index === journey.legs.length - 1, reached: leg.remainingDistance === 0}")
									.path-segment
										.waypoint
										template(v-if="journey.legs[index + 1].show")
											.path.partial(v-if="journey.legs[index + 1].remainingDistance > 0", :style="{'--remaining': journey.legs[index + 1].remainingDistance / journey.legs[index + 1].distance}")
											.path(:class="{ remaining: journey.legs[index + 1].remainingDistance > 0 }")
									.content
										.waypoint-info
											.directions {{ leg.directions }}
											.distance {{ (leg.distance / 1000).toFixed(2) }} km
										.quote(v-if="leg.remainingDistance === 0") {{ leg.quote }}
			bunt-tab(id="log", header="log")
				.log-entries(v-scrollbar.y="")
					.entry(v-for="(entry, index) of entries", :class="{ last: index === entries.length - 1 }")
						.date {{ moment(entry.date).format('MM.DD. HH:mm') }}
						.distance
							i.mdi(:class="`mdi-${MODE_ICON_MAP[entry.mode]}`")
							span {{ entry.distance }}m
						.actions
							bunt-icon-button#btn-edit-entry(@click="editEntry(entry)") pencil
							bunt-icon-button#btn-delete-entry(v-if="index === entries.length - 1", @click="store.deleteEntry(entry)") delete-outline
		bunt-icon-button#btn-add-entry(@click="showAddEntryForm") plus
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
		justify-content: space-between
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
		.journey-chooser
			display: flex
			flex-direction: column
			h2
				text-align: center
			.journeys
				display: flex
				flex-direction: column
				.journey
					height: 48px
					font-size: 18px
					display: flex
					justify-content: space-between
					align-items: center
					padding: 0 16px
					cursor: pointer
					&:hover
						background-color: $clr-grey-100
		.journey-tracker
			display: flex
			flex-direction: column
			min-height: 0
			.journey
				padding: 16px
				border-bottom: border-separator()
				display: flex
				justify-content: space-between
				.name
					margin: 0
				.distances
					display: flex
					align-items: center
					.travelled
						font-weight: bold
						margin-right: 4px
					.total
						margin-left: 4px
						color: $clr-gray-600
			.journey-legs-scroller .scroll-content
				// make scrolling start at the bottom
				flex-direction: column-reverse
			.journey-legs
				display: flex
				flex-direction: column
				.journey-leg
					// height: 56px
					display: flex
					align-items: flex-start
					padding: 0 16px 0 0
					&:first-child
						margin-top: 16px
					.path-segment
						flex: none
						display: flex
						flex-direction: column
						align-items: center
						width: 48px
						align-self: stretch
						.waypoint
							flex: none
							width: 18px
							height: @width
							border: 4px solid $clr-green-800
							border-radius: 50%
						.path
							flex: auto
							width: 4px
							background: $clr-green-800
							&.remaining
								width: 2px
								background: transparent
								background-image: repeating-linear-gradient(transparent, transparent 6px, $clr-disabled-text-light 6px, $clr-disabled-text-light 12px)
							&.partial
								flex: none
								height: calc(var(--remaining) * (100% - 26px))
					&:not(.reached)
						margin-bottom: 128px
						.waypoint
							width: 22px
							height: @width
							border: 2px dashed $clr-disabled-text-light
					.content
						flex: auto
						margin: 5.5px 0 4px 0
						.waypoint-info
							display: flex
							justify-content: space-between
							.directions
								font-weight: bold
							.distance
								margin-left: 8px
								white-space: nowrap
						.quote
							margin-top: 6px
							font-style: italic
							line-height: 1.3

		.log-entries
			display: flex
			flex-direction: column
			.entry
				display: flex
				align-items: center
				padding: 16px
				.distance
					flex: auto
					text-align: right
					.mdi
						padding-right: 4px
				.actions
					display: flex
					flex-wrap: nowrap
					margin-left: 8px
					width: 0
					overflow: hidden
					transition: width 0.2s ease-in-out
					.bunt-icon-button
						button-style(style: clear)
				&:hover
					.actions
						width: 36px
					&.last
						.actions
							width: 72px

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
