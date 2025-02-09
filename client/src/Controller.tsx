import React, { useState, useEffect } from "react";
import DisplayTime from "./DisplayTime";
import useWebSocket, { ReadyState } from "react-use-websocket";

const Controller: React.FC = () => {
	const [time, setTime] = useState<number>(0);
	const [isRunning, setIsRunning] = useState<boolean>(true);
	const wsHost = import.meta.env.VITE_WS_HOST || "0.0.0.0";
	const wsPort = import.meta.env.VITE_WS_PORT || 8085;
	const wsUrl = `ws://${wsHost}:${wsPort}`;

	const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl, {
		shouldReconnect: () => true,
		reconnectAttempts: 10,
		reconnectInterval: 3000,
	});

	useEffect(() => {
		if (lastMessage !== null) {
			const messageData = lastMessage.data;
			setTime(parseInt(messageData, 10));
		}
	}, [lastMessage]);

	const isConnected = readyState === ReadyState.OPEN;

	const sendTime = (increment: number) => {
		if (isConnected) {
			sendMessage(JSON.stringify({ type: "addTime", time: increment }));
			setTime(0); // Clear the form
		} else {
			console.log("WebSocket is not open");
		}
	};

	const clearTime = () => {
		if (isConnected) {
			sendMessage(JSON.stringify({ type: "clearTimer" }));
			setTime(0); // Clear the form
		} else {
			console.log("WebSocket is not open");
		}
	};

	const toggleTimer = () => {
		if (isConnected) {
			if (isRunning) {
				sendMessage(JSON.stringify({ type: "pauseTimer" }));
			} else {
				sendMessage(JSON.stringify({ type: "startTimer" }));
				sendMessage(JSON.stringify({ type: "updateTime", time }));
			}
			setIsRunning(!isRunning);
		} else {
			console.log("WebSocket is not open");
		}
	};

	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100">
			<div
				style={{
					position: "fixed",
					top: 10,
					right: 10,
					width: 20,
					height: 20,
					borderRadius: "50%",
					backgroundColor: isConnected ? "green" : "red",
				}}
			/>
			<DisplayTime size={2} />
			<div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-3">
				<button
					className="btn btn-lg btn-secondary flex-fill mx-1"
					onClick={() => clearTime()}
					title="Clear">
					<i className="bi bi-eraser-fill"></i>
				</button>
				<button
					className="btn btn-lg btn-info flex-fill mx-1"
					onClick={() => sendTime(-2)}
					title="Decrease time">
					<i className="bi bi-dash-circle"></i>
				</button>
				<button
					className="btn btn-lg btn-info flex-fill mx-1"
					onClick={() => sendTime(3)}
					title="Increase time">
					<i className="bi bi-plus-circle"></i>
				</button>
				<button
					className={`btn btn-lg flex-fill mx-1 ${
						isRunning ? "btn-danger" : "btn-success"
					}`}
					onClick={toggleTimer}>
					<i
						className={`bi ${
							isRunning ? "bi-pause-circle" : "bi-play-circle"
						}`}></i>
				</button>
			</div>
		</div>
	);
};

export default Controller;
