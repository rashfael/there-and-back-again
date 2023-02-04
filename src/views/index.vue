<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import store from '~/store'
import Map from '~/components/Map.vue'

const router = useRouter()
const route = useRoute()

const {
	user,
	activeJourney: journey
} = $(store)

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
	Map(:journey="journey", :user="user")
	.sidebar
		form.add-entry(v-if="showingAddEntryForm", @submit.prevent="createEntry")
			bunt-input(v-model="newEntry.distance", name="distance", label="Distance", type="number", hint="in meters")
			bunt-input(v-model="newEntry.date", name="date", label="Date", type="datetime-local", placeholder=" ")
			bunt-select(v-model="newEntry.mode", name="mode", label="Mode", :options="['walk', 'ride', 'run', 'swim', 'horse']")
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
			flex: none
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
