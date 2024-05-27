import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Resume from "./components/Resume";
import Login from "./Login";

const App = () => {
	const [result, setResult] = useState({});

	return (
		<div>
			
				<Routes>
					<Route path='/' element={<Login />} />
					<Route path='/Home' element={<Home setResult={setResult} />} />
					<Route path='/resume' element={<Resume result={result} />} />
				</Routes>
			
		</div>
	);
};

export default App;
