export interface ProjectTypeOption {
	value: string;
	label: string;
	count: number;
}

interface ProjectTypeFilterProps {
	options: ProjectTypeOption[];
	selected: string;
	onSelect: (value: string) => void;
}

// A radio group, since picking a type filters the list in place rather than going somewhere:
// one Tab stop, arrow keys move the choice. A list on desktop, wrapping pills on phones.
export const ProjectTypeFilter = ({ options, selected, onSelect }: ProjectTypeFilterProps) => (
	<fieldset className="project-type-filter">
		<legend className="project-type-filter-legend">Type</legend>
		<div className="project-type-options">
			{options.map(option => {
				const checked = option.value === selected;
				return (
					<label key={option.value} className={`project-type-option${checked ? " active" : ""}`}>
						<input
							type="radio"
							name="project-type"
							value={option.value}
							checked={checked}
							onChange={() => onSelect(option.value)}
							className="project-type-input"
						/>
						<span>{option.label}</span>
						<span className="project-type-count" aria-hidden="true">
							{option.count}
						</span>
						<span className="visually-hidden">
							, {option.count} {option.count === 1 ? "project" : "projects"}
						</span>
					</label>
				);
			})}
		</div>
	</fieldset>
);
