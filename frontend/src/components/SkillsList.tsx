import React, { useEffect, useState } from "react";
import { fetchItems } from "../utils/crud";
import { YakShaverSpinner } from "./YakShaverSpinner";

interface Skill {
	id: number;
	name: string;
	category: string;
	proficiency: number;
	icon?: string;
}

export const SkillsList = () => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchItems<Skill>({
			endpoint: "/api/skills",
			onSuccess: setSkills,
			setLoading,
			setError,
		});
	}, []);

	if (loading) return <YakShaverSpinner />;
	if (error) return <div className="text-danger">{error}</div>;
	if (!skills.length) return <div>No skills found.</div>;

	return (
		<ul className="list-group">
			{skills.map(skill => (
				<li className="list-group-item d-flex align-items-center" key={skill.id}>
					{skill.icon && <img src={skill.icon} alt={skill.name} className="me-2" style={{ width: 24, height: 24 }} />}
					<span>{skill.name}</span>
					<span className="ms-auto text-muted small">
						{skill.category} | Proficiency: {skill.proficiency}
					</span>
				</li>
			))}
		</ul>
	);
};
