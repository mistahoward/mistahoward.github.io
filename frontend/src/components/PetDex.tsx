import { useState, useMemo, useEffect } from "preact/hooks";
import { Pet } from "../types/pet-manager.types";
import { fetchItems } from "../utils/crud";
import { YakShaverSpinner } from "./shared/YakShaverSpinner";
import { GiHealthNormal } from "react-icons/gi";
import { LuSword } from "react-icons/lu";
import { FaShieldDog, FaShieldCat } from "react-icons/fa6";
import { HiLightningBolt } from "react-icons/hi";

const GBA_CATEGORIES = [
	{ key: "canine", label: "Canine" },
	{ key: "feline", label: "Feline" },
];

export const PetDex = () => {
	const [pets, setPets] = useState<Pet[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [category, setCategory] = useState<"canine" | "feline">("canine");
	const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

	useEffect(() => {
		fetchItems<Pet>({
			endpoint: "/api/pets",
			onSuccess: data => {
				console.log("[PetDex] Fetched pets:", data);
				setPets(data);
			},
			setLoading,
			setError: err => {
				if (err) {
					console.error("[PetDex] Error fetching pets:", err);
					setError(err);
				} else {
					setError("");
				}
			},
		});
	}, []);

	const speciesMap = { canine: "dog", feline: "cat" };
	const filteredPets = useMemo(() => {
		const filtered = pets.filter(pet => pet.species === speciesMap[category]);
		// Sort by dexId ascending (e.g., #001, #002, ...)
		return filtered.slice().sort((a, b) => {
			const aNum = parseInt((a.dexId || "").replace("#", ""), 10);
			const bNum = parseInt((b.dexId || "").replace("#", ""), 10);
			return aNum - bNum;
		});
	}, [pets, category]);
	const selectedPet = useMemo(() => filteredPets.find(p => p.id === selectedPetId) || null, [filteredPets, selectedPetId]);

	const parseQuotedList = (val?: string) => {
		if (!val) return [];
		let trimmed = val.trim();
		// eslint-disable-next-line quotes
		if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
			trimmed = trimmed.slice(1, -1);
		}
		return trimmed
			.split(/","/)
			.map(s => s.replace(/^"+|"+$/g, "").trim())
			.filter(Boolean);
	};

	const parseStats = (val?: string) => {
		if (!val) return {};
		try {
			const obj = JSON.parse(val);
			if (typeof obj === "object" && obj !== null) return obj;
		} catch (e) {
			/* ignore error */
		}
		return {};
	};

	if (loading)
		return (
			<section id="pet-dex" className="gba-pokedex-section min-vh-100 d-flex align-items-center justify-content-center">
				<div
					className="gba-pokedex-container container d-flex align-items-center justify-content-center"
					style={{ minHeight: "400px" }}
				>
					<YakShaverSpinner />
				</div>
			</section>
		);

	if (error)
		return (
			<section id="pet-dex" className="gba-pokedex-section min-vh-100 d-flex align-items-center justify-content-center">
				<div
					className="gba-pokedex-container container d-flex align-items-center justify-content-center text-danger"
					style={{ minHeight: "400px" }}
				>
					{error}
				</div>
			</section>
		);

	return (
		<section id="pet-dex" className="gba-pokedex-section min-vh-100 d-flex align-items-center justify-content-center">
			<div className="gba-pokedex-container container">
				<div className="row gba-pokedex-row justify-content-center">
					<div className="col-lg-6 col-md-7 col-12 gba-pokedex-info-panel">
						<div className="gba-pokedex-info card">
							{selectedPet ? (
								<div className="gba-pet-info-content animate__fadeIn">
									<div className="d-flex align-items-center mb-3">
										<img src={selectedPet.imageUrl} alt={selectedPet.name} className="gba-pet-image me-3" />
										<div>
											<h3 className="gba-pet-name mb-1">{selectedPet.name}</h3>
											{selectedPet.nickname && (
												<div className="gba-pet-nickname fst-italic small">({selectedPet.nickname})</div>
											)}
											<div className="gba-pet-dexid text-muted">{selectedPet.dexId}</div>
											{selectedPet.age && (
												<div
													className="gba-pet-level text-secondary"
													style={{ fontWeight: 600, fontSize: "1.1rem" }}
												>
													Lv. {selectedPet.age}
												</div>
											)}
										</div>
									</div>
									<div className="mb-3">
										<div className="gba-pet-description">
											<strong>Description:</strong> {selectedPet.description}
										</div>
										<div className="gba-pet-origin">
											<strong>Origin Story:</strong> {selectedPet.originStory}
										</div>
									</div>
									<div className="gba-pet-details">
										<div className="row mb-2">
											<div className="col-6">
												<strong>Breed:</strong> {selectedPet.breed || "Unknown"}
											</div>
											<div className="col-6">
												<strong>Color:</strong> {selectedPet.color || "?"}
											</div>
										</div>
										<div className="mb-2">
											<strong>Personality:</strong>
											{parseQuotedList(selectedPet.personality).length > 0 && (
												<div className="gba-pet-personality-list mb-1">
													{parseQuotedList(selectedPet.personality).map((trait, i) => (
														<div key={i} className="gba-pet-personality-item">
															{trait}
														</div>
													))}
												</div>
											)}
										</div>
										<div className="mb-2">
											<strong>Abilities:</strong>
											{parseQuotedList(selectedPet.specialAbilities).length > 0 &&
												parseQuotedList(selectedPet.specialAbilities).map((ability, i) => (
													<div key={i} className="gba-pet-ability-item">
														{ability}
													</div>
												))}
										</div>
										<div className="mb-2">
											<strong>Favorite Food:</strong> {selectedPet.favoriteFood}
										</div>
										<div className="mb-2">
											<strong>Favorite Toy:</strong> {selectedPet.favoriteToy}
										</div>
										<div className="mb-2">
											<strong>Stats:</strong>
											{Object.keys(parseStats(selectedPet.stats)).length > 0 ? (
												<table className="gba-pet-stats-table mt-1">
													<tbody>
														{Object.entries(parseStats(selectedPet.stats)).map(([stat, value]) => {
															let icon = null;
															const statKey = stat.toLowerCase();
															if (statKey === "hp" || statKey === "health")
																icon = (
																	<span className="gba-pet-stat-icon me-1">
																		<GiHealthNormal />
																	</span>
																);
															else if (statKey === "attack")
																icon = (
																	<span className="gba-pet-stat-icon me-1">
																		<LuSword />
																	</span>
																);
															else if (statKey === "defense")
																icon =
																	selectedPet.species === "dog" ? (
																		<span className="gba-pet-stat-icon me-1">
																			<FaShieldDog />
																		</span>
																	) : (
																		<span className="gba-pet-stat-icon me-1">
																			<FaShieldCat />
																		</span>
																	);
															else if (statKey === "speed")
																icon = (
																	<span className="gba-pet-stat-icon me-1">
																		<HiLightningBolt />
																	</span>
																);
															return (
																<tr key={stat}>
																	<td className={`gba-pet-stat-label gba-pet-stat-${statKey}`}>
																		{icon}
																		{stat.charAt(0).toUpperCase() + stat.slice(1)}
																	</td>
																	<td className="gba-pet-stat-value">{value as string | number}</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											) : null}
										</div>
									</div>
								</div>
							) : (
								<div className="gba-pet-info-placeholder text-center p-5 animate__fadeIn">
									<div className="gba-pet-placeholder-emoji mb-3" style={{ fontSize: "2.5rem" }}>
										🐾
									</div>
									<div className="gba-pet-placeholder-text fs-4">Pick a pet to get started!</div>
								</div>
							)}
						</div>
					</div>
					<div className="col-lg-5 col-md-5 col-12 gba-pokedex-list-panel">
						<div className="d-flex justify-content-between align-items-center mb-2">
							<h4 className="gba-pokedex-list-title mt-2 mb-0">Pet Dex</h4>
							<div className="gba-pokedex-toggle btn-group">
								{GBA_CATEGORIES.map(cat => (
									<button
										key={cat.key}
										className={`btn btn-sm gba-toggle-btn${category === cat.key ? " active" : ""}`}
										onClick={() => setCategory(cat.key as "canine" | "feline")}
									>
										{cat.label}
									</button>
								))}
							</div>
						</div>
						<div className="gba-pokedex-list scroll-area">
							{filteredPets.length === 0 ? (
								<div className="gba-pokedex-empty text-center text-muted py-4">No pets found in this category.</div>
							) : (
								<ul className="list-unstyled gba-pet-list">
									{filteredPets.map(pet => {
										const itemClass = [
											"gba-pet-list-item",
											"d-flex",
											"align-items-center",
											selectedPetId === pet.id ? "selected animate__pulse" : "",
										].join(" ");
										return (
											<li
												key={pet.id}
												className={itemClass}
												onClick={() => setSelectedPetId(pet.id)}
												tabIndex={0}
												role="button"
												aria-pressed={selectedPetId === pet.id}
											>
												<img src={pet.iconUrl} alt={pet.name + " icon"} className="gba-pet-list-icon me-2" />
												<span className="gba-pet-list-name flex-grow-1">{pet.name}</span>
												<span className="gba-pet-list-dexid text-muted">{pet.dexId}</span>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
