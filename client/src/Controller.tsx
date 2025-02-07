import React, { useState, useEffect } from "react";
import DisplayTime from "./DisplayTime";

const Controller: React.FC = () => {
	const [time, setTime] = useState<number>(0);
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const wsHost = import.meta.env.VITE_WS_HOST || "0.0.0.0";
	const wsPort = import.meta.env.VITE_WS_PORT || 8080;
	const wsUrl = `ws://${wsHost}:${wsPort}`;

	useEffect(() => {
		const socket = new WebSocket(wsUrl);
		setWs(socket);

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "updateTime") {
				setTime(data.time);
			}
		};

		return () => {
			socket.close();
		};
	}, []);

	const sendTime = (increment: number) => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: "addTime", time: increment }));
			setTime(0); // Clear the form
		} else {
			console.log("WebSocket is not open");
		}
	};

	const toggleTimer = () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			if (isRunning) {
				ws.send(JSON.stringify({ type: "pauseTimer" }));
			} else {
				ws.send(JSON.stringify({ type: "startTimer" }));
				ws.send(JSON.stringify({ type: "updateTime", time }));
			}
			setIsRunning(!isRunning);
		} else {
			console.log("WebSocket is not open");
		}
	};

	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100">
			<DisplayTime />
			<div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-3">
				<button className="btn btn-lg btn-info flex-fill mx-1" onClick={() => sendTime(-1)} title="Decrease time">
					<i className="bi bi-dash-circle"></i>
				</button>
				<button className="btn btn-lg btn-warning flex-fill mx-1" onClick={() => sendTime(1)} title="Increase time">
					<i className="bi bi-plus-circle"></i>
				</button>
				<button className={`btn btn-lg flex-fill mx-1 ${isRunning ? "btn-danger" : "btn-success"}`} onClick={toggleTimer} title={isRunning ? "Stop Timer" : "Start Timer"}>
					<i className={`bi ${isRunning ? "bi-pause-circle" : "bi-play-circle"}`}></i>
				</button>
			</div>
		</div>
	);
};

export default Controller;
