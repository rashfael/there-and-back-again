<script setup>
import Prompt from '~/components/Prompt.vue'
import store from '~/store'
const emit = defineEmits(['close'])

async function abort () {
	await store.abortActiveJourney()
	emit('close')
}
</script>
<template lang="pug">
Prompt.c-cancel-journey-prompt(@close="emit('close')")
	.content
		h2 Abort your journey and start a new one?
		.actions
			bunt-button#btn-continue(@click="emit('close')") Continue journey
			bunt-button#btn-cancel-journey(@click="abort") Abort journey
</template>
<style lang="stylus">
.c-cancel-journey-prompt
	.content
		padding: 0 16px 16px
	.actions
		display: flex
		justify-content: flex-end
		gap: 16px
		#btn-continue
			button-style()
		#btn-cancel-journey
			button-style(color: $clr-danger)
</style>
