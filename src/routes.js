const routes = [{
	path: '/',
	component: () => import('~/components/Tracker.vue'),
}, {
	name: 'profile',
	path: '/profile',
	component: () => import('~/components/Profile.vue'),
}]

export default routes
