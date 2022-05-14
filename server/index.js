const express = require("express");
const PORT = process.env.PORT ?? 5000;
const app = express();
const events = require('events');
const emitter = new events.EventEmitter();

const alertLocations = [
	{
		lon: 13.1231231,
		lat: 15.1231231
	}
];

const ws = require('ws');
const wss = new ws.Server({
    port: 5001
}, () => {console.log('websocket server started on port ' + 5001)});


wss.on('connection', (socket) => {	
	socket.send(JSON.stringify(alertLocations));

	socket.on('message', (msg) => {
        console.log('received: ' + msg);
    })

	emitter.on('alertUpdate', () => {
		broadcastMessage(alertLocations);
	});
	
})

const broadcastMessage = (msg, id) => {
    wss.clients.forEach( client => {
        client.send(JSON.stringify(msg));
    });
};

app.use(express.json());

app.get('/api/alertLocations', (req, res) => {
	res.json({alertLocations});
});

app.post('/api/enableAlert', (req, res)=>{
	try {
		const _lon = parseFloat(req.body.lon);
		const _lat = parseFloat(req.body.lat);
		alertLocations.push({
			lon: _lon,
			lat: _lat
		});
		res.sendStatus(200);
	} catch (e) { res.sendStatus(400) }
	console.log('enabled alert for '+ JSON.stringify(alertLocations[alertLocations.length-1]));
	emitter.emit('alertUpdate', alertLocations);
});

app.post('/api/disableAlert', (req, res)=>{
	try {
		const _lon = parseFloat(req.body.lon);
		const _lat = parseFloat(req.body.lat);
		const ind = alertLocations.findIndex((location, index) => {
			if (location.lon === _lon && location.lat === _lat) return true;
		})
		if (ind == -1) {res.sendStatus(400); return;}
		alertLocations.splice(ind);
		res.sendStatus(200);
	} catch (e) { res.sendStatus(400) }
	console.log('disabled alert for '+ JSON.stringify(req.body));
	emitter.emit('alertUpdate', alertLocations);
});

app.get('*', (req, res) => {
	res.sendStatus(404);
});

app.listen(PORT, ()=> {
	console.log("server started on port " + PORT);
});