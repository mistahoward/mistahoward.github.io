import { useEffect, useState, useMemo } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Project } from "../../types/data-manager.types";
import { renderIcon, iconNameToLabel } from "../../utils/iconMap";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { LoadingSpinner } from "../../utils/ui";
import { ProjectBadges } from "./ProjectBadges";

const projectTypes = ["All", "Personal", "Professional", "Academic"];
const TECH_PREVIEW_COUNT = 6;
const DESCRIPTION_CLAMP_CHARS = 220;
const TECH_CHIP_CLASS = "d-inline-flex align-items-center rounded-pill border bg-body-tertiary px-2 py-1";
const TECH_MORE_CLASS = `btn btn-sm text-muted small ${TECH_CHIP_CLASS}`;

export const ProjectList = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [selectedType, setSelectedType] = useState<string>("All");
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

	const toggleExpanded = (id: number) => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	useEffect(() => {
		fetchItems<Project>({
			endpoint: "/api/projects",
			onSuccess: setProjects,
			setLoading,
			setError,
		});
	}, []);

	const filteredProjects = useMemo(() => {
		const matchesSearch = (project: Project) =>
			project.name.toLowerCase().includes(search.toLowerCase()) ||
			(project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
			(project.technologies && project.technologies.toLowerCase().includes(search.toLowerCase()));

		const matchesType = (project: Project) => {
			if (selectedType === "All") return true;
			return project.projectType.toLowerCase() === selectedType.toLowerCase();
		};

		return projects.filter(project => matchesSearch(project) && matchesType(project));
	}, [projects, search, selectedType]);

	if (loading)
		return (
			<div className="tab-scroll-area d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;
	if (!projects.length) return <div>No projects found.</div>;

	const groupedByType = filteredProjects.reduce(
		(acc, project) => {
			if (!acc[project.projectType]) acc[project.projectType] = [];
			acc[project.projectType].push(project);
			return acc;
		},
		{} as Record<string, Project[]>
	);

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "personal":
				return "Personal Projects";
			case "professional":
				return "Professional Projects";
			case "academic":
				return "Academic Projects";
			default:
				return type.charAt(0).toUpperCase() + type.slice(1) + " Projects";
		}
	};

	const typeSortOrder = ["professional", "personal", "academic"];

	return (
		<div className="projects-container w-100" style={{ width: "100%" }}>
			<div className="projects-type-dropdown d-lg-none mb-3">
				<select
					className="form-select"
					value={selectedType}
					onChange={e => setSelectedType(e.currentTarget.value)}
					aria-label="Select Project Type"
				>
					{projectTypes.map(type => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
			<div className="mb-3 d-flex flex-wrap gap-2 d-none d-lg-flex">
				{projectTypes.map(type => (
					<button
						key={type}
						className={`btn btn-sm rounded-pill ${selectedType === type ? "btn-primary" : "btn-outline-secondary"}`}
						onClick={() => setSelectedType(type)}
						style={{ fontWeight: selectedType === type ? 600 : 400 }}
					>
						{type}
					</button>
				))}
			</div>

			<div className="d-flex align-items-center mb-3 gap-2" style={{ width: "100%" }}>
				<input
					type="text"
					className="form-control flex-grow-1"
					placeholder="Search projects..."
					value={search}
					onInput={e => setSearch((e.target as HTMLInputElement).value)}
					style={{ minWidth: 0 }}
				/>
			</div>

			<div className="tab-scroll-area">
				{Object.entries(groupedByType)
					.sort(([a], [b]) => {
						const idxA = typeSortOrder.indexOf(a.toLowerCase());
						const idxB = typeSortOrder.indexOf(b.toLowerCase());
						if (idxA === -1 && idxB === -1) return a.localeCompare(b);
						if (idxA === -1) return 1;
						if (idxB === -1) return -1;
						return idxA - idxB;
					})
					.map(([type, typeProjects]) => (
						<div className="card mb-3" key={type}>
							<div className="card-body">
								<h5 className="card-title text-secondary fw-bold">{getTypeLabel(type)}</h5>
								{typeProjects.map(project => {
									const techs = (project.technologies ?? "")
										.split(/,|;/)
										.map(t => t.trim())
										.filter(Boolean);
									const expanded = expandedIds.has(project.id);
									const hasMore =
										(project.description?.length ?? 0) > DESCRIPTION_CLAMP_CHARS || techs.length > TECH_PREVIEW_COUNT;
									const descriptionClass = `card-text small project-description${hasMore && !expanded ? " clamped" : ""}`;
									const visibleTechs = expanded ? techs : techs.slice(0, TECH_PREVIEW_COUNT);
									const hiddenTechCount = techs.length - visibleTechs.length;

									return (
										<div className="col-12 mb-4" key={project.id}>
											<div className="card">
												{project.imageUrl && (
													<img
														src={project.imageUrl}
														className="card-img-top"
														alt={project.name}
														style={{ height: "200px", objectFit: "cover" }}
													/>
												)}
												<div className="card-body">
													<h6 className="project-title card-title text-primary fw-bold mb-3">{project.name}</h6>
													<div className="row">
														<div className="col-md-8">
															{project.description && (
																<div className={descriptionClass}>{project.description}</div>
															)}
															{hasMore && (
																<button
																	type="button"
																	className="btn btn-link btn-sm p-0 mt-1 mb-3 mb-md-0"
																	onClick={() => toggleExpanded(project.id)}
																	aria-expanded={expanded}
																>
																	{expanded ? "Show less" : "Read more"}
																</button>
															)}
														</div>
														<div className="col-md-4">
															{techs.length > 0 && (
																<div className="text-muted small">
																	<div className="fw-bold mb-2">Technologies:</div>
																	<ul className="list-unstyled mb-0 d-flex flex-wrap gap-1">
																		{visibleTechs.map(t => {
																			const iconName = t.replace(/ /g, "");
																			const label = iconNameToLabel[iconName] || t;
																			return (
																				<li key={t} className={TECH_CHIP_CLASS}>
																					{renderIcon(iconName, 14, "me-1")}
																					<span>{label}</span>
																				</li>
																			);
																		})}
																		{hiddenTechCount > 0 && (
																			<li>
																				<button
																					type="button"
																					className={TECH_MORE_CLASS}
																					onClick={() => toggleExpanded(project.id)}
																				>
																					+{hiddenTechCount} more
																				</button>
																			</li>
																		)}
																	</ul>
																</div>
															)}
														</div>
													</div>
													<div className="d-flex flex-wrap gap-2 mt-3 align-items-center justify-content-end">
														<ProjectBadges
															githubUrl={project.githubUrl}
															nugetPackageId={project.nugetPackageId}
														/>
														{project.githubUrl && (
															<a
																href={project.githubUrl}
																target="_blank"
																rel="noopener noreferrer"
																className="btn btn-outline-secondary btn-sm"
															>
																<FaGithub />
																&nbsp;GitHub
															</a>
														)}
														{project.liveUrl && (
															<a
																href={project.liveUrl}
																target="_blank"
																rel="noopener noreferrer"
																className="btn btn-outline-primary btn-sm"
															>
																<FaExternalLinkAlt />
																&nbsp;Live Demo
															</a>
														)}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				{filteredProjects.length === 0 && (
					<div className="card">
						<div className="card-body text-center text-muted">
							<p className="mb-0">No projects found matching your criteria.</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
