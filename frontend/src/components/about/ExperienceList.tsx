import { useEffect, useState } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Experience } from "../../types/experience-list.types";
import { renderIcon, iconNameToLabel } from "../../utils/iconMap";
import { FaLinkedin } from "react-icons/fa";
import { LoadingSpinner } from "../../utils/ui";

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

	if (loading)
		return (
			<div className="tab-scroll-area d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;
	if (!experience.length) return <div>No experience found.</div>;

	const formatMonthYear = (dateStr?: string) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return dateStr;
		return date.toLocaleString("default", { month: "short", year: "numeric" });
	};

	const groupedByCompany = experience.reduce(
		(acc, exp) => {
			if (!acc[exp.company]) acc[exp.company] = [];
			acc[exp.company].push(exp);
			return acc;
		},
		{} as Record<string, Experience[]>
	);

	return (
		<div className="tab-scroll-area">
			{Object.entries(groupedByCompany).map(([company, roles]) => (
				<div className="card mb-3" key={company}>
					<div className="card-body">
						<h5 className="card-title text-secondary fw-bold">{company}</h5>
						<ul className="list-group list-group-flush">
							{roles.map(exp => (
								<li className="list-group-item" key={exp.id}>
									<span className="experience-title text-primary fw-bold">{exp.position}</span>
									<br />
									<span className="experience-date text-muted small">
										{formatMonthYear(exp.startDate)} - {exp.current ? "Present" : formatMonthYear(exp.endDate) || ""}
									</span>
									{exp.description &&
										(exp.description.includes("|") ? (
											<ul className="mt-1">
												{exp.description.split("|").map((point: string, idx: number) => (
													<li className="experience-desc-item" key={idx}>
														{point.trim()}
													</li>
												))}
											</ul>
										) : (
											<div className="mt-1">{exp.description}</div>
										))}
									{exp.technologies && (
										<div className="mt-1 text-muted small">
											Skills:&nbsp;
											{exp.technologies.split(/,|;/).map((tech: string) => {
												const t = tech.trim();
												return (
													<span key={t} className="me-2" title={iconNameToLabel[t.replace(/ /g, "")] || t}>
														{renderIcon(t.replace(/ /g, ""))}
													</span>
												);
											})}
										</div>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>
			))}
			<div className="mt-4 mb-2 d-flex justify-content-between align-items-center">
				<hr />
				<div className="footer-left-align">
					Want more info?&nbsp;
					<a href="/resume.pdf" download>
						Download my resume
					</a>
					.
				</div>
				<div>
					<button
						className="btn btn-outline-primary me-2"
						onClick={() => window.open("https://www.linkedin.com/in/jalexhoward/", "_blank")}
					>
						<FaLinkedin />
						&nbsp;LinkedIn
					</button>
				</div>
			</div>
		</div>
	);
};
