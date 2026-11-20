import { useEffect, useState, useMemo } from "preact/hooks";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaSortAmountUp, FaSortAmountDownAlt } from "react-icons/fa";
import { fetchItems } from "../../utils/crud";
import { Skill } from "../../types/skills-list.types";
import { renderIcon } from "../../utils/iconMap";
import { LoadingSpinner, capitalizeFirst } from "../../utils/ui";
import { useAnnouncement } from "../../utils/useAnnouncement";
import { FilterGroup } from "../shared/FilterGroup";
import { ShowAllToggle, phoneExtraClass } from "../shared/ShowAllToggle";

const CATEGORY_LABELS: Record<string, string> = {
	frontend: "Frontend",
	backend: "Backend",
	"full-stack": "Full-Stack",
	devops: "DevOps",
	database: "Database",
	mobile: "Mobile",
	other: "Other",
};
const CATEGORY_FILTERS = ["all", "frontend", "backend", "full-stack", "devops", "database", "mobile", "other"];

// Phones show this many skills, then "Show all".
const PHONE_PREVIEW = 8;

const categoryLabel = (category: string) => (category === "all" ? "All" : (CATEGORY_LABELS[category] ?? capitalizeFirst(category)));

// Frontend and Backend also list Full-Stack skills.
const inCategory = (skill: Skill, category: string) => {
	const own = skill.category.toLowerCase();
	if (category === "all") return true;
	if (category === "frontend" || category === "backend") return own === category || own === "full-stack";
	return own === category;
};

const describeResults = (count: number, category: string, query: string) => {
	const categoryWord = category === "all" ? "" : `${categoryLabel(category)} `;
	const noun = count === 1 ? "skill" : "skills";
	if (query)
		return count
			? `${count} ${categoryWord}${noun} ${count === 1 ? "matches" : "match"} “${query}”`
			: `No ${categoryWord}skills match “${query}”`;
	return category === "all" ? `Showing all ${count} ${noun}` : `Showing ${count} ${categoryWord}${noun}`;
};

const Stars = ({ proficiency }: { proficiency: number }) => (
	<span className="skill-stars">
		<span className="visually-hidden">{proficiency} out of 5</span>
		{Array.from({ length: 5 }, (_, i) => (
			<span key={i} className={i < proficiency ? "skill-star-on" : "skill-star-off"} aria-hidden="true">
				{i < proficiency ? <AiFillStar /> : <AiOutlineStar />}
			</span>
		))}
	</span>
);

export const SkillsList = () => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		fetchItems<Skill>({
			endpoint: "/api/skills",
			onSuccess: setSkills,
			setLoading,
			setError,
		});
	}, []);

	const query = search.trim();
	const matches = useMemo(() => {
		const q = query.toLowerCase();
		return skills.filter(
			skill => !q || skill.name.toLowerCase().includes(q) || categoryLabel(skill.category.toLowerCase()).toLowerCase().includes(q)
		);
	}, [skills, query]);

	const categoryOptions = useMemo(
		() =>
			CATEGORY_FILTERS.map(value => ({
				value,
				label: categoryLabel(value),
				count: matches.filter(skill => inCategory(skill, value)).length,
			})),
		[matches]
	);

	const list = useMemo(
		() =>
			matches
				.filter(skill => inCategory(skill, selectedCategory))
				.sort((a, b) => (sortOrder === "asc" ? a.proficiency - b.proficiency : b.proficiency - a.proficiency)),
		[matches, selectedCategory, sortOrder]
	);

	const status = describeResults(list.length, selectedCategory, query);
	const { announcement, markInteracted } = useAnnouncement(status);

	const selectCategory = (category: string) => {
		markInteracted();
		setSelectedCategory(category);
		setShowAll(false);
	};

	const updateSearch = (value: string) => {
		markInteracted();
		setSearch(value);
	};

	if (loading)
		return (
			<div className="d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;

	return (
		<div className="about-tab-content">
			<div className="about-toolbar">
				<label className="visually-hidden" htmlFor="skill-search">
					Search skills
				</label>
				<input
					id="skill-search"
					type="search"
					className="form-control about-search"
					placeholder="Search skills"
					value={search}
					onInput={e => updateSearch((e.target as HTMLInputElement).value)}
				/>
				<button type="button" className="about-sort" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
					<span className="about-sort-icon" aria-hidden="true">
						{sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDownAlt />}
					</span>
					<span className="visually-hidden">Sort by rating: </span>
					{sortOrder === "asc" ? "Lowest" : "Highest"}
					<span className="visually-hidden"> rated first</span>
				</button>
			</div>

			<FilterGroup
				name="skill-category"
				legend="Category"
				noun={["skill", "skills"]}
				options={categoryOptions}
				selected={selectedCategory}
				onSelect={selectCategory}
				compact
			/>

			<p className="visually-hidden" role="status" aria-live="polite">
				{announcement}
			</p>

			<div id="skill-results" className="about-scroll">
				{list.length > 0 ? (
					<ul className="skill-list">
						{list.map((skill, index) => {
							const category = skill.category.toLowerCase();
							// The category only adds something in All, or for a Full-Stack skill under Frontend or Backend.
							const showCategory = selectedCategory === "all" || category !== selectedCategory;
							return (
								<li key={skill.id} className={`skill-row${phoneExtraClass(index, PHONE_PREVIEW, showAll)}`}>
									<span className="skill-icon" aria-hidden="true">
										{skill.icon && renderIcon(skill.icon, 20, "")}
									</span>
									<span className="skill-name">{skill.name}</span>
									{showCategory && <span className="skill-category">{categoryLabel(category)}</span>}
									<Stars proficiency={skill.proficiency} />
								</li>
							);
						})}
					</ul>
				) : (
					<div className="about-empty">
						<p className="mb-2">{status}.</p>
						{query && (
							<button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => updateSearch("")}>
								Clear search
							</button>
						)}
					</div>
				)}
				{list.length > PHONE_PREVIEW && (
					<ShowAllToggle
						phoneOnly
						expanded={showAll}
						total={list.length}
						noun="skills"
						controls="skill-results"
						onToggle={() => setShowAll(!showAll)}
					/>
				)}
			</div>
		</div>
	);
};
