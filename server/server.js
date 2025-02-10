"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
dotenv_1.default.config();
const host = process.env.WS_HOST || "0.0.0.0";
const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8085;
let server;
let wss;
if (process.env.SERVER_CERT && process.env.SERVER_KEY) {
    console.log("SSL certificates detected. Using WSS.");
    const options = {
        cert: fs_1.default.readFileSync(process.env.SERVER_CERT),
        key: fs_1.default.readFileSync(process.env.SERVER_KEY),
    };
    server = https_1.default.createServer(options);
    wss = new ws_1.WebSocketServer({ server });
}
else {
    console.log("No SSL certificates found. Using WS.");
    server = http_1.default.createServer();
    wss = new ws_1.WebSocketServer({ server });
}
const rooms = {};
wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.on("message", (message) => {
        try {
            console.log(`Received message: ${message}`);
            const data = JSON.parse(message.toString());
            const { roomCode, type, time } = data;
            if (!roomCode) {
                ws.send(JSON.stringify({ error: "Missing roomCode" }));
                return;
            }
            if (!rooms[roomCode]) {
                rooms[roomCode] = {
                    currentTime: 0,
                    timerInterval: null,
                    isRunning: false,
                    clients: new Set(),
                };
            }
            const room = rooms[roomCode];
            room.clients.add(ws);
            switch (type) {
                case "addTime":
                    room.currentTime += time * 60;
                    break;
                case "updateTime":
                    room.currentTime = Math.max(0, time);
                    break;
                case "clearTimer":
                    room.currentTime = 0;
                    break;
                case "startTimer":
                    if (!room.isRunning) {
                        room.isRunning = true;
                        room.timerInterval = setInterval(() => {
                            if (room.currentTime > 0) {
                                room.currentTime--;
                            }
                            else {
                                clearInterval(room.timerInterval);
                                room.isRunning = false;
                            }
                            broadcastUpdate(room, roomCode);
                        }, 1000);
                    }
                    break;
                case "pauseTimer":
                    if (room.isRunning) {
                        clearInterval(room.timerInterval);
                        room.isRunning = false;
                    }
                    break;
                default:
                    ws.send(JSON.stringify({ error: `Unhandled type: ${type}` }));
                    return;
            }
            broadcastUpdate(room, roomCode);
        }
        catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
    });
    ws.on("close", () => {
        console.log("Client disconnected");
        Object.keys(rooms).forEach((roomCode) => {
            const room = rooms[roomCode];
            room.clients.delete(ws);
            if (room.clients.size === 0) {
                if (room.timerInterval) {
                    clearInterval(room.timerInterval);
                }
                delete rooms[roomCode];
            }
        });
    });
});
/**
 * Broadcasts the current time to all clients in the room.
 */
function broadcastUpdate(room, roomCode) {
    const message = JSON.stringify({
        type: "updateTime",
        time: room.currentTime,
        roomCode,
    });
    room.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(message);
        }
    });
}
// Start the server
server.listen(port, host, () => {
    console.log(`WebSocket server is running on ${process.env.SERVER_CERT ? "wss" : "ws"}://${host}:${port}`);
});
