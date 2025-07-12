import { useEffect, useState } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { YakShaverSpinner } from "../shared/YakShaverSpinner";
import { Experience } from "../../types/experience-list.types";
import { renderIcon, iconNameToLabel } from "../../utils/iconMap";

export const ExperienceList = () => {
	const [experience, setExperience] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchItems<Experience>({
			endpoint: "/api/experience",
			onSuccess: setExperience,
			setLoading,
			setError,
		});
	}, []);

	if (loading) return <YakShaverSpinner />;
	if (error) return <div className="text-danger">{error}</div>;
	if (!experience.length) return <div>No experience found.</div>;

	const formatMonthYear = (dateStr?: string) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return dateStr;
		return date.toLocaleString("default", { month: "short", year: "numeric" });
	};

	return (
		<ul className="list-group">
			{experience.map((exp: Experience) => (
				<li className="list-group-item" key={exp.id}>
					<span className="text-primary fw-bold">{exp.position}</span> at{" "}
					<span className="text-secondary fw-bold">{exp.company}</span>
					<br />
					<span className="text-muted small">
						{formatMonthYear(exp.startDate)} - {exp.current ? "Present" : formatMonthYear(exp.endDate) || ""}
					</span>
					{exp.description && <div className="mt-1">{exp.description}</div>}
					{exp.technologies && (
						<div className="mt-1 text-muted small">
							Skills:&nbsp;
							{exp.technologies.split(/,|;/).map((tech: string) => {
								const t = tech.trim();
								const label = iconNameToLabel[t.replace(/ /g, "")] || t;
								return (
									<span key={t} className="me-2" title={label}>
										{renderIcon(t.replace(/ /g, ""))}
									</span>
								);
							})}
						</div>
					)}
				</li>
			))}
		</ul>
	);
};
