import { useEffect, useState, useMemo, useRef } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Project } from "../../types/data-manager.types";
import { LoadingSpinner } from "../../utils/ui";
import { ProjectCard, splitTechnologies, techLabel } from "./ProjectCard";
import { ProjectTypeFilter } from "./ProjectTypeFilter";

const TYPE_FILTERS = [
	{ value: "all", label: "All" },
	{ value: "personal", label: "Personal" },
	{ value: "professional", label: "Professional" },
	{ value: "academic", label: "Academic" },
];

// "All" lists professional work first. Any other type goes last, alphabetically.
const GROUP_ORDER = ["professional", "personal", "academic"];
const GROUP_LABELS: Record<string, string> = { professional: "Professional", personal: "Personal", academic: "Academic" };

const groupRank = (type: string) => {
	const rank = GROUP_ORDER.indexOf(type);
	return rank === -1 ? GROUP_ORDER.length : rank;
};

const groupLabel = (type: string) => GROUP_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);

const matchesSearch = (project: Project, query: string) => {
	if (!query) return true;
	const techs = splitTechnologies(project.technologies);
	return [project.name, project.description ?? "", ...techs, ...techs.map(techLabel)].some(field => field.toLowerCase().includes(query));
};

const describeResults = (count: number, type: string, query: string) => {
	const typeWord = type === "all" ? "" : `${type} `;
	const noun = count === 1 ? "project" : "projects";
	if (query)
		return count
			? `${count} ${typeWord}${noun} ${count === 1 ? "matches" : "match"} “${query}”`
			: `No ${typeWord}projects match “${query}”`;
	return type === "all" ? `Showing all ${count} ${noun}` : `Showing ${count} ${typeWord}${noun}`;
};

export const ProjectList = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [selectedType, setSelectedType] = useState("all");
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
	const [announcement, setAnnouncement] = useState("");
	const resultsRef = useRef<HTMLDivElement>(null);
	const hasInteracted = useRef(false);

	useEffect(() => {
		fetchItems<Project>({
			endpoint: "/api/projects",
			onSuccess: setProjects,
			setLoading,
			setError,
		});
	}, []);

	const query = search.trim();
	const matches = useMemo(() => projects.filter(project => matchesSearch(project, query.toLowerCase())), [projects, query]);

	const typeOptions = useMemo(
		() =>
			TYPE_FILTERS.map(({ value, label }) => ({
				value,
				label,
				count: value === "all" ? matches.length : matches.filter(project => project.projectType.toLowerCase() === value).length,
			})),
		[matches]
	);

	const groups = useMemo(() => {
		const byType = new Map<string, Project[]>();
		matches.forEach(project => {
			const type = project.projectType.toLowerCase();
			if (selectedType !== "all" && type !== selectedType) return;
			byType.set(type, [...(byType.get(type) ?? []), project]);
		});
		return [...byType.entries()]
			.sort(([a], [b]) => groupRank(a) - groupRank(b) || a.localeCompare(b))
			.map(([type, items]) => ({ type, items }));
	}, [matches, selectedType]);

	const shownCount = groups.reduce((sum, group) => sum + group.items.length, 0);
	const status = describeResults(shownCount, selectedType, query);

	// Tell screen readers what a filter or search change did, once typing pauses. Nothing on first load.
	useEffect(() => {
		if (!hasInteracted.current) return undefined;
		const timer = window.setTimeout(() => setAnnouncement(status), 400);
		return () => window.clearTimeout(timer);
	}, [status]);

	const selectType = (type: string) => {
		hasInteracted.current = true;
		setSelectedType(type);
		if (resultsRef.current) resultsRef.current.scrollTop = 0;
	};

	const updateSearch = (value: string) => {
		hasInteracted.current = true;
		setSearch(value);
	};

	const toggleExpanded = (id: number) => {
		setExpandedIds(prev => {
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
	if (!projects.length) return <div>No projects found.</div>;

	return (
		<div className="projects-pane">
			<div className="projects-sidebar">
				<label className="visually-hidden" htmlFor="project-search">
					Search projects
				</label>
				<input
					id="project-search"
					type="search"
					className="form-control projects-search"
					placeholder="Search projects"
					value={search}
					onInput={e => updateSearch((e.target as HTMLInputElement).value)}
				/>
				<ProjectTypeFilter options={typeOptions} selected={selectedType} onSelect={selectType} />
			</div>

			<div className="projects-results" ref={resultsRef}>
				<p className="visually-hidden" role="status" aria-live="polite">
					{announcement}
				</p>
				{groups.map(group => (
					<section key={group.type} className="project-group" aria-labelledby={`project-group-${group.type}`}>
						<h3 id={`project-group-${group.type}`} className="project-group-heading">
							{groupLabel(group.type)}
							<span aria-hidden="true"> · {group.items.length}</span>
						</h3>
						<div className="project-group-list">
							{group.items.map(project => (
								<ProjectCard
									key={project.id}
									project={project}
									expanded={expandedIds.has(project.id)}
									onToggle={toggleExpanded}
								/>
							))}
						</div>
					</section>
				))}
				{shownCount === 0 && (
					<div className="project-empty">
						<p className="mb-2">{status}.</p>
						{query && (
							<button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => updateSearch("")}>
								Clear search
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
