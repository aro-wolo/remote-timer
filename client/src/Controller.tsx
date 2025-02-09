import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import DisplayTime from "./DisplayTime";

const Controller: React.FC = () => {
	const [isRunning, setIsRunning] = useState<boolean>(true);
	const wsHost = import.meta.env.VITE_WS_HOST || "0.0.0.0";
	const wsPort = import.meta.env.VITE_WS_PORT || 8085;
	const wsUrl = `ws://${wsHost}:${wsPort}`;
	const { code } = useParams<{ code: string }>();

	const { sendMessage, readyState } = useWebSocket(wsUrl, {
		shouldReconnect: () => true, // Always attempt to reconnect
		reconnectAttempts: 10, // Number of reconnection attempts
		reconnectInterval: 3000, // Interval between reconnection attempts (in milliseconds)
	});

	useEffect(() => {
		if (readyState === ReadyState.OPEN && code) {
			sendMessage(JSON.stringify({ type: "joinRoom", roomCode: code }));
		}
	}, [readyState, code, sendMessage]);

	/* 	useEffect(() => {
		if (lastMessage !== null) {
			const messageData = lastMessage.data;
		}
	}, [lastMessage]); */

	const isConnected = readyState === ReadyState.OPEN;

	const sendTime = (increment: number) => {
		if (isConnected) {
			sendMessage(
				JSON.stringify({ type: "addTime", time: increment, roomCode: code })
			);
		}
	};

	const updateTime = (increment: number) => {
		if (isConnected) {
			sendMessage(
				JSON.stringify({ type: "updateTime", time: increment, roomCode: code })
			);
		}
	};

	const setTimerState = () => {
		if (isConnected && isRunning) {
			sendMessage(JSON.stringify({ type: "pauseTimer", roomCode: code }));
		}
		if (isConnected && !isRunning) {
			sendMessage(JSON.stringify({ type: "startTimer", roomCode: code }));
		}
		setIsRunning(!isRunning);
	};
	// startTimer

	return (
		<div className="app-container">
			<div
				style={{
					position: "fixed",
					top: 10,
					right: 10,
					width: 15,
					height: 15,
					borderRadius: "50%",
					backgroundColor: isConnected ? "#00ff00" : "red",
				}}
			/>
			<DisplayTime size={2} />
			<div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-3">
				<button
					className="btn btn-lg btn-secondary flex-fill mx-1"
					onClick={() => updateTime(0)}
					title="Clear timer">
					<i className="bi bi-eraser"></i>
				</button>
				<button
					className="btn btn-lg btn-info flex-fill mx-1"
					onClick={() => sendTime(-2)}
					title="Remove 3 minute">
					<i className="bi bi-dash-circle"></i> 2 min
				</button>
				<button
					className="btn btn-lg btn-info flex-fill mx-1"
					onClick={() => sendTime(3)}
					title="Add 3 minute">
					<i className="bi bi-plus-circle"></i> 3 min
				</button>
				<button
					className={`btn btn-lg ${
						isRunning ? "btn-danger" : "btn-success"
					} flex-fill mx-1`}
					onClick={() => setTimerState()}
					title={isRunning ? "Pause" : "Start"}>
					<i
						className={`bi ${
							isRunning ? "bi-pause-fill" : "bi-play-fill"
						}`}></i>
				</button>
			</div>
		</div>
	);
};

export default Controller;
