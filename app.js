import * as api from './util/api.js'
//import './util/apiDemo.js'

// every 3 minutes
const refreshInterval = 1000 * 60 * 3

export class App {
	constructor() {
		api.fetchTasks().then(() => console.log('initial data', api.tasks))
		setInterval(() => {
			api.fetchTasks().then(() => console.log('periodical sync', api.tasks))
		}, refreshInterval)
		this.tasks = api.tasks
	}
	getNavLink(location, navigate = true) {
		let coord = `${location.gpsLat},${location.gpsLng}`
		let url = `https://www.google.com/maps/dir/?api=1&destination=${coord}`
		if (navigate) url += '&dir_action=navigate'
		return url
	}
	goTo(url) {
		let ua = navigator.userAgent.toLocaleLowerCase()
		if (ua.includes('android') || ua.includes('iphone'))
			location.href = url
		else
			window.open(url, '_blank')
	}
}