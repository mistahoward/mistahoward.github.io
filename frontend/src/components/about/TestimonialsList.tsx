import { useEffect, useState, useMemo } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Testimonial } from "../../types/testimonials-list.types";
import { LoadingSpinner } from "../../utils/ui";

function formatDate(dateStr?: string) {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return dateStr;
	return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const TestimonialsList = () => {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

	useEffect(() => {
		fetchItems<Testimonial>({
			endpoint: "/api/testimonials",
			onSuccess: setTestimonials,
			setLoading,
			setError,
		});
	}, []);

	const filteredTestimonials = useMemo(() => {
		const matchesSearch = (t: Testimonial) =>
			t.content.toLowerCase().includes(search.toLowerCase()) ||
			t.clientName.toLowerCase().includes(search.toLowerCase()) ||
			(t.relationship && t.relationship.toLowerCase().includes(search.toLowerCase()));
		const sorted = [...testimonials].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
		});
		return sorted.filter(matchesSearch);
	}, [testimonials, search, sortOrder]);

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
			<div className="d-flex align-items-center mb-3 gap-2" style={{ width: "100%" }}>
				<input
					type="text"
					className="form-control flex-grow-1"
					placeholder="Search testimonials..."
					value={search}
					onInput={e => setSearch((e.target as HTMLInputElement).value)}
					style={{ minWidth: 0 }}
				/>
				<button
					type="button"
					className="btn btn-outline-secondary d-flex align-items-center ms-2"
					onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
					title={`Sort by date (${sortOrder === "desc" ? "Latest" : "Oldest"} first)`}
				>
					{sortOrder === "desc" ? "Latest" : "Oldest"}
				</button>
			</div>
			<ul className="list-group">
				{filteredTestimonials.map(t => (
					<li className="list-group-item" key={t.id} style={{ marginBottom: "1.2rem", borderRadius: "0.5rem" }}>
						<div className="mb-1" style={{ fontSize: "1.1rem", fontWeight: 500 }}>
							{t.content}
						</div>
						<div className="text-muted small d-flex flex-wrap align-items-center gap-2">
							<div className="d-flex align-items-center gap-2" style={{ minWidth: "10rem" }}>
								<img
									src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.clientName)}&background=random&size=48&rounded=true`}
									alt={t.clientName}
									width={36}
									height={36}
									style={{ borderRadius: "50%", objectFit: "cover", background: "#eee" }}
								/>
								<span>
									— {t.clientName}
									{t.clientTitle && `, ${t.clientTitle}`}
									{t.clientCompany && ` (${t.clientCompany})`}
								</span>
							</div>
							{t.relationship && <span className="badge bg-light text-dark border ms-2">{t.relationship}</span>}
							<span className="ms-auto" style={{ fontSize: "0.95rem" }}>
								{formatDate(t.createdAt)}
							</span>
						</div>
					</li>
				))}
				{filteredTestimonials.length === 0 && (
					<li className="list-group-item text-center text-muted">No testimonials match your search.</li>
				)}
			</ul>
		</div>
	);
};
