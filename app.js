import {groupedData, linearData} from './util/api.js'


export class App {
	constructor() {
		this.tasks = groupedData

		this.tasks[1].materials[0].accepted = true
		this.tasks[1].materials[0].loaded = true

		this.tasks[2].materials[0].accepted = true
		this.tasks[2].materials[1].accepted = true
		this.tasks[2].materials[0].loaded = true

		this.tasks[3].materials[0].accepted = true
		//this.tasks[3].materials[0].loaded = true
		this.tasks[3].materials[0].delivered = true
	}
	getNavLink(location, navigate = true) {
		let coord = `${location.lat},${location.lng}`
		let url = `https://www.google.com/maps/dir/?api=1&destination=${coord}`
		if (navigate) url += '&dir_action=navigate'
		return url
	}
	goTo(url) {
		location.href = url
	}
}