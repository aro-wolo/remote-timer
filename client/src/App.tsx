import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Controller from "./Controller";
import DisplayTime from "./DisplayTime";

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/control" element={<Controller />} />
				<Route path="/display" element={<DisplayTime size={1} />} />
				<Route
					path="/"
					element={
						<div className="d-flex flex-column justify-content-center align-items-center vh-100">
							<Link
								to="/control"
								className="btn d-flex gap-3 align-items-center btn-primary btn-lg pe-5 mb-4">
								<i className="bi bi-gear-fill"></i>
								<div className="vr"></div>
								<span>Controller</span>
							</Link>
							<Link
								to="/display"
								className="btn d-flex gap-3 align-items-center btn-primary btn-lg  pe-5">
								<i className="bi bi-clock-fill"></i>
								<div className="vr"></div>
								<span>Display Time</span>
							</Link>
						</div>
					}
				/>
			</Routes>
		</Router>
	);
};

export default App;
