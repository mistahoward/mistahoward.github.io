import { renderIcon } from "../../utils/iconMap";
import { techIconName, techLabel } from "../../utils/technologies";

interface TechChipsProps {
	techs: string[];
	hiddenCount?: number;
	label?: string;
	labelledBy?: string;
	// With onToggleMore, "+N more" becomes a button that shows or hides the rest.
	onToggleMore?: () => void;
	expanded?: boolean;
	// Extra words for screen readers on that button, like "technologies for Team Lead".
	moreLabel?: string;
}

export const TechChips = ({ techs, hiddenCount = 0, label, labelledBy, onToggleMore, expanded = false, moreLabel }: TechChipsProps) => {
	const showToggle = !!onToggleMore && (hiddenCount > 0 || expanded);

	return (
		<ul className="tech-chip-list" aria-label={label} aria-labelledby={labelledBy}>
			{techs.map(tech => {
				const icon = renderIcon(techIconName(tech), 13, "");
				return (
					<li key={tech} className="tech-chip">
						{icon && (
							<span className="tech-chip-icon" aria-hidden="true">
								{icon}
							</span>
						)}
						<span>{techLabel(tech)}</span>
					</li>
				);
			})}
			{showToggle && (
				<li>
					<button type="button" className="tech-chip-toggle" aria-expanded={expanded} onClick={onToggleMore}>
						{expanded ? "Show fewer" : `+${hiddenCount} more`}
						{moreLabel && <span className="visually-hidden"> {moreLabel}</span>}
					</button>
				</li>
			)}
			{!onToggleMore && hiddenCount > 0 && (
				<li className="tech-chip-more">
					+{hiddenCount}
					<span className="visually-hidden"> more</span>
				</li>
			)}
		</ul>
	);
};
