import { useEffect, useRef } from "preact/hooks";
import { FaPaw } from "react-icons/fa";
import { Pet } from "../../types/pet-manager.types";
import { DexCategory, formatDexNumber } from "../../utils/petdex";

interface DexGridProps {
	pets: Pet[];
	category: DexCategory;
	selectedId: number | null;
	onSelect: (id: number) => void;
}

/** Scroll the grid (not the page) just enough to show the tile. The strip scrolls sideways on phones. */
const keepVisible = (grid: HTMLElement, tile: HTMLElement) => {
	const g = grid.getBoundingClientRect();
	const t = tile.getBoundingClientRect();
	if (grid.scrollWidth > grid.clientWidth + 1) {
		if (t.left < g.left) grid.scrollLeft -= g.left - t.left + 8;
		else if (t.right > g.right) grid.scrollLeft += t.right - g.right + 8;
	} else if (t.top < g.top) grid.scrollTop -= g.top - t.top + 8;
	else if (t.bottom > g.bottom) grid.scrollTop += t.bottom - g.bottom + 8;
};

/** The pet picker: a grid on desktop, a sideways strip on phones. */
export const DexGrid = ({ pets, category, selectedId, onSelect }: DexGridProps) => {
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;
		grid.scrollTop = 0;
		grid.scrollLeft = 0;
	}, [category]);

	useEffect(() => {
		const grid = gridRef.current;
		const tile = grid?.querySelector<HTMLButtonElement>(`[data-id="${selectedId}"]`);
		if (!grid || !tile) return;
		keepVisible(grid, tile);
		// When stepping with the keyboard from inside the grid, keep focus on the selected pet.
		if (grid.contains(document.activeElement) && document.activeElement !== tile) tile.focus({ preventScroll: true });
	}, [selectedId]);

	return (
		<div className="pd-screen pd-grid" ref={gridRef} role="group" aria-label="Pets">
			{pets.length === 0 ? (
				<p className="pd-grid-empty">{category === "memorial" ? "No pets on the Rainbow Bridge yet." : "No pets here yet."}</p>
			) : (
				pets.map(pet => (
					<button
						key={pet.id}
						type="button"
						className="pd-tile"
						data-id={pet.id}
						aria-pressed={pet.id === selectedId}
						title={pet.name}
						onClick={() => onSelect(pet.id)}
					>
						{pet.iconUrl ? (
							<img src={pet.iconUrl} alt="" width={61} height={61} loading="lazy" />
						) : (
							<span className="pd-tile-missing" aria-hidden="true">
								<FaPaw />
							</span>
						)}
						<span className="pd-tile-no">{formatDexNumber(pet)}</span>
						<span className="pd-tile-name">{pet.name}</span>
					</button>
				))
			)}
		</div>
	);
};
