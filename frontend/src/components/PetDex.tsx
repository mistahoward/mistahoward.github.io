import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Pet } from "../types/pet-manager.types";
import { fetchItems } from "../utils/crud";
import { DEX_CATEGORIES, DEX_PAGES, DexCategory, DexPage, petsInCategory } from "../utils/petdex";
import { DexSound, usePetDexSound } from "../utils/usePetDexSound";
import { YakShaverSpinner } from "./shared/YakShaverSpinner";
import { DexScreen } from "./petdex/DexScreen";
import { DexPages } from "./petdex/DexPages";
import { DexGrid } from "./petdex/DexGrid";

const HINT_KEY = "petdex-sound-hint";

const readHintSeen = () => {
	try {
		return localStorage.getItem(HINT_KEY) === "seen";
	} catch {
		return false;
	}
};

const SpeakerIcon = ({ on, nudging }: { on: boolean; nudging: boolean }) => (
	<svg className={`pd-speaker${nudging ? " is-nudging" : ""}`} viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
		<rect x="1" y="6" width="3" height="4" />
		<rect x="4" y="5" width="1" height="6" />
		<rect x="5" y="4" width="1" height="8" />
		<rect x="6" y="3" width="1" height="10" />
		{on ? (
			<g>
				<rect x="9" y="6" width="1" height="4" />
				<rect x="10" y="5" width="1" height="1" />
				<rect x="10" y="10" width="1" height="1" />
				<rect x="11" y="4" width="1" height="8" />
				<rect x="12" y="2" width="1" height="2" />
				<rect x="12" y="12" width="1" height="2" />
				<rect x="13" y="3" width="1" height="10" />
			</g>
		) : (
			<g className="pd-speaker-mute">
				<rect x="9" y="5" width="2" height="2" />
				<rect x="13" y="5" width="2" height="2" />
				<rect x="11" y="7" width="2" height="2" />
				<rect x="9" y="9" width="2" height="2" />
				<rect x="13" y="9" width="2" height="2" />
			</g>
		)}
	</svg>
);

/**
 * The Pet Dex: a handheld-style device. The left half shows the selected pet's sprite (the lens flips it
 * to their photo); the right half has the Info, Story and Stats pages, the categories and the pet grid.
 * Under 860px of width it folds into one column.
 */
export const PetDex = () => {
	const [pets, setPets] = useState<Pet[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [category, setCategory] = useState<DexCategory>("canine");
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [page, setPage] = useState<DexPage>("info");
	const [showPhoto, setShowPhoto] = useState(false);
	const [wipeKey, setWipeKey] = useState(0);
	const [snapKey, setSnapKey] = useState(0);
	const [flashKey, setFlashKey] = useState(0);
	const [nudgeKey, setNudgeKey] = useState(0);
	const [showHint, setShowHint] = useState(false);
	const hintSeen = useRef(readHintSeen());
	const hintTimer = useRef<number | undefined>(undefined);
	const { soundOn, playSound, toggleSound } = usePetDexSound();

	useEffect(() => {
		fetchItems<Pet>({
			endpoint: "/api/pets",
			onSuccess: setPets,
			setLoading,
			setError: err => setError(err || ""),
		});
		return () => window.clearTimeout(hintTimer.current);
	}, []);

	const list = useMemo(() => petsInCategory(pets, category), [pets, category]);
	const counts = useMemo(
		() => Object.fromEntries(DEX_CATEGORIES.map(c => [c.key, petsInCategory(pets, c.key).length])) as Record<DexCategory, number>,
		[pets]
	);
	const current = list.find(pet => pet.id === selectedId) ?? list[0] ?? null;
	const isMemorial = category === "memorial";

	const play = (sound: DexSound, soft = isMemorial) => playSound(sound, soft);

	const markHintSeen = () => {
		hintSeen.current = true;
		try {
			localStorage.setItem(HINT_KEY, "seen");
		} catch {
			// Storage can be blocked; the hint then shows once per visit.
		}
	};

	// The first time someone uses the dex with sound off, point at the switch once: that's when they'd
	// have heard a bleep. It never shows again after that.
	const nudgeSound = () => {
		if (soundOn || hintSeen.current) return;
		markHintSeen();
		setShowHint(true);
		setNudgeKey(key => key + 1);
		hintTimer.current = window.setTimeout(() => setShowHint(false), 5000);
	};

	const selectPet = (id: number, sound: DexSound) => {
		if (id === current?.id) return;
		play(sound);
		setSelectedId(id);
		setFlashKey(key => key + 1);
		nudgeSound();
	};

	const step = (direction: number) => {
		if (!list.length) return;
		const index = Math.max(
			0,
			list.findIndex(pet => pet.id === current?.id)
		);
		selectPet(list[(index + direction + list.length) % list.length].id, "move");
	};

	const changePage = (next: DexPage, focusTab = false) => {
		if (next !== page) play("page");
		setPage(next);
		nudgeSound();
		if (focusTab) requestAnimationFrame(() => document.getElementById(`pd-tab-${next}`)?.focus());
	};

	const turnPage = (direction: number, focusTab: boolean) => {
		const index = DEX_PAGES.findIndex(p => p.key === page);
		changePage(DEX_PAGES[(index + direction + DEX_PAGES.length) % DEX_PAGES.length].key, focusTab);
	};

	const changeCategory = (next: DexCategory) => {
		if (next === category) return;
		play("category", next === "memorial");
		setCategory(next);
		setSelectedId(petsInCategory(pets, next)[0]?.id ?? null);
		setWipeKey(key => key + 1);
		nudgeSound();
	};

	// Turning the photo off always works, even on a pet without one.
	const togglePhoto = () => {
		if (!showPhoto && !current?.imageUrl) return;
		const next = !showPhoto;
		play(next ? "photo" : "back");
		setShowPhoto(next);
		setFlashKey(key => key + 1);
		if (next) setSnapKey(key => key + 1);
		nudgeSound();
	};

	const onSoundClick = () => {
		markHintSeen();
		window.clearTimeout(hintTimer.current);
		setShowHint(false);
		toggleSound();
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		const target = event.target as HTMLElement;
		if (event.key === "ArrowUp") step(-1);
		else if (event.key === "ArrowDown") step(1);
		else if (event.key === "ArrowLeft") turnPage(-1, !!target.closest(".pd-tabs"));
		else if (event.key === "ArrowRight") turnPage(1, !!target.closest(".pd-tabs"));
		else if (event.key === "p" || event.key === "P") togglePhoto();
		else return;
		event.preventDefault();
	};

	return (
		<section id="pet-dex" className="min-vh-100 d-flex align-items-center justify-content-center">
			<div className="container">
				<h2 className="display-4 fw-bold mb-4 text-center">Pet Dex</h2>
				{loading ? (
					<div className="d-flex justify-content-center py-5">
						<YakShaverSpinner />
					</div>
				) : error ? (
					<p className="text-danger text-center">{error}</p>
				) : (
					<div className="pd-stage">
						<div className={`pd-device${isMemorial ? " is-memorial" : ""}`} onKeyDown={onKeyDown}>
							<div className="pd-half pd-left">
								<div className="pd-topstrip">
									<button
										type="button"
										className="pd-lens"
										aria-pressed={showPhoto}
										aria-label={showPhoto ? "Show sprite" : "Show photo"}
										title={showPhoto ? "Show sprite" : "Show photo"}
										onClick={togglePhoto}
										disabled={!showPhoto && !current?.imageUrl}
									>
										{flashKey > 0 && <span key={flashKey} className="pd-lens-glow" aria-hidden="true" />}
									</button>
									<span className="pd-led pd-led--red" aria-hidden="true" />
									<span className="pd-led pd-led--yellow" aria-hidden="true" />
									<span className="pd-led pd-led--green" aria-hidden="true" />
									<span className="pd-brand" aria-hidden="true">
										PET DEX
									</span>
									<span className="pd-sound">
										{showHint && (
											<span className="pd-sound-hint" role="status">
												<b>Sound is off</b>
												<br />
												Tap for bleeps
											</span>
										)}
										<button type="button" className="pd-sound-btn" aria-pressed={soundOn} onClick={onSoundClick}>
											<SpeakerIcon key={nudgeKey} on={soundOn} nudging={nudgeKey > 0} />
											<span>{soundOn ? "Sound on" : "Sound off"}</span>
										</button>
									</span>
								</div>
								<DexScreen
									pet={current}
									isMemorial={isMemorial}
									showPhoto={showPhoto}
									onTogglePhoto={togglePhoto}
									wipeKey={wipeKey}
									snapKey={snapKey}
								/>
								<div className="pd-controls">
									<div className="pd-dpad">
										<button type="button" className="pd-dpad-up" aria-label="Previous pet" onClick={() => step(-1)}>
											▲
										</button>
										<button
											type="button"
											className="pd-dpad-left"
											aria-label="Previous page"
											onClick={() => turnPage(-1, false)}
										>
											◀
										</button>
										<span className="pd-dpad-center" aria-hidden="true" />
										<button
											type="button"
											className="pd-dpad-right"
											aria-label="Next page"
											onClick={() => turnPage(1, false)}
										>
											▶
										</button>
										<button type="button" className="pd-dpad-down" aria-label="Next pet" onClick={() => step(1)}>
											▼
										</button>
									</div>
									<p className="pd-hint">
										▲▼ pet · ◀▶ page
										<br />
										Lens or P: photo
									</p>
									<div className="pd-grille" aria-hidden="true">
										<i />
										<i />
										<i />
										<i />
									</div>
								</div>
							</div>

							<div className="pd-hinge" aria-hidden="true" />

							<div className="pd-half pd-right">
								<DexPages pets={pets} activeId={current?.id ?? null} page={page} onPageChange={next => changePage(next)} />
								<div className="pd-cats" role="group" aria-label="Category">
									{DEX_CATEGORIES.map(c => (
										<button
											key={c.key}
											type="button"
											className="pd-cat"
											aria-pressed={c.key === category}
											onClick={() => changeCategory(c.key)}
										>
											{c.label}
											<span className="pd-cat-count">{counts[c.key]}</span>
										</button>
									))}
								</div>
								<DexGrid
									pets={list}
									category={category}
									selectedId={current?.id ?? null}
									onSelect={id => selectPet(id, "select")}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};
