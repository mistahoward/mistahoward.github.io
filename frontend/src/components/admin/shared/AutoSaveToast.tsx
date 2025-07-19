import { useState, useEffect } from "preact/hooks";

interface AutoSaveToastProps {
	isVisible: boolean;
	lastSaved?: Date;
	hasUnsavedChanges?: boolean;
}

export const AutoSaveToast = ({ isVisible, lastSaved, hasUnsavedChanges = false }: AutoSaveToastProps) => {
	const [showToast, setShowToast] = useState(false);
	const [message, setMessage] = useState("");
	const [toastType, setToastType] = useState<"saving" | "saved" | "error">("saving");
	const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>(lastSaved);

	useEffect(() => {
		if (!isVisible) {
			setShowToast(false);
			return;
		}

		// Update last saved time when it changes
		if (lastSaved && lastSaved !== lastSavedTime) {
			setLastSavedTime(lastSaved);
		}

		if (hasUnsavedChanges) {
			setMessage("Saving...");
			setToastType("saving");
			setShowToast(true);
		} else if (lastSavedTime && !hasUnsavedChanges) {
			// Show saved message when we have a last saved time and no unsaved changes
			setMessage(`Saved at ${lastSavedTime.toLocaleTimeString()}`);
			setToastType("saved");
			setShowToast(true);

			// Hide the "saved" message after 3 seconds
			const timer = setTimeout(() => {
				setShowToast(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [isVisible, lastSaved, lastSavedTime, hasUnsavedChanges]);

	// Debug logging
	useEffect(() => {
		console.log("AutoSaveToast state:", {
			isVisible,
			hasUnsavedChanges,
			lastSaved,
			lastSavedTime,
			showToast,
			message,
			toastType,
		});
	}, [isVisible, hasUnsavedChanges, lastSaved, lastSavedTime, showToast, message, toastType]);

	if (!showToast) return null;

	const getToastClass = () => {
		switch (toastType) {
			case "saving":
				return "bg-info text-white";
			case "saved":
				return "bg-success text-white";
			case "error":
				return "bg-danger text-white";
			default:
				return "bg-info text-white";
		}
	};

	const getIcon = () => {
		switch (toastType) {
			case "saving":
				return "⏳";
			case "saved":
				return "✅";
			case "error":
				return "❌";
			default:
				return "💾";
		}
	};

	return (
		<div
			className={`position-fixed top-0 end-0 m-3 p-3 rounded shadow-lg ${getToastClass()}`}
			style={{
				zIndex: 9999,
				minWidth: "200px",
				animation: "slideInRight 0.3s ease-out",
			}}
		>
			<div className="d-flex align-items-center">
				<span className="me-2" style={{ fontSize: "1.2rem" }}>
					{getIcon()}
				</span>
				<span className="small">{message}</span>
			</div>
		</div>
	);
};
