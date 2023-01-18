<!-- eslint-disable vue/no-setup-props-destructure -->
<script setup>
// import { Scrollbars } from 'buntpapier/src/directives/scrollbar'
// allowCancel: {
// 			type: Boolean,
// 			default: true
// 		},
// 		scrollable: {
// 			type: Boolean,
// 			default: true
// 		}
const {
	allowCancel
} = defineProps({
	allowCancel: {
		type: Boolean,
		default: true
	}
})
const emit = defineEmits(['close'])

const el = $ref(null)

function onPointerdown (event) {
	if (!this.allowCancel) return
	event.stopPropagation()
	el.addEventListener('pointerup', onPointerup)
}
function onPointerup (event) {
	el.removeEventListener('pointerup', onPointerup)
	if (event.target !== el) return
	emit('close')
}
</script>
<template lang="pug">
.c-prompt(ref="el", @pointerdown="onPointerdown")
	.prompt-wrapper(ref="wrapper", @pointerdown.stop="")
		bunt-icon-button#btn-close(v-if="allowCancel", @click="$emit('close')") close
		slot.content
</template>
<style lang="stylus">
.c-prompt
	position: fixed
	top: 0
	left: 0
	width: 100vw
	height: 100vh
	z-index: 1000
	background-color: $clr-secondary-text-light
	display: flex
	justify-content: center
	align-items: center
	.prompt-wrapper
		card()
		display: flex
		flex-direction: column
		width: 480px
		max-height: 80vh
		position: relative
		// +below('m')
		// 	width: 100vw
		// 	max-height: 95vh
		#btn-close
			icon-button-style(style: clear)
			position: absolute
			top: 8px
			right: 8px
			z-index: 10
.prompt-enter-active, .prompt-leave-active
	transition: opacity .3s
.prompt-enter, .prompt-leave-to
	opacity: 0
</style>
