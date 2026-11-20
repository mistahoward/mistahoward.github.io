import { useEffect, useState } from "preact/hooks";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { fetchItems } from "../../utils/crud";
import { Experience } from "../../types/experience-list.types";
import { LoadingSpinner, formatMonthYear, parseDate } from "../../utils/ui";
import { splitTechnologies } from "../../utils/technologies";
import { TechChips } from "../shared/TechChips";
import { ShowAllToggle, phoneExtraClass } from "../shared/ShowAllToggle";

const TECH_PREVIEW = 6;
// Phones show the latest roles, then "Show all".
const PHONE_PREVIEW = 2;

// "1 yr 4 mos", counting both the first and last month, the way LinkedIn does.
const duration = (start: Date, end: Date) => {
	const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
	const years = Math.floor(months / 12);
	const rest = months % 12;
	const parts = [];
	if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
	if (rest) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
	return parts.join(" ");
};

interface Role extends Experience {
	start: Date;
	end: Date;
	index: number;
}

interface Company {
	name: string;
	roles: Role[];
	start: Date;
	end: Date;
}

// Keeps the API's newest-first order, and a company's roles together under it.
const groupByCompany = (experience: Experience[]) => {
	const companies: Company[] = [];
	experience.forEach((exp, index) => {
		const start = parseDate(exp.startDate);
		const end = exp.current || !exp.endDate ? new Date() : parseDate(exp.endDate);
		let company = companies.find(c => c.name === exp.company);
		if (!company) {
			company = { name: exp.company, roles: [], start, end };
			companies.push(company);
		}
		if (start < company.start) company.start = start;
		if (end > company.end) company.end = end;
		company.roles.push({ ...exp, start, end, index });
	});
	return companies;
};

export const ExperienceList = () => {
	const [experience, setExperience] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [openTech, setOpenTech] = useState<Set<number>>(new Set());
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		fetchItems<Experience>({
			endpoint: "/api/experience",
			onSuccess: setExperience,
			setLoading,
			setError,
		});
	}, []);

	const toggleTech = (id: number) => {
		setOpenTech(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	if (loading)
		return (
			<div className="d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;
	if (!experience.length) return <div>No experience found.</div>;

	const companies = groupByCompany(experience);

	return (
		<div className="about-tab-content">
			<div id="experience-timeline" className="about-scroll">
				{companies.map(company => {
					const headingId = `experience-company-${company.roles[0].id}`;
					return (
						<section
							key={company.name}
							className={`experience-company${phoneExtraClass(company.roles[0].index, PHONE_PREVIEW, showAll)}`}
							aria-labelledby={headingId}
						>
							<h3 id={headingId} className="experience-company-name">
								{company.name}
								<span className="experience-company-span">
									{formatMonthYear(company.roles[company.roles.length - 1].startDate)} –{" "}
									{company.roles[0].current ? "Present" : formatMonthYear(company.roles[0].endDate)} ·{" "}
									{duration(company.start, company.end)}
								</span>
							</h3>
							<ol className="experience-roles">
								{company.roles.map(role => {
									const techs = splitTechnologies(role.technologies);
									const techOpen = openTech.has(role.id);
									const points = (role.description ?? "")
										.split("|")
										.map(point => point.trim())
										.filter(Boolean);
									const latest = role.index === 0 ? " latest" : "";
									const phoneExtra = phoneExtraClass(role.index, PHONE_PREVIEW, showAll);
									return (
										<li key={role.id} className={`experience-role${latest}${phoneExtra}`}>
											<h4 className="experience-title">{role.position}</h4>
											<p className="experience-date">
												{formatMonthYear(role.startDate)} –{" "}
												{role.current ? "Present" : formatMonthYear(role.endDate)} ·{" "}
												{duration(role.start, role.end)}
											</p>
											{points.length > 1 ? (
												<ul className="experience-points">
													{points.map((point, index) => (
														<li key={index} className="experience-desc-item">
															{point}
														</li>
													))}
												</ul>
											) : (
												points.length === 1 && <p className="experience-desc-item mb-0">{points[0]}</p>
											)}
											{techs.length > 0 && (
												<TechChips
													techs={techOpen ? techs : techs.slice(0, TECH_PREVIEW)}
													hiddenCount={techs.length - TECH_PREVIEW}
													label="Technologies"
													expanded={techOpen}
													onToggleMore={() => toggleTech(role.id)}
													moreLabel={`technologies for ${role.position}`}
												/>
											)}
										</li>
									);
								})}
							</ol>
						</section>
					);
				})}
				{experience.length > PHONE_PREVIEW && (
					<ShowAllToggle
						phoneOnly
						expanded={showAll}
						total={experience.length}
						noun="roles"
						controls="experience-timeline"
						onToggle={() => setShowAll(!showAll)}
					/>
				)}
			</div>

			<div className="experience-footer">
				<span>Want the full picture?</span>
				<div className="experience-footer-links">
					<a href="/resume.pdf" download="Jay-Howard-Resume.pdf" className="about-button about-button--primary">
						<span className="about-button-icon" aria-hidden="true">
							<FaDownload />
						</span>
						Résumé (PDF)
					</a>
					<a href="https://www.linkedin.com/in/jalexhoward/" target="_blank" rel="noopener noreferrer" className="about-button">
						LinkedIn
						<span className="visually-hidden">, opens in a new tab</span>
						<span className="about-button-icon" aria-hidden="true">
							<FaExternalLinkAlt />
						</span>
					</a>
				</div>
			</div>
		</div>
	);
};
