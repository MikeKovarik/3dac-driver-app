import * as api from './api.js'

export default new class {
	username = 1
	token = 'bb3a9'
	login(username, token) {
		this.username = username
		this.token = token
	}
	logout() {
		this.username = undefined
		this.token = undefined
	}
}