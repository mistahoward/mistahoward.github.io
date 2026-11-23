import { useEffect, useState } from "preact/hooks";
import { FaPaw } from "react-icons/fa";
import { Pet } from "../../types/pet-manager.types";
import { formatDexNumber } from "../../utils/petdex";

interface DexScreenProps {
	pet: Pet | null;
	isMemorial: boolean;
	showPhoto: boolean;
	onTogglePhoto: () => void;
	/** Bump to replay the screen wipe (category change). */
	wipeKey: number;
	/** Bump to replay the camera flash (photo on). */
	snapKey: number;
}

type PhotoState = "loading" | "ready" | "missing";

/** The left-hand screen: the selected pet's sprite (or photo), name plate, number and level. */
export const DexScreen = ({ pet, isMemorial, showPhoto, onTogglePhoto, wipeKey, snapKey }: DexScreenProps) => {
	const [photoState, setPhotoState] = useState<PhotoState>("loading");
	const sprite = pet?.iconUrl;
	const photo = pet?.imageUrl;

	useEffect(() => {
		setPhotoState(photo ? "loading" : "missing");
	}, [photo, showPhoto]);

	return (
		<div className="pd-bezel">
			<div className="pd-bezel-top">
				<div className="pd-bezel-dots" aria-hidden="true">
					<i />
					<i />
				</div>
				<button type="button" className="pd-snap" aria-pressed={showPhoto} onClick={onTogglePhoto} disabled={!showPhoto && !photo}>
					{showPhoto ? "Sprite" : "Photo"}
				</button>
			</div>
			<div className={`pd-lcd${showPhoto ? " is-photo" : ""}`}>
				{wipeKey > 0 && <span key={`wipe-${wipeKey}`} className="pd-wipe" aria-hidden="true" />}
				{snapKey > 0 && <span key={`snap-${snapKey}`} className="pd-flash" aria-hidden="true" />}
				{pet ? (
					<>
						<div className="pd-lcd-top">
							<span className="pd-tag">{isMemorial ? "In memory" : pet.species === "dog" ? "Canine" : "Feline"}</span>
							<span>No. {formatDexNumber(pet)}</span>
						</div>
						<div className="pd-sprite-wrap">
							<div className="pd-sprite-box">
								{isMemorial && <span className="pd-halo" aria-hidden="true" />}
								{sprite ? (
									<img className="pd-sprite" src={sprite} alt={`${pet.name} sprite`} />
								) : (
									<span className="pd-sprite-missing" aria-hidden="true">
										<FaPaw />
									</span>
								)}
							</div>
						</div>
						{showPhoto && (
							<div className={`pd-photo is-${photoState}`}>
								{photo && (
									<img
										src={photo}
										alt={`Photo of ${pet.name}`}
										onLoad={() => setPhotoState("ready")}
										onError={() => setPhotoState("missing")}
									/>
								)}
								{photoState !== "ready" && (
									<span className="pd-photo-msg">{photoState === "loading" ? "Loading photo" : "No photo yet"}</span>
								)}
							</div>
						)}
						<div className="pd-plate" aria-live="polite">
							<h3 className="pd-name" style={{ "--pd-len": String(pet.name.length) } as Record<string, string>}>
								{pet.name}
							</h3>
							<p className="pd-nick">{pet.nickname ? `“${pet.nickname}”` : ""}</p>
						</div>
						<div className="pd-lcd-bottom">
							<span>
								{isMemorial ? "Max Lv." : "Lv."} {pet.age ?? "??"}
							</span>
							<span title={pet.breed}>{pet.breed}</span>
						</div>
					</>
				) : (
					<p className="pd-lcd-empty">{isMemorial ? "No pets on the Rainbow Bridge." : "No pets here yet."}</p>
				)}
			</div>
		</div>
	);
};
