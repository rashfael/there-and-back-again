<script setup>
import store from '~/store'
import { miToKm } from '~/lib/utils'
import Scrollbars from '~/components/Scrollbars.vue'
import AbortJourneyPrompt from '~/components/AbortJourneyPrompt.vue'

import journeyData from '../../data/data.json'

const {
	activeJourney: journey,
	travelledDistance
} = $(store)

let showingAbortJourneyPrompt = $ref(false)
</script>
<template lang="pug">
.c-journey
	.journey-chooser(v-if="!journey")
		h2 Choose a Journey
		.journeys(v-scrollbar.y="")
			.journey(v-for="journey of journeyData", @click="store.startJourney(journey.id)")
				.name {{ journey.name }}
				.length {{ Math.ceil(miToKm(journey.length_miles)) }} km
	.journey-tracker(v-else)
		.journey
			.text
				h3.name {{ journey.name }}
				.description {{ journey.description }}
			.da-container
				.actions
						bunt-icon-button#btn-abort-journey(@click="showingAbortJourneyPrompt = true") sign-direction-remove
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
	transition(name="prompt")
		AbortJourneyPrompt(v-if="showingAbortJourneyPrompt", @close="showingAbortJourneyPrompt = false")
</template>
<style lang="stylus">
.c-journey
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
	.journey-tracker
		display: flex
		flex-direction: column
		min-height: 0
		.journey
			flex: none
			padding: 16px
			border-bottom: border-separator()
			display: flex
			justify-content: space-between
			.name
				margin: 0
			.da-container
				margin-top: -7px
				display: flex
				flex-direction: column
				gap: 4px
				.actions
					display: flex
					justify-content: flex-end
				#btn-abort-journey
					icon-button-style(style: clear)
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
							height: calc((1 - var(--remaining)) * (100% - 26px))
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
</style>
