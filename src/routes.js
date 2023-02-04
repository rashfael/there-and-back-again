const routes = [{
	path: '/',
	component: () => import('~/views/index.vue'),
	children: [{
		name: 'journey',
		path: '',
		component: () => import('~/views/journey.vue')
	}, {
		name: 'log',
		path: 'log',
		component: () => import('~/views/log.vue')
	}, {
		name: 'fellowship',
		path: 'fellowship',
		component: () => import('~/views/fellowship.vue'),
	}]
}, {
	name: 'profile',
	path: '/profile',
	component: () => import('~/views/profile.vue'),
}]

export default routes
