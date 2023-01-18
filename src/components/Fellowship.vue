<script setup>
import store from '~/store'

const { user } = $(store)

const inviteUrl = $computed(() => {
	return `https://there-and-back-again.rash.codes/join/${user?.id}`
})
</script>
<template lang="pug">
.c-fellowship
	.invite {{ inviteUrl }}
</template>
<style lang="stylus">
</style>
