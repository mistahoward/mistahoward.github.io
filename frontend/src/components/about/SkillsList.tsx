import { useEffect, useState, useMemo } from "preact/hooks";
import { fetchItems } from "../../utils/crud";
import { Skill } from "../../types/skills-list.types";
import { renderIcon } from "../../utils/iconMap";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaSortAmountUp, FaSortAmountDownAlt } from "react-icons/fa";
import { LoadingSpinner } from "../../utils/ui";

const categories = ["All", "Frontend", "Backend", "Full-Stack", "DevOps", "Database", "Mobile", "Other"];

export const SkillsList = () => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");

	useEffect(() => {
		fetchItems<Skill>({
			endpoint: "/api/skills",
			onSuccess: setSkills,
			setLoading,
			setError,
		});
	}, []);

	const renderStars = (proficiency: number) => (
		<span>
			{Array.from({ length: 5 }, (_, i) =>
				i < proficiency ? <AiFillStar key={i} color="#f5c518" /> : <AiOutlineStar key={i} color="#ccc" />
			)}
		</span>
	);

	const filteredSkills = useMemo(() => {
		const matchesSearch = (skill: Skill) =>
			skill.name.toLowerCase().includes(search.toLowerCase()) || skill.category.toLowerCase().includes(search.toLowerCase());

		const matchesCategory = (skill: Skill) => {
			if (selectedCategory === "All") return true;

			const cat = skill.category.toLowerCase();
			const sel = selectedCategory.toLowerCase();

			switch (sel) {
				case "frontend":
				case "backend":
					return cat === sel || cat === "full-stack";
				case "full-stack":
					return cat === "full-stack";
				default:
					return cat === sel;
			}
		};

		const sortSkills = (a: Skill, b: Skill) => (sortOrder === "asc" ? a.proficiency - b.proficiency : b.proficiency - a.proficiency);

		return skills.filter(skill => matchesSearch(skill) && matchesCategory(skill)).sort(sortSkills);
	}, [skills, search, sortOrder, selectedCategory]);

	if (loading)
		return (
			<div className="tab-scroll-area d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;

	return (
		<div className="skills-container w-100" style={{ width: "100%" }}>
			{/* Mobile Dropdown for Categories */}
			<div className="skills-category-dropdown d-lg-none mb-3">
				<select
					className="form-select"
					value={selectedCategory}
					onChange={e => setSelectedCategory(e.currentTarget.value)}
					aria-label="Select Skill Category"
				>
					{categories.map(category => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>
			{/* Desktop Category Chips */}
			<div className="mb-3 d-flex flex-wrap gap-2 d-none d-lg-flex">
				{categories.map(category => (
					<button
						key={category}
						className={`btn btn-sm rounded-pill ${selectedCategory === category ? "btn-primary" : "btn-outline-secondary"}`}
						onClick={() => setSelectedCategory(category)}
						style={{ fontWeight: selectedCategory === category ? 600 : 400 }}
					>
						{category}
					</button>
				))}
			</div>

			<div className="d-flex align-items-center mb-3 gap-2" style={{ width: "100%" }}>
				<input
					type="text"
					className="form-control flex-grow-1"
					placeholder="Search skills..."
					value={search}
					onInput={e => setSearch((e.target as HTMLInputElement).value)}
					style={{ minWidth: 0 }}
				/>
				<button
					type="button"
					className="btn btn-outline-secondary d-flex align-items-center ms-2"
					onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
					title={`Sort by proficiency (${sortOrder === "asc" ? "Low to High" : "High to Low"})`}
				>
					{sortOrder === "asc" ? <FaSortAmountUp size={20} /> : <FaSortAmountDownAlt size={20} />}
				</button>
			</div>
			<div style={{ maxHeight: 350, overflowY: "auto", width: "100%" }}>
				<ul className="list-group w-100">
					{filteredSkills.length === 0 && <li className="list-group-item">No skills found.</li>}
					{filteredSkills.map((skill: Skill) => (
						<li className="list-group-item skills-list-item" key={skill.id}>
							{skill.icon && <span className="skills-list-icon">{renderIcon(skill.icon)}</span>}
							<span className="skills-list-name">{skill.name}</span>
							<span className="skills-list-category text-muted small">{skill.category}</span>
							<span className="skills-list-stars">{renderStars(skill.proficiency)}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
