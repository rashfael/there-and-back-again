<script setup>
import store from '~/store'

const {
	loading
} = $(store)

store.loadData()
</script>
<template lang="pug">
bunt-progress-circular(v-if="loading", size="huge", :page="true")
router-view(v-else)
</template>
<style lang="stylus">
#app
	display: flex
</style>
