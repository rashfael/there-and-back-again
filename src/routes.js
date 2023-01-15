const routes = [{
	path: '/',
	component: () => import('~/components/Tracker.vue'),
}, {
	path: '/profile',
	component: () => import('~/components/Profile.vue'),
}]

export default routes
