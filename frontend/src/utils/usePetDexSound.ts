import { useCallback, useRef, useState } from "preact/hooks";

export type DexSound = "move" | "select" | "page" | "category" | "photo" | "back" | "on";

const SOUND_KEY = "petdex-sound";

const readStoredSound = () => {
	try {
		return localStorage.getItem(SOUND_KEY) === "on";
	} catch {
		return false;
	}
};

type AudioContextClass = typeof AudioContext;

/**
 * Short Pet Dex bleeps, synthesized with Web Audio so there are no audio files to load.
 * Sound is off until the visitor switches it on, and the choice is remembered in their browser.
 * `soft` swaps the square-wave bleeps for gentler sine tones (used on the Rainbow Bridge).
 */
export const usePetDexSound = () => {
	const [enabled, setEnabled] = useState(readStoredSound);
	const context = useRef<AudioContext | null>(null);
	const master = useRef<GainNode | null>(null);

	const ensureContext = () => {
		if (!context.current) {
			const Ctor: AudioContextClass | undefined =
				window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;
			if (!Ctor) return null;
			const ctx = new Ctor();
			const gain = ctx.createGain();
			gain.gain.value = 0.5;
			gain.connect(ctx.destination);
			context.current = ctx;
			master.current = gain;
		}
		if (context.current.state === "suspended") void context.current.resume();
		return context.current;
	};

	const playSound = useCallback(
		(name: DexSound, soft = false, force = false) => {
			if (!enabled && !force) return;
			const ctx = ensureContext();
			const out = master.current;
			if (!ctx || !out) return;

			const tone = (freq: number, at: number, dur: number, opts: { type?: OscillatorType; vol?: number; to?: number } = {}) => {
				const start = ctx.currentTime + at;
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = opts.type ?? (soft ? "sine" : "square");
				osc.frequency.setValueAtTime(freq, start);
				if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
				const volume = (opts.vol ?? 0.12) * (osc.type === "sine" ? 1.5 : 1);
				gain.gain.setValueAtTime(0.0001, start);
				gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
				gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
				osc.connect(gain).connect(out);
				osc.start(start);
				osc.stop(start + dur + 0.02);
			};

			const hiss = (at: number, dur: number, vol: number, freq: number) => {
				const start = ctx.currentTime + at;
				const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
				const samples = buffer.getChannelData(0);
				for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
				const source = ctx.createBufferSource();
				const filter = ctx.createBiquadFilter();
				const gain = ctx.createGain();
				source.buffer = buffer;
				filter.type = "bandpass";
				filter.frequency.value = freq;
				filter.Q.value = 0.8;
				gain.gain.setValueAtTime(vol * (soft ? 0.5 : 1), start);
				gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
				source.connect(filter).connect(gain).connect(out);
				source.start(start);
			};

			try {
				switch (name) {
					case "move":
						tone(1320, 0, 0.04, { vol: 0.07 });
						break;
					case "select":
						tone(988, 0, 0.05);
						tone(1480, 0.055, 0.08);
						break;
					case "page":
						tone(740, 0, 0.035, { type: "triangle", vol: 0.16 });
						break;
					case "category":
						hiss(0, 0.16, 0.18, 2200);
						tone(440, 0.12, 0.09, { to: 880 });
						break;
					case "photo":
						hiss(0, 0.07, 0.3, 4500);
						tone(2093, 0.05, 0.12, { type: "triangle" });
						break;
					case "back":
						tone(1175, 0, 0.08, { to: 587 });
						break;
					case "on":
						tone(659, 0, 0.06);
						tone(988, 0.07, 0.06);
						tone(1319, 0.14, 0.1);
						break;
				}
			} catch {
				// Sound is a nicety; never let it break the dex.
			}
		},
		[enabled]
	);

	const toggleSound = useCallback(() => {
		const next = !enabled;
		setEnabled(next);
		try {
			localStorage.setItem(SOUND_KEY, next ? "on" : "off");
		} catch {
			// Storage can be blocked; the switch still works for this visit.
		}
		if (next) playSound("on", false, true);
	}, [enabled, playSound]);

	return { soundOn: enabled, playSound, toggleSound };
};
