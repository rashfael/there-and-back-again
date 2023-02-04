<script setup>
import store from '~/store'

const {
	user
} = $(store)

let username = $ref(user.profile.username)

</script>
<template lang="pug">
.c-profile
	img.avatar(:src="user.profile.avatar_url")
	form(@submit.prevent="save")
		bunt-input(v-model="username", name="username", label="Username")
		bunt-button(type="submit") Save
	router-link.back(:to="'/'")
		.mdi.mdi-arrow-left
</template>
<style lang="stylus">
.c-profile
	flex: auto
	display: flex
	flex-direction: column
	align-items: center
	padding: 32px
	img.avatar
		width: 256px
		height: @height
		border-radius: 50%
	.back
		position: fixed
		top: 24px
		left: 24px
		.mdi
			font-size: 48px
</style>
