import React, { useState, useEffect } from "react";

const DisplayTime: React.FC = () => {
	const [time, setTime] = useState<number>(0);
	const [isRunning, setIsRunning] = useState<boolean>(false); // New state for timer running status
	const wsHost = import.meta.env.VITE_WS_HOST || "0.0.0.0";
	const wsPort = import.meta.env.VITE_WS_PORT || 8080;
	const wsUrl = `ws://${wsHost}:${wsPort}`;

	useEffect(() => {
		const socket = new WebSocket(wsUrl);

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		socket.onmessage = async (event) => {
			if (socket.readyState === WebSocket.OPEN) {
				let messageData = event.data;
				if (messageData instanceof Blob) {
					messageData = await messageData.text();
				}
				const message = JSON.parse(messageData);
				if (message.type === "updateTime") {
					const currentTime = message.time;
					const lastUpdate = Date.now();
					localStorage.setItem(
						"time",
						JSON.stringify({ currentTime, lastUpdate, isRunning })
					);
					setTime(currentTime);
				} else if (message.type === "startTimer") {
					setIsRunning(true);
					localStorage.setItem("isRunning", "true");
				} else if (message.type === "pauseTimer") {
					setIsRunning(false);
					localStorage.setItem("isRunning", "false");
				}
			}
		};

		return () => {
			if (
				socket.readyState === WebSocket.OPEN ||
				socket.readyState === WebSocket.CONNECTING
			) {
				socket.close();
			}
		};
	}, []);

	useEffect(() => {
		const storedTime = localStorage.getItem("time");
		const storedIsRunning = localStorage.getItem("isRunning");
		if (storedTime) {
			const { currentTime, lastUpdate } = JSON.parse(storedTime);
			const elapsedTime = Math.floor((Date.now() - lastUpdate) / 1000);
			setTime(Math.max(currentTime - elapsedTime, 0));
		}
		if (storedIsRunning) {
			setIsRunning(storedIsRunning === "true");
		}
	}, []);

	useEffect(() => {
		console.log(isRunning)
		if (isRunning && time > 0) {
			const timer = setInterval(() => {
				setTime((prevTime) => {

					const newTime = prevTime - 1;
					if (newTime <= 0) {
						clearInterval(timer);
						return 0;
					}
					localStorage.setItem(
						"time",
						JSON.stringify({ currentTime: newTime, lastUpdate: Date.now(), isRunning })
					);
					return newTime;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [isRunning, time]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor((seconds % 3600) / 60)
			.toString()
			.padStart(2, "0");
		const secs = (seconds % 60).toString().padStart(2, "0");
		return (
			<>
				{mins}
				<span className={getBlinkClass(seconds)}>:</span>
				{secs}
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
		return seconds < 30 ? "blink" : "";
	};

	return (
		<div className="d-flex justify-content-center align-items-center vh-100">
			<div className={`text-center time-display ${getTimeColor(time)} `}>
				{time > 0 ? formatTime(time) : <span>Time Up</span>}
			</div>
		</div>
	);
};

export default DisplayTime;
