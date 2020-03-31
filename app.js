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
	loadMaterial(id) {
	}
	unloadMaterial(id) {
	}
}