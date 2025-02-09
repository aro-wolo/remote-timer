import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { getRandomCode } from "./util";

interface CodeProps {
	code: string;
	setCode: (code: string) => void;
	locked: boolean;
	setLocked: (locked: boolean) => void;
}

const Code: React.FC<CodeProps> = ({ code, setCode, locked, setLocked }) => {
	const [isLocked, setIsLocked] = useState<boolean>(locked);

	useEffect(() => {
		setIsLocked(locked);
	}, [locked]);

	const handleGenerateCode = () => {
		if (!isLocked) {
			const newCode = getRandomCode();
			setCode(newCode);
			localStorage.setItem("savedCode", newCode);
		}
	};

	const toggleLock = () => {
		const newLockState = !isLocked;
		setIsLocked(newLockState);
		setLocked(newLockState);

		if (newLockState) {
			localStorage.setItem("savedCode", code);
		} else {
			localStorage.removeItem("savedCode");
		}
	};

	return (
		<div className="d-flex align-items-center ">
			<div className="me-3 fw-bold ps-4 pe-2 mono-font">
				<a
					className="fw-bold btn btn-link mono-font"
					onClick={handleGenerateCode}>
					{code}
				</a>
				<Button variant="link" onClick={toggleLock} className="ms-2">
					<i
						className={`bi fs-2 lock-icon ${
							isLocked ? "bi-lock-fill locked" : "bi-unlock-fill unlocked"
						}`}></i>
				</Button>
			</div>
		</div>
	);
};

export default Code;
