import { memo } from "preact/compat";
import { Pet } from "../../types/pet-manager.types";
import { DEX_PAGES, DexPage, parseMoves, parseQuotedList, parseStats, statLabel } from "../../utils/petdex";

interface DexPagesProps {
	/** Every pet, not just the current category: all their pages are stacked to reserve one fixed height. */
	pets: Pet[];
	activeId: number | null;
	page: DexPage;
	onPageChange: (page: DexPage) => void;
}

const paragraphs = (text?: string) =>
	(text || "")
		.split(/\n\s*\n/)
		.map(part => part.trim())
		.filter(Boolean);

const Fact = ({ label, value }: { label: string; value?: string }) => (
	<div>
		<dt className="pd-label">{label}</dt>
		<dd>{value || "Unknown"}</dd>
	</div>
);

const PageContent = memo(({ pet, page }: { pet: Pet; page: DexPage }) => {
	if (page === "info") {
		const traits = parseQuotedList(pet.personality);
		return (
			<>
				{paragraphs(pet.description).map((text, i) => (
					<p key={i}>{text}</p>
				))}
				<dl className="pd-facts">
					<Fact label="Breed" value={pet.breed} />
					<Fact label="Color" value={pet.color} />
					<Fact label="Favorite food" value={pet.favoriteFood} />
					<Fact label="Favorite toy" value={pet.favoriteToy} />
				</dl>
				{traits.length > 0 && (
					<>
						<span className="pd-label">Personality</span>
						<div className="pd-chips">
							{traits.map(trait => (
								<span key={trait} className="pd-chip">
									{trait}
								</span>
							))}
						</div>
					</>
				)}
			</>
		);
	}

	if (page === "story") {
		const story = paragraphs(pet.originStory);
		return (
			<>
				<span className="pd-label">Origin story</span>
				{story.length ? story.map((text, i) => <p key={i}>{text}</p>) : <p>No story yet.</p>}
			</>
		);
	}

	const stats = parseStats(pet.stats);
	const moves = parseMoves(pet.specialAbilities);
	const total = stats.reduce((sum, [, value]) => sum + value, 0);
	return (
		<>
			{stats.length > 0 && (
				<>
					<div className="pd-bars">
						{stats.map(([key, value]) => {
							const { label, tone } = statLabel(key);
							return (
								<div key={key} className="pd-bar">
									<b>{label}</b>
									<div className="pd-track">
										<div className={`pd-fill pd-fill--${tone}`} style={{ width: `${value}%` }} />
									</div>
									<span className="pd-bar-value">{value}</span>
								</div>
							);
						})}
					</div>
					<div className="pd-total">
						<span>Total</span>
						<span>{total}</span>
					</div>
				</>
			)}
			{moves.length > 0 && (
				<>
					<span className="pd-label">Moves</span>
					<ul className="pd-moves">
						{moves.map(move => (
							<li key={move.name}>
								<strong>{move.name}</strong>
								{move.description && <span>{move.description}</span>}
							</li>
						))}
					</ul>
				</>
			)}
		</>
	);
});

/** The right-hand data screen: Info, Story and Stats pages for the selected pet. */
export const DexPages = ({ pets, activeId, page, onPageChange }: DexPagesProps) => {
	const pageIndex = DEX_PAGES.findIndex(p => p.key === page);
	return (
		<div className="pd-screen pd-data">
			<div className="pd-tabs" role="tablist" aria-label="Pages">
				{DEX_PAGES.map(p => (
					<button
						key={p.key}
						type="button"
						role="tab"
						id={`pd-tab-${p.key}`}
						className="pd-tab"
						aria-selected={p.key === page}
						aria-controls="pd-pages"
						tabIndex={p.key === page ? 0 : -1}
						onClick={() => onPageChange(p.key)}
					>
						{p.label}
					</button>
				))}
				<span className="pd-page-no" aria-hidden="true">
					{pageIndex + 1}/{DEX_PAGES.length}
				</span>
			</div>
			<div className="pd-pages" id="pd-pages">
				{pets.flatMap(pet =>
					DEX_PAGES.map(p => {
						const active = pet.id === activeId && p.key === page;
						return (
							<div
								key={`${pet.id}-${p.key}`}
								className={`pd-page${active ? " is-active" : ""}`}
								role={active ? "tabpanel" : undefined}
								aria-labelledby={active ? `pd-tab-${p.key}` : undefined}
								aria-hidden={!active}
							>
								<PageContent pet={pet} page={p.key} />
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};
