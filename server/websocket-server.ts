import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.WS_HOST || "0.0.0.0";
const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;

const server = new WebSocketServer({ port, host });

let currentTime = 0;
let timerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message.toString());
    if (data.type === "addTime") {
      currentTime += data.time * 60; // Convert minutes to seconds
    } else if (data.type === "updateTime") {
      currentTime = data.time; // already in minutes
    } else if (data.type === "clearTime") {
      currentTime = 0;
    } else if (data.type === "startTimer") {
      if (!timerInterval) {
        isRunning = true;
        timerInterval = setInterval(() => {
          currentTime--;
          server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "updateTime", time: currentTime }));
            }
          });
        }, 1000);
      }
    } else if (data.type === "pauseTimer") {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
      }
    }
    // Broadcast the updated time to all clients
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "updateTime", time: currentTime }));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://${host}:${port}`);
