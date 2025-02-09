import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface DisplayTimeProps {
	size: 1 | 2;
}

const DisplayTime: React.FC<DisplayTimeProps> = ({ size = 1 }) => {
	const [time, setTime] = useState<number>(0);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const wsHost = import.meta.env.VITE_WS_HOST || "0.0.0.0";
	const wsPort = import.meta.env.VITE_WS_PORT || 8080;
	const wsUrl = `ws://${wsHost}:${wsPort}`;
	const { code } = useParams<{ code: string }>();

	const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl, {
		shouldReconnect: () => true, // Always attempt to reconnect
		reconnectAttempts: 10, // Number of reconnection attempts
		reconnectInterval: 3000, // Interval between reconnection attempts (in milliseconds)
	});

	useEffect(() => {
		if (readyState === ReadyState.OPEN && code) {
			sendMessage(JSON.stringify({ type: "joinRoom", roomCode: code }));
		}
	}, [readyState, code, sendMessage]);
	useEffect(() => {
		if (lastMessage !== null) {
			const messageData = lastMessage.data;
			const message = JSON.parse(messageData);
			if (message.type === "updateTime" && message.roomCode == code) {
				const currentTime = message.time;
				setTime(currentTime);
			} else if (message.type === "startTimer" && message.roomCode == code) {
				setIsRunning(true);
			} else if (message.type === "pauseTimer" && message.roomCode == code) {
				setIsRunning(false);
			}
		}
	}, [lastMessage]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		const blinkClass = getBlinkClass(seconds);

		return (
			<>
				{minutes}
				<span className={blinkClass}>:</span>
				{remainingSeconds.toString().padStart(2, "0")}
			</>
		);
	};

	const getTimeColor = (seconds: number) => {
		if (seconds < 180) {
			return "bright-red";
		} else if (seconds < 600) {
			return "bright-green";
		} else {
			return "bright-white";
		}
	};

	const getBlinkClass = (seconds: number) => {
		return seconds < 30 ? `tfs-${size} blink` : `tfs-${size}`;
	};

	return (
		<div
			className={`d-flex justify-content-center tfs-${size} align-items-center vh-100`}>
			<div
				className={`text-center time-display ${getTimeColor(time)} ${
					isRunning ? "" : "time-pause"
				}`}>
				{time > 0 ? formatTime(time) : <span>Time Up</span>}
			</div>
		</div>
	);
};

export default DisplayTime;
