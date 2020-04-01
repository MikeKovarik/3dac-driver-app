import * as api from './api.js'


api.applyTasksData([
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
])


api.tasks[1].materials[0].claimed = true
api.tasks[1].materials[0].loaded = true

api.tasks[2].materials[0].claimed = true
api.tasks[2].materials[1].claimed = true
api.tasks[2].materials[0].loaded = true

api.tasks[3].materials[0].claimed = true
api.tasks[3].materials[0].finished = true