/*
Hodně těžce experimentální kód který ještě není součástí knihovny
*/
import FxComponent from './FxComponentV1.js'

// todo watch children tree, adding second node open the panel, removing node closes it
// todo. watch attributes. hidden on second element triggers hide animation

const EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'
const DURATION = 200

class FxExpansionCore extends FxComponent {

	static template = `
		<div id="header-wrapper">
			<slot name="header"></slot>
		</div>
		<div id="content-wrapper">
			<slot name="content"></slot>
		</div>
	`

	static style = `
		#content-wrapper {
			will-change: height, visibility;
		}
	`

	constructor() {
		super()
		this._header  = this.children[0]
		this._content = this.children[1]
		this._header.setAttribute('slot', 'header')
		this._content.setAttribute('slot', 'content')
		this.header  = this.shadowRoot.querySelector('#header-wrapper')
		this.content = this.shadowRoot.querySelector('#content-wrapper')
		this.content.style.overflow = 'hidden'
		this.hide(false)
	}

	connectedCallback() {
		this.header.addEventListener('click', this.toggle)
	}

	disconnectedCallback() {
		this.header.removeEventListener('click', this.toggle)
	}

	toggle = () => {
		if (this.collapsed)
			this.show()
		else
			this.hide()
	}

	watchChanges = ['margin', 'padding']

	async show(transition = true) {
		if (!this.collapsed) return
		this.collapsed = false
		if (transition) {
			var computed = window.getComputedStyle(this)
			var from = {}
			for (let key of this.watchChanges) from[key] = computed[key]
		}
		this.content.removeAttribute('hidden')
		this.setAttribute('expanded', '')
		this.removeAttribute('collapsed')
		if (transition) {
			var to = {}
			for (let key of this.watchChanges) to[key] = computed[key]
			let height = this.content.offsetHeight
			await Promise.all([
				this._animate(this, from, to),
				this._animate(this.content, {
					height: ['0px', `${height}px`],
				}),
			])
		}
	}

	async hide(transition = true) {
		if (this.collapsed) return
		this.collapsed = true
		if (transition) {
			var computed = window.getComputedStyle(this)
			var from = {}
			for (let key of this.watchChanges) from[key] = computed[key]
		}
		this.setAttribute('collapsed', '')
		this.removeAttribute('expanded')
		if (transition) {
			var to = {}
			for (let key of this.watchChanges) to[key] = computed[key]
			let height = this.content.offsetHeight
			await Promise.all([
				this._animate(this, from, to),
				this._animate(this.content, {
					height: [`${height}px`, '0px']
				})
			])
		}
		this.content.setAttribute('hidden', '')
	}

}

class FxExpansion extends FxExpansionCore {

	constructor() {
		super()
		// necessary to split selectors to two runs!
		this.chevron = this.querySelector('[icon*="chevron"]') || this.querySelector('i, icon')
		if (this.chevron) {
			this.chevron.style.transition = `${DURATION}ms transform ${EASING}`
			this.rotateChevron(90)
		}
	}

	rotateChevron(deg) {
		if (!this.chevron) return
		this.chevron.style.transform = `rotate(${deg}deg)`
	}

	show(...args) {
		this.rotateChevron(-90)
		super.show(...args)
	}

	hide(...args) {
		this.rotateChevron(90)
		super.hide(...args)
	}

}

customElements.define('fx-expansion', FxExpansion)