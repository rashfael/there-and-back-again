<script setup>
import store from '~/store'
import moment from 'moment'

const MODE_ICON_MAP = {
	walk: 'walk',
	run: 'run',
	ride: 'bike',
	horse: 'horse-human'
}

const {
	entries
} = $(store)

</script>
<template lang="pug">
.c-log
	.log-entries(v-scrollbar.y="")
		.entry(v-for="(entry, index) of entries", :class="{ last: index === entries.length - 1 }")
			.date {{ moment(entry.date).format('MM.DD. HH:mm') }}
			.distance
				i.mdi(:class="`mdi-${MODE_ICON_MAP[entry.mode]}`")
				span {{ entry.distance }}m
			.actions
				bunt-icon-button#btn-edit-entry(@click="editEntry(entry)") pencil
				bunt-icon-button#btn-delete-entry(v-if="index === entries.length - 1", @click="store.deleteEntry(entry)") delete-outline
</template>
<style lang="stylus">
.c-log
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
</style>
