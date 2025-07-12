import { useEffect, useState } from "preact/hooks";

const KONAMI_SEQUENCE = [
	"ArrowUp",
	"ArrowUp", 
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"KeyB",
	"KeyA",
	"Enter"
];

export function useKonamiCode(onSuccess: () => void) {
	const [sequence, setSequence] = useState<string[]>([]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.code;
      
			setSequence(prev => {
				const newSequence = [...prev, key];
        
				if (newSequence.length > KONAMI_SEQUENCE.length) {
					return newSequence.slice(-KONAMI_SEQUENCE.length);
				}
        
				return newSequence;
			});
		};

		if (sequence.length === KONAMI_SEQUENCE.length) {
			const isKonamiCode = sequence.every((key, index) => key === KONAMI_SEQUENCE[index]);
      
			if (isKonamiCode) {
				onSuccess();
				setSequence([]);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
    
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [sequence, onSuccess]);

	return sequence;
} 