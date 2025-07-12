import React, { useEffect, useState } from "react";
import { fetchItems } from "../../utils/crud";
import { YakShaverSpinner } from "../shared/YakShaverSpinner";
import { Experience } from "../../types/experience-list.types";

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

	return (
		<ul className="list-group">
			{experience.map(exp => (
				<li className="list-group-item" key={exp.id}>
					<strong>{exp.position}</strong> at <span>{exp.company}</span>
					<br />
					<span className="text-muted small">
						{exp.startDate} - {exp.current ? "Present" : exp.endDate || ""}
					</span>
					{exp.description && <div className="mt-1">{exp.description}</div>}
					{exp.technologies && <div className="mt-1 text-muted small">Tech: {exp.technologies}</div>}
				</li>
			))}
		</ul>
	);
};
