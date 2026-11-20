import { useEffect, useRef, useState } from "preact/hooks";

// What a polite live region should say after a filter or search change: the latest status, once
// changes pause for a moment. It stays empty until the visitor changes something, so the first
// load isn't read aloud. Call markInteracted() in the handlers that change the results.
export const useAnnouncement = (status: string, delay = 400) => {
	const [announcement, setAnnouncement] = useState("");
	const interacted = useRef(false);

	useEffect(() => {
		if (!interacted.current) return undefined;
		const timer = window.setTimeout(() => setAnnouncement(status), delay);
		return () => window.clearTimeout(timer);
	}, [status, delay]);

	const markInteracted = () => {
		interacted.current = true;
	};

	return { announcement, markInteracted };
};
