import decorate from '../node_modules/decorate/index.js'
import {computedFrom} from '../node_modules/aurelia-script/dist/aurelia.esm.js'
import {computedFromList} from './computedFromList.js'

/*
export function get(url) {
	url = formUrl(url)
	return fetch(url).then(res => res.text()).then(tryParse)
}

export function post(url, data) {
	url = formUrl(url)
	let options = {
		method: 'POST',
		cache: 'no-cache',
	}
	if (typeof data === 'object') {
		options.headers = {
			'Content-Type': 'application/json'
		}
		options.body = JSON.stringify(data)
	} else {
		options.body = data
	}
	return fetch(url, options).then(res => res.text()).then(tryParse)
}
*/

export var groupedData = []
export var linearData = []

class GroupedTask {
	constructor(items) {
		this.from      = reshapeLocation(items[0].from)
		this.to        = reshapeLocation(items[0].to)
		this.materials = items.map(item => new MaterialTask(item))
	}
	async accept() {
		await Promise.all(this.materials.map(m => m.accept()))
	}
	async reject() {
		await Promise.all(this.materials.map(m => m.reject()))
	}
	async load() {
		await Promise.all(this.materials.map(m => m.load()))
	}
	async deliver() {
		await Promise.all(this.materials.map(m => m.deliver()))
	}
	get acceptedCount() {
		return this.materials.filter(item => item.accepted).length
	}
	get loadedCount() {
		return this.materials.filter(item => item.loaded).length
	}
	get deliveredCount() {
		return this.materials.filter(item => item.delivered).length
	}
	get accepted() {
		return this.acceptedCount === this.materials.length
	}
	get loaded() {
		return this.loadedCount === this.materials.length
	}
	get delivered() {
		return this.deliveredCount === this.materials.length
	}
	get state() {
		let allCount = this.materials.length
		if (this.delivered)
			return 'doručeno'
        else if (!this.accepted)
			return 'volné'
        else if (this.loadedCount === 0)
			return 'nenaloženo'
		else if (this.loadedCount === allCount && allCount === 1)
			return 'naloženo'
		else if (this.loadedCount === allCount)
			return 'na cestě'
		else if (this.deliveredCount > 0 && this.deliveredCount < allCount)
			return `doručeno ${this.deliveredCount} z ${allCount}`
		else if (this.loadedCount < allCount && this.deliveredCount === 0)
			return `naloženo ${this.loadedCount} z ${allCount}`
		else
			return '???'
	}
	get icon() {
		let allCount = this.materials.length
		if (this.delivered) return 'check'
		if (!this.accepted) return 'note_add'
		if (this.loadedCount === allCount) return 'local_shipping'
		return 'hourglass_empty'
	}
	get color() {
		if (this.delivered) return 'green'
		if (this.accepted) return 'orange'
	}
}

decorate(GroupedTask, 'acceptedCount',  computedFromList('materials[*].accepted'))
decorate(GroupedTask, 'loadedCount',    computedFromList('materials[*].loaded'))
decorate(GroupedTask, 'deliveredCount', computedFromList('materials[*].delivered'))
decorate(GroupedTask, 'accepted',  computedFrom('acceptedCount'))
decorate(GroupedTask, 'loaded',    computedFrom('loadedCount'))
decorate(GroupedTask, 'delivered', computedFrom('deliveredCount'))
decorate(GroupedTask, 'icon',   computedFrom('loadedCount', 'delivered'))
decorate(GroupedTask, 'icon',   computedFrom('loadedCount', 'delivered'))
decorate(GroupedTask, 'color',  computedFrom('loadedCount', 'delivered'))


class MaterialTask {
	constructor(item) {
		this.id     = item.transportId
		this.name   = item.materialName
		this.amount = item.materialAmount
		this.loaded = item.loaded
		this.delivered = false
	}
	async accept() {
		console.log('accept', this.id, this.name, this.amount)
		this.accepted = true
		this.loaded = false
		this.delivered = false
	}
	async reject() {
		console.log('reject', this.id, this.name, this.amount)
		this.accepted = false
		this.loaded = false
		this.delivered = false
	}
	async load() {
		console.log('load', this.id, this.name, this.amount)
		this.loaded = true
		this.delivered = false
	}
	async deliver() {
		console.log('deliver', this.id, this.name, this.amount)
		this.loaded = false
		this.delivered = true
	}
	get state() {
		// todo: pokracovani priste
	}
}

function groupBy(arr, hashFunction) {
	let map = new Map
	for (let item of arr) {
		let hash = hashFunction(item)
		if (!map.has(hash)) map.set(hash, [])
		let group = map.get(hash)
		group.push(item)
	}
	return Array.from(map.values())
}

function hashItem(item) {
	return `${item.from.id}-${item.to.id}`
}

function reshapeLocation(location) {
	location.lat = location.gpsLat
	location.lng = location.gpsLng
	delete location.gpsLat
	delete location.gpsLng
	return location
}

function processBackendList(data) {
	return groupBy(data, hashItem).map(items =>new GroupedTask(items))
}

function applyNewData(backendDemoData) {
	// reset
	groupedData.length = 0
	linearData.length = 0
	// insert data into existing array (instead of replacing it)
	groupedData.push(...processBackendList(backendDemoData))
	linearData.push(...groupedData.map(group => group.materials).flat())
}


var backendDemoData = [
	{
		"transportId":6,
		"from":{
			"id":6,
			"name":"Centrála Brno",
			"phone":"773641115",
			"address":"Purkyňova 127",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"to":{
			"id":2,
			"name":"Centrála Praha",
			"phone":"773641115",
			"address":"Přažácká 123",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"materialName":"Štít - Kit",
		"materialAmount":20,
		"loaded":false
	}, {
		"transportId":6,
		"from":{
			"id":2,
			"name":"Centrála Praha",
			"phone":"773641115",
			"address":"Přažácká 123",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"to":{
			"id":1,
			"name":"Centrála Pardubice",
			"phone":"775739914",
			"address":"Sladkovského 1554, Pardubice",
			"gpsLat":50.0374241,
			"gpsLng":15.7729004
		},
		"materialName":"Štít - Kit",
		"materialAmount":20,
		"loaded":false
	}, {
		"transportId":7,
		"from":{
			"id":6,
			"name":"Centrála Brno",
			"phone":"773641115",
			"address":"Purkyňova 127",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"to":{
			"id":1,
			"name":"Centrála Pardubice",
			"phone":"775739914",
			"address":"Sladkovského 1554, Pardubice",
			"gpsLat":50.0374241,
			"gpsLng":15.7729004
		},
		"materialName":"Štít - Kit",
		"materialAmount":20,
		"loaded":false
	}, {
		"transportId":8,
		"from":{
			"id":6,
			"name":"Centrála Brno",
			"phone":"773641115",
			"address":"Purkyňova 127",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"to":{
			"id":1,
			"name":"Centrála Pardubice",
			"phone":"775739914",
			"address":"Sladkovského 1554, Pardubice",
			"gpsLat":50.0374241,
			"gpsLng":15.7729004
		},
		"materialName":"Gumičky",
		"materialAmount":16,
		"loaded":false
	}, {
		"transportId":9,
		"from":{
			"id":1,
			"name":"Centrála Pardubice",
			"phone":"775739914",
			"address":"Sladkovského 1554, Pardubice",
			"gpsLat":50.0374241,
			"gpsLng":15.7729004
		},
		"to":{
			"id":6,
			"name":"Centrála Brno",
			"phone":"773641115",
			"address":"Purkyňova 127",
			"gpsLat":49.2332871,
			"gpsLng":16.5727529
		},
		"materialName":"Nějaká věc",
		"materialAmount":7,
		"loaded":false
	}
]

applyNewData(backendDemoData)