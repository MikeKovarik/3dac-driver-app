importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

console.log('service worker installed')

workbox.setConfig({debug: false})

workbox.routing.registerRoute(
	/\.(?:png|gif|jpg|jpeg|webp|svg|woff2)$/,
	new workbox.strategies.CacheFirst({
		cacheName: '3dac-images',
	})
)

workbox.routing.registerRoute(
	/\.(?:js|mjs|css)$/,
	new workbox.strategies.NetworkFirst({
		cacheName: '3dac-scripts',
	})
)