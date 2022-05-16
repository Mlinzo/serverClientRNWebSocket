const express = require("express");
const PORT = process.env.PORT ?? 5000;
const app = express();
const events = require('events');
const emitter = new events.EventEmitter();

const alertLocations = [
	{
		dangerLevel: 'low',
		title: 'Odessa',
		date: '16.05.2022',
		dateFrom: '16.05.2022',
		dateTo: '16.05.2022'
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
		alertLocations.push({
			dangerLevel: req.body.dangerLevel,
			title: req.body.title,
			date: req.body.date,
			dateFrom: req.body.dateFrom,
			dateTo: req.body.dateTo
		});
		res.json({index: alertLocations.length-1});
	} catch (e) { res.sendStatus(400) }
	console.log('enabled alert for '+ JSON.stringify(alertLocations[alertLocations.length-1]));
	emitter.emit('alertUpdate', alertLocations);
});

app.post('/api/disableAlert', (req, res)=>{
	try {
		const ind = parseInt(req.body.index);
		console.log('disabled alert for '+ JSON.stringify(alertLocations[ind]));
		alertLocations.splice(ind);
		res.sendStatus(200);		
	} catch (e) { res.sendStatus(400) };
	emitter.emit('alertUpdate', alertLocations);
});

app.get('*', (req, res) => {
	res.sendStatus(404);
});

app.listen(PORT, ()=> {
	console.log("express server started on port " + PORT);
});