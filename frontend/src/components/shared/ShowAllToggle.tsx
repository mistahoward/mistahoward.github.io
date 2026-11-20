import { FaChevronDown } from "react-icons/fa";

interface ShowAllToggleProps {
	expanded: boolean;
	total: number;
	noun: string;
	controls: string;
	onToggle: () => void;
	// Phones only: desktop shows the whole list in its own scroll box instead.
	phoneOnly?: boolean;
}

// "Show all 17 projects" / "Show fewer", for lists that show a short preview first.
export const ShowAllToggle = ({ expanded, total, noun, controls, onToggle, phoneOnly = false }: ShowAllToggleProps) => (
	<div className={`show-all${phoneOnly ? " show-all--phone" : ""}`}>
		<button type="button" className="show-all-button" aria-expanded={expanded} aria-controls={controls} onClick={onToggle}>
			{expanded ? "Show fewer" : `Show all ${total} ${noun}`}
			<span className="show-all-icon" aria-hidden="true">
				<FaChevronDown />
			</span>
		</button>
	</div>
);

// The class for an item past the preview: hidden on phones until "Show all" is pressed.
export const phoneExtraClass = (index: number, preview: number, expanded: boolean) =>
	!expanded && index >= preview ? " is-phone-extra" : "";
