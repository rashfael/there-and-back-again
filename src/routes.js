const routes = [{
	path: '/',
	component: () => import('~/components/Tracker.vue'),
	children: [{
		name: 'journey',
		path: '',
		component: () => import('~/components/Journey.vue')
	}, {
		name: 'log',
		path: 'log',
		component: () => import('~/components/Log.vue')
	}, {
		name: 'fellowship',
		path: 'fellowship',
		component: () => import('~/components/Fellowship.vue')
	}]
}, {
	name: 'profile',
	path: '/profile',
	component: () => import('~/components/Profile.vue'),
}]

export default routes
