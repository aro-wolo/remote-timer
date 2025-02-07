import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let currentTime = 0;

wss.on('connection', (ws) => {
	console.log('Client connected');

	ws.on('message', (message) => {
		console.log(message.toString())
		const data = JSON.parse(message.toString());
		if (data.type === 'addTime') {
			currentTime += data.time * 60; // Convert minutes to seconds
		} else if (data.type === 'updateTime') {
			currentTime = data.time * 60; // Convert minutes to seconds
		}
		// Broadcast the updated time to all clients
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ type: 'updateTime', time: currentTime }));
			}
		});
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

console.log('WebSocket server is running on ws://localhost:8080');