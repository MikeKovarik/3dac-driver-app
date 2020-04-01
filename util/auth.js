import decorate from '../node_modules/decorate/index.js'
import {computedFrom} from '../node_modules/aurelia-script/dist/aurelia.esm.js'
import * as api from './api.js'


class Auth {
	/*
	username = 1
	token = 'bb3a9'
	*/
	constructor() {
		this._username = this.username = localStorage['3dac-username']
		this._token    = this.token    = localStorage['3dac-token']
	}
	login(username, token) {
		this._username = this.username = localStorage['3dac-username'] = username
		this._token    = this.token    = localStorage['3dac-token']    = token
		api.fetchTasks()
	}
	logout() {
		this._username = this.username = localStorage['3dac-username'] = ''
		this._token    = this.token    = localStorage['3dac-token']    = ''
	}
	get loggedIn() {
		return this.username && this.token
	}
}

export default new Auth

decorate(Auth, 'loggedIn', computedFrom('username', 'token'))