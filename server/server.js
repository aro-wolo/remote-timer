"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });

const { WebSocket, WebSocketServer } = require("ws"); // Ensure WebSocket is properly imported
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

const host = "0.0.0.0";
const port = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;

const server = new WebSocketServer({ port, host });

let currentTime = 0;
let timerInterval = null;
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
    } else if (data.type === "clearTimer") {
      currentTime = 0;
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: "updateTime", time: currentTime }),
          );
        }
      });
    } else if (data.type === "startTimer") {
      if (!timerInterval) {
        isRunning = true;
        timerInterval = setInterval(() => {
          currentTime--;
          server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({ type: "updateTime", time: currentTime }),
              );
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
