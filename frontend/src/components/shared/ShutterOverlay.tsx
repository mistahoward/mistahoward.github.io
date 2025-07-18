import { useEffect } from "preact/hooks";
import { ShutterOverlayProps } from "../../types/shutter-overlay.types";

export const ShutterOverlay = ({ show, onAnimationEnd }: ShutterOverlayProps) => {
	useEffect(() => {
		if (!show) return;
		const timer = setTimeout(onAnimationEnd, 900);
		return () => clearTimeout(timer);
	}, [show, onAnimationEnd]);

	return show ? (
		<div className="shutter-overlay">
			<div className="shutter-bar left" />
			<div className="shutter-bar right" />
		</div>
	) : null;
};
