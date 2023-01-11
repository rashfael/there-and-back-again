<script setup>
import moment from 'moment'
import store from '~/store'

const {
	entries
} = $(store)

let showingAddEntryForm = $ref(false)

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

store.fetchEntries()
</script>
<template lang="pug">
.map
	img(src="~~/assets/middle-earth.svg")
.user-log
	form.add-entry(v-if="showingAddEntryForm", @submit.prevent="createEntry")
		bunt-input(v-model="newEntry.distance", name="distance", label="Distance", type="number", hint="in meters")
		bunt-input(v-model="newEntry.date", name="date", label="Date", type="datetime-local", placeholder=" ")
		bunt-select(v-model="newEntry.mode", name="mode", label="Mode", :options="['walk', 'bike', 'horse']")
		bunt-input(v-model="newEntry.comment", name="comment", label="Comment")
		bunt-button#btn-create-entry(type="submit") Create Entry
	template(v-else)
		.entries(v-scrollbar.y="")
			.entry(v-for="entry of entries")
				.date {{ moment(entry.date).format('MM.DD. HH:mm') }}
				.distance {{ entry.distance }}m
		bunt-icon-button#btn-add-entry(@click="showAddEntryForm") plus
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

.user-log
	card()
	flex: none
	width: 480px
	display: flex
	flex-direction: column
	justify-content: space-between
	.entries
		display: flex
		flex-direction: column
		.entry
			display: flex
			justify-content: space-between
			padding: 16px

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
