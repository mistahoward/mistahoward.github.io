import { useEffect, useState } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Testimonial } from "../../types/testimonials-list.types";
import { LoadingSpinner } from "../../utils/ui";

export const TestimonialsList = () => {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchItems<Testimonial>({
			endpoint: "/api/testimonials",
			onSuccess: setTestimonials,
			setLoading,
			setError,
		});
	}, []);

	if (loading)
		return (
			<div className="tab-scroll-area d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;
	if (!testimonials.length) return <div>No testimonials found.</div>;

	return (
		<div className="tab-scroll-area">
			<ul className="list-group">
				{testimonials.map((t: Testimonial) => (
					<li className="list-group-item" key={t.id}>
						<div className="mb-1">{t.content}</div>
						<div className="text-muted small">
							— {t.clientName}
							{t.clientTitle && `, ${t.clientTitle}`}
							{t.clientCompany && ` (${t.clientCompany})`}
							{t.rating && <span className="ms-2">{"★".repeat(t.rating)}</span>}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};
