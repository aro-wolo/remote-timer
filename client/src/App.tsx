import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Controller from "./Controller";
import DisplayTime from "./DisplayTime";
import Code from "./Code";
import { getRandomCode } from "./util";

const App: React.FC = () => {
	const [code, setCode] = useState<string>("");
	const [locked, setLocked] = useState<boolean>(false);

	useEffect(() => {
		const savedCode = localStorage.getItem("savedCode");
		if (savedCode) {
			setCode(savedCode);
			setLocked(true);
		} else {
			const newCode = getRandomCode();
			setCode(newCode);
			setLocked(false);
		}
	}, []);
	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<div className="d-flex flex-column justify-content-center align-items-center vh-100">
							<div className="pb-5">
								<Code
									code={code}
									setCode={setCode}
									locked={locked}
									setLocked={setLocked}
								/>
							</div>
							<Link
								to={`/control/${code}`}
								className="btn d-flex gap-3 align-items-center btn-primary btn-lg pe-5 mb-4">
								<i className="bi bi-gear-fill"></i>
								<div className="vr"></div>
								<span>Controller</span>
							</Link>
							<Link
								to={`/display/${code}`}
								className="btn d-flex gap-3 align-items-center btn-primary btn-lg pe-5">
								<i className="bi bi-clock-fill"></i>
								<div className="vr"></div>
								<span>Display Time</span>
							</Link>
						</div>
					}
				/>
				<Route path="/control/:code" element={<Controller />} />
				<Route path="/display/:code" element={<DisplayTime size={1} />} />
			</Routes>
		</Router>
	);
};

export default App;
