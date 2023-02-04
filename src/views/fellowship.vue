<script setup>
// TODO
// cancel request
import { useRoute, useRouter } from 'vue-router'
import store from '~/store'

const route = useRoute()
const router = useRouter()
const {
	user,
	friends,
	friendRequests
} = $(store)

const inviteUrl = $computed(() => {
	return `https://there-and-back-again.rash.codes/fellowship?request-user=${user?.id}`
})

function getFriendState (friend) {
	if (friendRequests.find(request => request.from_id === friend.id && request.accepted === false)) {
		return 'incoming'
	}
	if (friendRequests.find(request => request.to_id === friend.id && request.accepted === false)) {
		return 'outgoing'
	}
	return 'accepted'
}

;(async function () {
	if (route.query['request-user']) {
		try {
			await store.sendFellowshipRequest(route.query['request-user'])
		} catch (e) {
			console.error(e)
		} finally {
			router.replace({ query: {} })
		}
	}
})()
</script>
<template lang="pug">
.c-fellowship
	.invite {{ inviteUrl }}
	.friends(v-scrollbar.y="")
		router-link.friend(v-for="friend in friends", :key="friend.id", :to="{name: 'friend', params: {friendId: friend.id}}")
			.info
				img.avatar(:src="friend.avatar_url")
				.username {{ friend.username }}
			.actions(v-if="getFriendState(friend) === 'outgoing'")
				.awaiting-approval awaiting approval
				bunt-button#btn-reject-request(@click="store.deleteFellowshipRequest(friend)") cancel
			.actions(v-if="getFriendState(friend) === 'incoming'")
				bunt-button#btn-reject-request(@click="store.deleteFellowshipRequest(friend)") reject
				bunt-button#btn-accept-request(@click="store.acceptFellowshipRequest(friend)") accept
</template>
<style lang="stylus">
.c-fellowship
	display: flex
	flex-direction: column
	min-height: 0
	.invite
		border-bottom: border-separator()
	.friends
		display: flex
		flex-direction: column
		.friend
			display: flex
			justify-content: space-between
			align-items: center
			padding: 0 8px
			height: 56px
			border-bottom: border-separator()
			.info
				display: flex
				align-items: center
				gap: 16px
			img
				height: 48px
				width: @height
				border-radius: 50%
			.actions
				display: flex
				align-items: center
				gap: 8px
				#btn-reject-request
					button-style(color: $clr-danger)
				#btn-accept-request
					button-style(color: $clr-success)
</style>
