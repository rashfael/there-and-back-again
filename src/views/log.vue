<script setup>
import store from '~/store'
import moment from 'moment'
import Scrollbars from '~/components/Scrollbars.vue'

const MODE_ICON_MAP = {
	walk: 'walk',
	run: 'run',
	ride: 'bike',
	swim: 'swim',
	horse: 'horse-human'
}

const {
	entries
} = $(store)

</script>
<template lang="pug">
.c-log
	Scrollbars.log-entries-scroller(y)
		.log-entries
			.entry(v-for="(entry, index) of entries", :class="{ last: index === entries.length - 1 }")
				.date {{ moment(entry.date).format('DD.MM. HH:mm') }}
				.distance
					i.mdi(:class="`mdi-${MODE_ICON_MAP[entry.mode]}`")
					span {{ entry.distance }}m
				.actions
					bunt-icon-button#btn-edit-entry(@click="editEntry(entry)") pencil
					bunt-icon-button#btn-delete-entry(v-if="index === entries.length - 1", @click="store.deleteEntry(entry)") delete-outline
</template>
<style lang="stylus">
.c-log
	display: flex
	flex-direction: column
	min-height: 0
	.log-entries-scroller .scroll-content
		// make scrolling start at the bottom
		flex-direction: column-reverse
	.log-entries
		display: flex
		flex-direction: column
		padding-bottom: 64px
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
</style>
