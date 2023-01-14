<script setup>
import moment from 'moment'
import store from '~/store'

import journeyData from '../data/data.json'

const MODE_ICON_MAP = {
	walk: 'walk',
	bike: 'bike',
	horse: 'horse-human'
}

function miToKm (mi) {
	return mi * 1.609344
}

const {
	entries
} = $(store)

const travelledDistance = $computed(() => {
	return entries.reduce((sum, entry) => sum + entry.distance, 0)
})

const journey = $computed(() => {
	const journey = {
		...journeyData[0],
		legs: journeyData[0].legs.map(leg => ({
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
		console.log(remainingDistance, leg.distance, leg.remainingDistance)
		leg.show = true
	}
	journey.legs[0].show = true

	console.log(journey)
	return journey
})

let showingAddEntryForm = $ref(false)
let activeTab = $ref('journey')

let newEntry = $ref(null)

let activeLeg = $ref(null)

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

store.fetchEntries()
</script>
<template lang="pug">
.map
	img(src="~~/assets/middle-earth.svg")
.sidebar
	form.add-entry(v-if="showingAddEntryForm", @submit.prevent="createEntry")
		bunt-input(v-model="newEntry.distance", name="distance", label="Distance", type="number", hint="in meters")
		bunt-input(v-model="newEntry.date", name="date", label="Date", type="datetime-local", placeholder=" ")
		bunt-select(v-model="newEntry.mode", name="mode", label="Mode", :options="['walk', 'bike', 'horse']")
		bunt-input(v-model="newEntry.comment", name="comment", label="Comment")
		bunt-button#btn-create-entry(type="submit") Create Entry
	bunt-tabs(v-else, :active-tab="activeTab")
		bunt-tab(id="journey", header="journey")
			.journey
				h3.name {{ journey.name }}
				.description {{ journey.description }}
			.journey-legs
				template(v-for="(leg, index) of journey.legs")
					.journey-leg(v-if="leg.show", :class="{start: index === 0, end: index === journey.legs.length - 1, reached: leg.remainingDistance === 0}")
						svg.waypoint(viewBox="0 0 1 1")
							path(v-if="index !== 0", d="M 0.5 -0.3 L 0.5 0.3")
							circle(cx="0.5", cy="0.5", r="0.2")
							path.partial(v-if="leg.remainingDistance > 0", :d="`M 0.5 -0.3 L 0.5 ${0.3 - leg.remainingDistance / leg.distance * 0.6}`")
						.text
							.directions {{ leg.directions }}
							.quote {{ leg.quote }}
						.distance {{ (leg.distance / 1000).toFixed(2) }}km
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
#bunt-teleport-target
</template>
<style lang="stylus">
#app
	display: flex
.map
	flex: auto
	display: flex
	justify-content: center

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
		tabs-style()
	.journey
		padding: 16px
		margin-bottom: 16px
		border-bottom: border-separator()
		.name
			margin: 0
	.journey-legs
		display: flex
		flex-direction: column
		.journey-leg
			// height: 56px
			display: flex
			align-items: flex-start
			padding: 0 16px 8px 0
			svg.waypoint
				pointer-events: none
				flex: none
				height: 200%
				width: 56px
				*
					vector-effect: non-scaling-stroke
				circle, path
					fill: none
					stroke-width: 3px
					stroke: $clr-green-800
			&:not(.reached)
				svg.waypoint
					circle, path:not(.partial)
						stroke-width: 2px
						stroke: $clr-disabled-text-light
						stroke-dasharray: 6
			.text
				flex: auto
				margin: 0 16px 0 0
				.quote
					margin-top: 4px
					color: $clr-secondary-text-light
					font-style: italic
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
		icon-button-style(style: flat, color: $clr-white)
		background-color: $clr-primary
		height: 48px
		width: @height
		align-self: flex-end
		margin: 16px
		.mdi
			font-size: 32px
</style>
