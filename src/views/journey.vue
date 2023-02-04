<script setup>
import store from '~/store'
import { miToKm } from '~/lib/utils'
import Journey from '~/components/Journey.vue'
import journeyData from '../../data/data.json'

const {
	activeJourney: journey,
	travelledDistance
} = $(store)
</script>
<template lang="pug">
.v-journey
	.journey-chooser(v-if="!journey")
		h2 Choose a Journey
		.journeys(v-scrollbar.y="")
			.journey(v-for="journey of journeyData", @click="store.startJourney(journey.id)")
				.name {{ journey.name }}
				.length {{ Math.ceil(miToKm(journey.length_miles)) }} km
	Journey(v-else, :journey="journey", :travelledDistance="travelledDistance", :readonly="false")
</template>
<style lang="stylus">
.v-journey
	display: flex
	flex-direction: column
	min-height: 0
	.journey-chooser
		display: flex
		flex-direction: column
		min-height: 0
		h2
			text-align: center
		.journeys
			display: flex
			flex-direction: column
			.journey
				flex: none
				height: 48px
				font-size: 18px
				display: flex
				justify-content: space-between
				align-items: center
				padding: 0 16px
				cursor: pointer
				&:hover
					background-color: $clr-grey-100
</style>
