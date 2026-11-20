export interface FilterOption {
	value: string;
	label: string;
	count: number;
}

interface FilterGroupProps {
	// The radio group's name, unique on the page.
	name: string;
	legend: string;
	// What the counts count, singular and plural: ["project", "projects"].
	noun: [string, string];
	options: FilterOption[];
	selected: string;
	onSelect: (value: string) => void;
	// "sidebar": a list with a visible legend on desktop (Projects). "pills": wrapping pills everywhere.
	variant?: "sidebar" | "pills";
	// Smaller pills on desktop, for tight spots like the About tab panel.
	compact?: boolean;
}

// A radio group, since picking an option filters a list in place rather than going somewhere:
// one Tab stop, arrow keys move the choice. Phones always get wrapping pills.
export const FilterGroup = ({ name, legend, noun, options, selected, onSelect, variant = "pills", compact = false }: FilterGroupProps) => (
	<fieldset className={`filter-group filter-group--${variant}${compact ? " filter-group--compact" : ""}`}>
		<legend className="filter-legend">{legend}</legend>
		<div className="filter-options">
			{options.map(option => {
				const checked = option.value === selected;
				return (
					<label key={option.value} className={`filter-option${checked ? " active" : ""}`}>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={checked}
							onChange={() => onSelect(option.value)}
							className="filter-input"
						/>
						<span>{option.label}</span>
						<span className="filter-count" aria-hidden="true">
							{option.count}
						</span>
						<span className="visually-hidden">
							, {option.count} {option.count === 1 ? noun[0] : noun[1]}
						</span>
					</label>
				);
			})}
		</div>
	</fieldset>
);
