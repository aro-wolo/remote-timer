import React, { useState, useEffect } from "react";

const Controller: React.FC = () => {
	const [time, setTime] = useState<number>(0);
	const [ws, setWs] = useState<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://192.168.1.4:8080");
		setWs(socket);

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
		};

		socket.onclose = () => {
			console.log("Disconnected from WebSocket server");
		};

		return () => {
			socket.close();
		};
	}, []);

	const sendTime = () => {
		if (ws) {
			ws.send(JSON.stringify({ type: "addTime", time }));
			setTime(0); // Clear the form
		}
	};

	const updateTime = () => {
		if (ws) {
			ws.send(JSON.stringify({ type: "updateTime", time }));
			setTime(0); // Clear the form
		}
	};

	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100">
			<input
				type="number"
				className="form-control w-50 fs-1 text-center"
				value={time}
				onChange={(e) => setTime(parseInt(e.target.value))}
				placeholder="Enter time in seconds"
				inputMode="numeric"
			/>
			<div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-3">
				<button className="btn btn-secondary" onClick={updateTime}>
					<i className="bi bi-arrow-repeat"></i> Update
				</button>
				<button className="btn btn-secondary" onClick={sendTime}>
					<i className="bi bi-plus-circle"></i> Add
				</button>
			</div>
		</div>
	);
};

export default Controller;
