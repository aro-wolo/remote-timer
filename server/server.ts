import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config();

const host = process.env.WS_HOST || "0.0.0.0";
const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8085;

let server: http.Server | https.Server;
let wss: WebSocketServer;

if (process.env.SERVER_CERT && process.env.SERVER_KEY) {
  console.log("SSL certificates detected. Using WSS.");
  const options = {
    cert: fs.readFileSync(process.env.SERVER_CERT),
    key: fs.readFileSync(process.env.SERVER_KEY),
  };
  server = https.createServer(options);
  wss = new WebSocketServer({ server });
} else {
  console.log("No SSL certificates found. Using WS.");
  server = http.createServer();
  wss = new WebSocketServer({ server });
}

interface Room {
  currentTime: number;
  timerInterval: NodeJS.Timeout | null;
  isRunning: boolean;
  clients: Set<WebSocket>;
}

const rooms: { [key: string]: Room } = {};

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
              } else {
                clearInterval(room.timerInterval!);
                room.isRunning = false;
              }
              broadcastUpdate(room, roomCode);
            }, 1000);
          }
          break;

        case "pauseTimer":
          if (room.isRunning) {
            clearInterval(room.timerInterval!);
            room.isRunning = false;
          }
          break;

        default:
          ws.send(JSON.stringify({ error: `Unhandled type: ${type}` }));
          return;
      }

      broadcastUpdate(room, roomCode);
    } catch (error) {
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
function broadcastUpdate(room: Room, roomCode: string) {
  const message = JSON.stringify({
    type: "updateTime",
    time: room.currentTime,
    roomCode,
  });

  room.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Start the server
server.listen(port, host, () => {
  console.log(
    `WebSocket server is running on ${
      process.env.SERVER_CERT ? "wss" : "ws"
    }://${host}:${port}`,
  );
});
