import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Controller from './Controller';
import DisplayTime from './DisplayTime';

const App: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/control" element={<Controller />} />
				<Route path="/display" element={<DisplayTime />} />
			</Routes>
		</Router>
	);
};

export default App;
