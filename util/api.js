import decorate from '../node_modules/decorate/index.js'
import {computedFrom} from '../node_modules/aurelia-script/dist/aurelia.esm.js'
import {computedFromList} from './computedFromList.js'
import auth from './auth.js'

/*
/*
Všechny operace jsem přesunul pod GET a vyžadují parametry
"username" (nepřejmenovat na "userId"? Je to přesnější),
"token"
"operation".

Operation může mít následující hodnoty (není case sensitive):
* getAssigned - vrátí přiřazené převozy
* getFree - Vrátí volné převozy
* setLoaded - Vyžaduje parametr "transportId" - nastaví loaded = true
* setFinished - Vyžaduje parametr "transportId" - dokončí a skryje převoz.
* claim - Vyžaduje parametr "transportId" - Vezme převoz z getFree a přiřadí jej tomuto řidiči
* unclaim - Vyžaduje parametr "transportId" - Vezme převoz z getAssigned a uvolní jej. Nesmí být loaded = true (když už to máš v autě tak to odvézt musíš)
*/

/*
200 success
400 chyba v requestu
460 nedostatek materiálu na skladu (musí zjebat toho od koho to veze ať to tam zadá)
500 nějaký fail na mé straně
*/

export var tasks = []

//const apiEndpoint = 'http://homeworld.stepanekjakub.cz:8080/3dacis/public-transports'
const apiEndpoint = 'https://is.3dac.cz/3dacis/public-transports'

function getLink(operation, id) {
	let urlObject = new URL(apiEndpoint)
	urlObject.searchParams.append('username', auth.username)
	urlObject.searchParams.append('token', auth.token)
	urlObject.searchParams.append('operation', operation)
	if (id !== undefined) urlObject.searchParams.append('transportId', id)
	return urlObject.toString()
}

export async function get(operation, id) {
	let url = getLink(operation, id)
	let res = await fetch(url)
	let text = (await res.text()).trim()
	if (res.status === 400 || res.status === 500 || (text && !isJson(text))) {
		console.error(`Request failed`, url, res.status)
		let message = `Chyba: ${text}\n${operation}, id: ${id}, http status: ${res.status}`
		alert(message)
		let err = new Error(message)
		delete err.stack
		throw err
	} else if (text) {
		return JSON.parse(text)
	}
}


export async function fetchTasks() {
	let [claimed, free] = await Promise.all([get('getAssigned'), get('getFree')])
	claimed.forEach(item => item.claimed = true)
	free.forEach(item => item.claimed = false)
	let combined = [...claimed, ...free]
	applyTasksData(combined)
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

export function applyTasksData(data) {
	let grouped = groupBy(data, item => `${item.from.id}-${item.to.id}`)
	// reset and insert data into existing array (instead of replacing it)
	let instances = grouped.map(items => new GroupedTask(items))
	tasks.splice(0, tasks.length, ...instances)
}

function isJson(string) {
	return (string.startsWith('{') && string.endsWith('}'))
		|| (string.startsWith('[') && string.endsWith(']'))
}


class MaterialTask {
	constructor(item) {
		this.id     = item.transportId
		this.name   = item.materialName
		this.amount = item.materialAmount
		this.loaded = item.loaded
		this.claimed = item.claimed
		this.finished = false
	}
	async claim() {
		try {
			console.log('claiming', this.id, this.name, this.amount)
			await get('claim', this.id)
			console.log('claimed', this.id)
			this.claimed = true
			this.loaded = false
			this.finished = false
		} catch(err) {
			console.error('failed claiming', err)
			await fetchTasks()
		}
	}
	async unclaim() {
		try {
			console.log('unclaiming', this.id, this.name, this.amount)
			await get('unclaim', this.id)
			console.log('unclaimed', this.id)
			this.claimed = false
			this.loaded = false
			this.finished = false
		} catch(err) {
			console.error('failed unclaiming', err)
			await fetchTasks()
		}
	}
	async load() {
		try {
			console.log('loading', this.id, this.name, this.amount)
			await get('setLoaded', this.id)
			console.log('loaded', this.id)
			this.loaded = true
			this.finished = false
		} catch(err) {
			console.error('failed loading', err)
			await fetchTasks()
		}
	}
	async finish() {
		try {
			console.log('finishing', this.id, this.name, this.amount)
			await get('setFinished', this.id)
			console.log('finished', this.id)
			this.loaded = false
			this.finished = true
		} catch(err) {
			console.error('failed finishing', err)
			await fetchTasks()
		}
	}
	get state() {
		if (this.finished) return 'doručeno'
		if (this.loaded) return 'naloženo'
		if (this.claimed) return 'nenaloženo'
		return 'volné'
	}
}

decorate(MaterialTask, 'state', computedFrom('loaded', 'finished', 'claimed'))



class GroupedTask {
	constructor( items) {
		this.from      = items[0].from
		this.to        = items[0].to
		this.materials = items.map(item => new MaterialTask(item))
	}
	async claim() {
		await Promise.all(this.materials.map(m => m.claim()))
	}
	async unclaim() {
		await Promise.all(this.materials.map(m => m.unclaim()))
	}
	async load() {
		await Promise.all(this.materials.map(m => m.load()))
	}
	async finish() {
		await Promise.all(this.materials.map(m => m.finish()))
	}
	get acceptedCount() {
		return this.materials.filter(item => item.claimed).length
	}
	get loadedCount() {
		return this.materials.filter(item => item.loaded).length
	}
	get deliveredCount() {
		return this.materials.filter(item => item.finished).length
	}
	get claimed() {
		return this.acceptedCount === this.materials.length
	}
	get loaded() {
		return this.loadedCount === this.materials.length
	}
	get finished() {
		return this.deliveredCount === this.materials.length
	}
	get state() {
		let allCount = this.materials.length
		if (this.finished)
			return 'doručeno'
        else if (!this.claimed)
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
		if (this.finished) return 'check'
		if (!this.claimed) return 'note_add'
		if (this.loadedCount === allCount) return 'local_shipping'
		return 'hourglass_empty'
	}
	get color() {
		if (this.finished) return 'green'
		if (this.claimed) return 'orange'
	}
}

decorate(GroupedTask, 'acceptedCount',  computedFromList('materials[*].claimed'))
decorate(GroupedTask, 'loadedCount',    computedFromList('materials[*].loaded'))
decorate(GroupedTask, 'deliveredCount', computedFromList('materials[*].finished'))
decorate(GroupedTask, 'claimed',  computedFrom('acceptedCount'))
decorate(GroupedTask, 'loaded',    computedFrom('loadedCount'))
decorate(GroupedTask, 'finished', computedFrom('deliveredCount'))
decorate(GroupedTask, 'state', computedFrom('loadedCount', 'loaded', 'finished', 'claimed'))
decorate(GroupedTask, 'icon',  computedFrom('loadedCount', 'loaded', 'finished', 'claimed'))
decorate(GroupedTask, 'color', computedFrom('loadedCount', 'loaded', 'finished', 'claimed'))
