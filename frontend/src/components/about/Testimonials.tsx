import { useEffect, useState, useMemo } from "preact/hooks";
import { FaQuoteLeft } from "react-icons/fa";
import { fetchItems } from "../../utils/crud";
import { Testimonial } from "../../types/testimonials-list.types";
import { formatMonthYear } from "../../utils/ui";
import { ShowAllToggle } from "../shared/ShowAllToggle";

// Shown before "Show all", at every width.
const PREVIEW = 3;

// "Previous Co-Worker - Peer -> Direct Report" becomes "Peer → Direct Report".
const relationshipLabel = (relationship?: string) =>
	(relationship ?? "")
		.replace(/^(previous\s+)?co-?worker\s*-\s*/i, "")
		.replace(/\s*->\s*/g, " → ")
		.trim();

const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(word => /^[A-Za-z]/.test(word))
		.slice(0, 2)
		.map(word => word[0].toUpperCase())
		.join("");

const timestamp = (value: string) => new Date(value.replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T")).getTime() || 0;

// A band at the bottom of the About section, so testimonials are on the page instead of behind a tab.
export const Testimonials = () => {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		fetchItems<Testimonial>({ endpoint: "/api/testimonials", onSuccess: setTestimonials });
	}, []);

	const newestFirst = useMemo(() => [...testimonials].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt)), [testimonials]);

	if (!newestFirst.length) return null;

	const shown = expanded ? newestFirst : newestFirst.slice(0, PREVIEW);

	return (
		<section className="testimonials" aria-labelledby="testimonials-heading">
			<h3 id="testimonials-heading" className="testimonials-heading">
				What coworkers say
			</h3>
			<p className="testimonials-intro">From {newestFirst.length} people I’ve worked with.</p>
			<ul id="testimonial-list" className="testimonial-grid">
				{shown.map(t => {
					const role = [t.clientTitle, t.clientCompany].filter(Boolean).join(", ");
					const meta = [relationshipLabel(t.relationship), formatMonthYear(t.createdAt)].filter(Boolean).join(" · ");
					return (
						<li key={t.id} className="testimonial-item">
							<figure className="testimonial-card">
								<span className="testimonial-quote-mark" aria-hidden="true">
									<FaQuoteLeft />
								</span>
								<blockquote className="testimonial-content">
									<p>{t.content.trim()}</p>
								</blockquote>
								<figcaption className="testimonial-person">
									<span className="testimonial-avatar" aria-hidden="true">
										{initials(t.clientName)}
									</span>
									<span className="testimonial-person-text">
										<span className="testimonial-name">{t.clientName}</span>
										{role && <span className="testimonial-role">{role}</span>}
										{meta && <span className="testimonial-meta">{meta}</span>}
									</span>
								</figcaption>
							</figure>
						</li>
					);
				})}
			</ul>
			{newestFirst.length > PREVIEW && (
				<ShowAllToggle
					expanded={expanded}
					total={newestFirst.length}
					noun="testimonials"
					controls="testimonial-list"
					onToggle={() => setExpanded(!expanded)}
				/>
			)}
		</section>
	);
};
