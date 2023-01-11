<script setup>
import moment from 'moment'
import store from '~/store'

const MODE_ICON_MAP = {
	walk: 'walk',
	bike: 'bike',
	horse: 'horse-human'
}

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

async function editEntry (entry) {
	
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
