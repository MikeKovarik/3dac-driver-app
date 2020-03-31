import * as au from './node_modules/aurelia-script/dist/aurelia.esm.js'


export const aurelia = new au.Aurelia()
aurelia.loader.baseUrl = location.origin + location.pathname.slice(0, location.pathname.lastIndexOf('/'))

aurelia.use
	.standardConfiguration()
	.developmentLogging()

aurelia.start().then(() => aurelia.setRoot('./app.js', document.body))