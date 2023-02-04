<!-- eslint-disable vue/no-setup-props-destructure -->
<script setup>
import { useRouter } from 'vue-router'
import store from '~/store'
import Map from '~/components/Map.vue'
import Journey from '~/components/Journey.vue'
const router = useRouter()

const {
	friendId
} = defineProps({
	friendId: String
})

const {
	friends
} = $(store)

const friend = $computed(() => friends.find(friend => friend.id === friendId))

</script>
<template lang="pug">
.v-friend
	Map(:journey="friend.activeJourney", :user="friend")
	.sidebar
		.profile
			img.avatar(:src="friend.avatar_url || friend.profile.avatar_url")
			.username {{ friend.username }}
		Journey(:journey="friend.activeJourney", :travelledDistance="friend.travelledDistance", :readonly="true")
	bunt-icon-button#btn-back(@click="router.push({name: 'fellowship'})") close
</template>
<style lang="stylus">
.v-friend
	flex: auto
	display: flex
	min-width: 0
	min-height: 0
	position: relative
	.sidebar
		card()
		flex: none
		width: 480px
		display: flex
		flex-direction: column
		.profile
			display: flex
			align-items: center
			gap: 32px
			padding: 16px
			.avatar
				width: 128px
				height: @width
				border-radius: 50%
			.username
				font-size: 32px
				font-weight: 600
	#btn-back
		position: absolute
		right: 8px
		top: 8px
		icon-button-style(style: clear)
		.mdi
			font-size: 24px
</style>
