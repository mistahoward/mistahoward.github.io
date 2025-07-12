import { useState, useEffect } from "preact/hooks";
import { Project, Skill, Experience, Testimonial, DataManagerProps } from "../../types/data-manager.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../utils/crud";
import { LoadingSpinner, ErrorAlert, formatDate } from "../../utils/ui";

export const DataManager = ({ lastFocusTime = 0 }: DataManagerProps) => {
	const [activeTab, setActiveTab] = useState<"projects" | "skills" | "experience" | "testimonials">("projects");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [projects, setProjects] = useState<Project[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [experience, setExperience] = useState<Experience[]>([]);
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

	const [isCreating, setIsCreating] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);

	const [projectForm, setProjectForm] = useState({
		name: "",
		description: "",
		projectType: "personal",
		technologies: "",
		githubUrl: "",
		liveUrl: "",
		imageUrl: "",
	});

	const [skillForm, setSkillForm] = useState({
		name: "",
		category: "",
		proficiency: 3,
		icon: "",
	});

	const [experienceForm, setExperienceForm] = useState({
		company: "",
		position: "",
		description: "",
		startDate: "",
		endDate: "",
		current: false,
		technologies: "",
	});

	const [testimonialForm, setTestimonialForm] = useState({
		clientName: "",
		clientTitle: "",
		clientCompany: "",
		content: "",
		rating: 5,
		projectId: "",
		approved: false,
	});

	const fetchData = async () => {
		try {
			const [projectsData, skillsData, experienceData, testimonialsData] = await Promise.all([
				fetchItems({ endpoint: "/api/admin/projects", setError }),
				fetchItems({ endpoint: "/api/admin/skills", setError }),
				fetchItems({ endpoint: "/api/admin/experience", setError }),
				fetchItems({ endpoint: "/api/admin/testimonials", setError }),
			]);

			if (projectsData) setProjects(projectsData as Project[]);
			if (skillsData) setSkills(skillsData as Skill[]);
			if (experienceData) setExperience(experienceData as Experience[]);
			if (testimonialsData) setTestimonials(testimonialsData as Testimonial[]);
		} catch (err) {
			setError("Failed to fetch data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (lastFocusTime > 0) fetchData();
	}, [lastFocusTime]);

	const handleCreate = () => {
		setIsCreating(true);
		setEditingItem(null);
		resetForms();
	};

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setIsCreating(false);

		switch (activeTab) {
			case "projects":
				setProjectForm({
					name: item.name,
					description: item.description || "",
					projectType: item.projectType,
					technologies: item.technologies || "",
					githubUrl: item.githubUrl,
					liveUrl: item.liveUrl || "",
					imageUrl: item.imageUrl || "",
				});
				break;
			case "skills":
				setSkillForm({
					name: item.name,
					category: item.category,
					proficiency: item.proficiency,
					icon: item.icon || "",
				});
				break;
			case "experience":
				setExperienceForm({
					company: item.company,
					position: item.position,
					description: item.description || "",
					startDate: item.startDate,
					endDate: item.endDate || "",
					current: item.current,
					technologies: item.technologies || "",
				});
				break;
			case "testimonials":
				setTestimonialForm({
					clientName: item.clientName,
					clientTitle: item.clientTitle || "",
					clientCompany: item.clientCompany || "",
					content: item.content,
					rating: item.rating || 5,
					projectId: item.projectId?.toString() || "",
					approved: item.approved,
				});
				break;
		}
	};

	const handleCancel = () => {
		setIsCreating(false);
		setEditingItem(null);
		resetForms();
	};

	const resetForms = () => {
		setProjectForm({
			name: "",
			description: "",
			projectType: "personal",
			technologies: "",
			githubUrl: "",
			liveUrl: "",
			imageUrl: "",
		});
		setSkillForm({
			name: "",
			category: "",
			proficiency: 3,
			icon: "",
		});
		setExperienceForm({
			company: "",
			position: "",
			description: "",
			startDate: "",
			endDate: "",
			current: false,
			technologies: "",
		});
		setTestimonialForm({
			clientName: "",
			clientTitle: "",
			clientCompany: "",
			content: "",
			rating: 5,
			projectId: "",
			approved: false,
		});
	};

	const handleSubmit = async () => {
		let data: any = {};

		switch (activeTab) {
			case "projects":
				data = projectForm;
				break;
			case "skills":
				data = skillForm;
				break;
			case "experience":
				data = experienceForm;
				break;
			case "testimonials":
				data = {
					...testimonialForm,
					projectId: testimonialForm.projectId ? parseInt(testimonialForm.projectId) : undefined,
				};
				break;
		}

		const endpoint = `/api/admin/${activeTab}`;

		if (editingItem) {
			await updateItem(
				endpoint,
				editingItem.id,
				data,
				() => {
					fetchData();
					handleCancel();
				},
				undefined,
				setError
			);
		} else {
			await createItem(
				endpoint,
				data,
				() => {
					fetchData();
					handleCancel();
				},
				undefined,
				setError
			);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirmDelete("this item")) return;

		const endpoint = `/api/admin/${activeTab}`;
		await deleteItem(
			endpoint,
			id,
			() => {
				fetchData();
				handleCancel();
			},
			undefined,
			setError
		);
	};

	const handleToggleApproval = async (testimonial: Testimonial) => {
		await updateItem(
			"/api/admin/testimonials",
			testimonial.id,
			{
				...testimonial,
				approved: !testimonial.approved,
			},
			() => {
				setTestimonials(prev => prev.map(item => (item.id === testimonial.id ? { ...item, approved: !item.approved } : item)));
			},
			undefined,
			setError
		);
	};

	if (loading) return <LoadingSpinner />;

	return (
		<div className="h-100 d-flex flex-column">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h3 className="mb-0">Data Management</h3>
				<button onClick={handleCreate} className="btn btn-success">
					Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
				</button>
			</div>

			{error && <ErrorAlert error={error} />}

			<ul className="nav nav-tabs mb-3">
				<li className="nav-item">
					<button className={`nav-link ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
						Projects ({projects.length})
					</button>
				</li>
				<li className="nav-item">
					<button className={`nav-link ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>
						Skills ({skills.length})
					</button>
				</li>
				<li className="nav-item">
					<button className={`nav-link ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}>
						Experience ({experience.length})
					</button>
				</li>
				<li className="nav-item">
					<button
						className={`nav-link ${activeTab === "testimonials" ? "active" : ""}`}
						onClick={() => setActiveTab("testimonials")}
					>
						Testimonials ({testimonials.length})
					</button>
				</li>
			</ul>

			{activeTab === "projects" && (isCreating || editingItem) && (
				<div className="card mb-3">
					<div className="card-body">
						<h4 className="card-title">{editingItem ? "Edit Project" : "Add New Project"}</h4>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Name *</label>
								<input
									type="text"
									className="form-control"
									value={projectForm.name}
									onChange={e => setProjectForm({ ...projectForm, name: (e.target as HTMLInputElement).value })}
									placeholder="Project name"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Project Type *</label>
								<select
									className="form-select"
									value={projectForm.projectType}
									onChange={e => setProjectForm({ ...projectForm, projectType: (e.target as HTMLSelectElement).value })}
								>
									<option value="personal">Personal</option>
									<option value="professional">Professional</option>
									<option value="academic">Academic</option>
								</select>
							</div>
						</div>

						<div className="mb-3">
							<label className="form-label">Description</label>
							<textarea
								className="form-control"
								value={projectForm.description}
								onChange={e => setProjectForm({ ...projectForm, description: (e.target as HTMLTextAreaElement).value })}
								placeholder="Project description"
								rows={3}
							/>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">GitHub URL</label>
								<input
									type="url"
									className="form-control"
									value={projectForm.githubUrl}
									onChange={e => setProjectForm({ ...projectForm, githubUrl: (e.target as HTMLInputElement).value })}
									placeholder="https://github.com/username/repo"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Live URL</label>
								<input
									type="url"
									className="form-control"
									value={projectForm.liveUrl}
									onChange={e => setProjectForm({ ...projectForm, liveUrl: (e.target as HTMLInputElement).value })}
									placeholder="https://example.com"
								/>
							</div>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Technologies</label>
								<input
									type="text"
									className="form-control"
									value={projectForm.technologies}
									onChange={e => setProjectForm({ ...projectForm, technologies: (e.target as HTMLInputElement).value })}
									placeholder="React, Node.js, TypeScript (comma separated)"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Image URL</label>
								<input
									type="url"
									className="form-control"
									value={projectForm.imageUrl}
									onChange={e => setProjectForm({ ...projectForm, imageUrl: (e.target as HTMLInputElement).value })}
									placeholder="https://example.com/image.jpg"
								/>
							</div>
						</div>

						<div className="d-flex gap-2">
							<button onClick={handleSubmit} className="btn btn-primary">
								{editingItem ? "Update" : "Create"}
							</button>
							<button onClick={handleCancel} className="btn btn-secondary">
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{activeTab === "skills" && (isCreating || editingItem) && (
				<div className="card mb-3">
					<div className="card-body">
						<h4 className="card-title">{editingItem ? "Edit Skill" : "Add New Skill"}</h4>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Name *</label>
								<input
									type="text"
									className="form-control"
									value={skillForm.name}
									onChange={e => setSkillForm({ ...skillForm, name: (e.target as HTMLInputElement).value })}
									placeholder="Skill name"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Category *</label>
								<select
									className="form-select"
									value={skillForm.category}
									onChange={e => setSkillForm({ ...skillForm, category: (e.target as HTMLSelectElement).value })}
								>
									<option value="">Select category</option>
									<option value="frontend">Frontend</option>
									<option value="backend">Backend</option>
									<option value="full-stack">Full-Stack</option>
									<option value="devops">DevOps</option>
									<option value="database">Database</option>
									<option value="mobile">Mobile</option>
									<option value="other">Other</option>
								</select>
							</div>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Proficiency (1-5) *</label>
								<input
									type="number"
									className="form-control"
									value={skillForm.proficiency}
									onChange={e =>
										setSkillForm({ ...skillForm, proficiency: parseInt((e.target as HTMLInputElement).value) })
									}
									min="1"
									max="5"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Icon</label>
								<input
									type="text"
									className="form-control"
									value={skillForm.icon}
									onChange={e => setSkillForm({ ...skillForm, icon: (e.target as HTMLInputElement).value })}
									placeholder="Icon class or URL"
								/>
							</div>
						</div>

						<div className="d-flex gap-2">
							<button onClick={handleSubmit} className="btn btn-primary">
								{editingItem ? "Update" : "Create"}
							</button>
							<button onClick={handleCancel} className="btn btn-secondary">
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{activeTab === "experience" && (isCreating || editingItem) && (
				<div className="card mb-3">
					<div className="card-body">
						<h4 className="card-title">{editingItem ? "Edit Experience" : "Add New Experience"}</h4>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Company *</label>
								<input
									type="text"
									className="form-control"
									value={experienceForm.company}
									onChange={e => setExperienceForm({ ...experienceForm, company: (e.target as HTMLInputElement).value })}
									placeholder="Company name"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Position *</label>
								<input
									type="text"
									className="form-control"
									value={experienceForm.position}
									onChange={e => setExperienceForm({ ...experienceForm, position: (e.target as HTMLInputElement).value })}
									placeholder="Job title"
								/>
							</div>
						</div>

						<div className="mb-3">
							<label className="form-label">Description</label>
							<textarea
								className="form-control"
								value={experienceForm.description}
								onChange={e =>
									setExperienceForm({ ...experienceForm, description: (e.target as HTMLTextAreaElement).value })
								}
								placeholder="Job description"
								rows={3}
							/>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Start Date *</label>
								<input
									type="date"
									className="form-control"
									value={experienceForm.startDate}
									onChange={e =>
										setExperienceForm({ ...experienceForm, startDate: (e.target as HTMLInputElement).value })
									}
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">End Date</label>
								<input
									type="date"
									className="form-control"
									value={experienceForm.endDate}
									onChange={e => setExperienceForm({ ...experienceForm, endDate: (e.target as HTMLInputElement).value })}
									disabled={experienceForm.current}
								/>
							</div>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Technologies (icon name, comma separated)</label>
								<input
									type="text"
									className="form-control"
									value={experienceForm.technologies}
									onChange={e =>
										setExperienceForm({
											...experienceForm,
											technologies: (e.target as HTMLInputElement).value,
										})
									}
									placeholder="e.g. TbBrandCSharp"
								/>
							</div>
							<div className="col-md-6 mb-3 d-flex align-items-end">
								<div className="form-check">
									<input
										type="checkbox"
										className="form-check-input"
										checked={experienceForm.current}
										onChange={e =>
											setExperienceForm({ ...experienceForm, current: (e.target as HTMLInputElement).checked })
										}
										id="current-check"
									/>
									<label className="form-check-label" htmlFor="current-check">
										Current Position
									</label>
								</div>
							</div>
						</div>

						<div className="d-flex gap-2">
							<button onClick={handleSubmit} className="btn btn-primary">
								{editingItem ? "Update" : "Create"}
							</button>
							<button onClick={handleCancel} className="btn btn-secondary">
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{activeTab === "testimonials" && (isCreating || editingItem) && (
				<div className="card mb-3">
					<div className="card-body">
						<h4 className="card-title">{editingItem ? "Edit Testimonial" : "Add New Testimonial"}</h4>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Client Name *</label>
								<input
									type="text"
									className="form-control"
									value={testimonialForm.clientName}
									onChange={e =>
										setTestimonialForm({ ...testimonialForm, clientName: (e.target as HTMLInputElement).value })
									}
									placeholder="Client name"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Client Title</label>
								<input
									type="text"
									className="form-control"
									value={testimonialForm.clientTitle}
									onChange={e =>
										setTestimonialForm({ ...testimonialForm, clientTitle: (e.target as HTMLInputElement).value })
									}
									placeholder="Job title"
								/>
							</div>
						</div>

						<div className="mb-3">
							<label className="form-label">Client Company</label>
							<input
								type="text"
								className="form-control"
								value={testimonialForm.clientCompany}
								onChange={e =>
									setTestimonialForm({ ...testimonialForm, clientCompany: (e.target as HTMLInputElement).value })
								}
								placeholder="Company name"
							/>
						</div>

						<div className="mb-3">
							<label className="form-label">Content *</label>
							<textarea
								className="form-control"
								value={testimonialForm.content}
								onChange={e => setTestimonialForm({ ...testimonialForm, content: (e.target as HTMLTextAreaElement).value })}
								placeholder="Testimonial content"
								rows={4}
							/>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form-label">Rating (1-5)</label>
								<input
									type="number"
									className="form-control"
									value={testimonialForm.rating}
									onChange={e =>
										setTestimonialForm({ ...testimonialForm, rating: parseInt((e.target as HTMLInputElement).value) })
									}
									min="1"
									max="5"
								/>
							</div>
							<div className="col-md-6 mb-3">
								<label className="form-label">Project ID</label>
								<input
									type="number"
									className="form-control"
									value={testimonialForm.projectId}
									onChange={e =>
										setTestimonialForm({ ...testimonialForm, projectId: (e.target as HTMLInputElement).value })
									}
									placeholder="Related project ID"
								/>
							</div>
						</div>

						<div className="mb-3">
							<div className="form-check">
								<input
									type="checkbox"
									className="form-check-input"
									checked={testimonialForm.approved}
									onChange={e =>
										setTestimonialForm({ ...testimonialForm, approved: (e.target as HTMLInputElement).checked })
									}
									id="approved-check"
								/>
								<label className="form-check-label" htmlFor="approved-check">
									Approved
								</label>
							</div>
						</div>

						<div className="d-flex gap-2">
							<button onClick={handleSubmit} className="btn btn-primary">
								{editingItem ? "Update" : "Create"}
							</button>
							<button onClick={handleCancel} className="btn btn-secondary">
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="flex-grow-1 overflow-auto">
				{activeTab === "projects" && (
					<div>
						<h4>Projects</h4>
						<div className="d-flex flex-column gap-2">
							{projects.map(project => (
								<div key={project.id} className="card">
									<div className="card-body">
										<div className="d-flex justify-content-between align-items-start">
											<div className="flex-grow-1">
												<h5 className="card-title mb-1">{project.name}</h5>
												<p className="text-muted small mb-2">
													Type: {project.projectType} | Created: {formatDate(project.createdAt)}
												</p>
												{project.description && <p className="card-text small">{project.description}</p>}
												<div className="small">
													{project.githubUrl && (
														<a
															href={project.githubUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="me-3"
														>
															GitHub
														</a>
													)}
													{project.liveUrl && (
														<a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
															Live Demo
														</a>
													)}
												</div>
											</div>
											<div className="d-flex gap-2">
												<button onClick={() => handleEdit(project)} className="btn btn-warning btn-sm">
													Edit
												</button>
												<button onClick={() => handleDelete(project.id)} className="btn btn-danger btn-sm">
													Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeTab === "skills" && (
					<div>
						<h4>Skills</h4>
						<div className="d-flex flex-column gap-2">
							{skills.map(skill => (
								<div key={skill.id} className="card">
									<div className="card-body">
										<div className="d-flex justify-content-between align-items-start">
											<div className="flex-grow-1">
												<h5 className="card-title mb-1">{skill.name}</h5>
												<p className="text-muted small mb-2">
													Category: {skill.category} | Proficiency: {skill.proficiency}/5 | Created:{" "}
													{formatDate(skill.createdAt)}
												</p>
												{skill.icon && <p className="small mb-0">Icon: {skill.icon}</p>}
											</div>
											<div className="d-flex gap-2">
												<button onClick={() => handleEdit(skill)} className="btn btn-warning btn-sm">
													Edit
												</button>
												<button onClick={() => handleDelete(skill.id)} className="btn btn-danger btn-sm">
													Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeTab === "experience" && (
					<div>
						<h4>Work Experience</h4>
						<div className="d-flex flex-column gap-2">
							{experience.map(exp => (
								<div key={exp.id} className="card">
									<div className="card-body">
										<div className="d-flex justify-content-between align-items-start">
											<div className="flex-grow-1">
												<h5 className="card-title mb-1">
													{exp.position} at {exp.company}
												</h5>
												<p className="text-muted small mb-2">
													{formatDate(exp.startDate)} -
													{exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Unknown"}
												</p>
												{exp.description && <p className="card-text small">{exp.description}</p>}
												{exp.technologies && <p className="small mb-0">Technologies: {exp.technologies}</p>}
											</div>
											<div className="d-flex gap-2">
												<button onClick={() => handleEdit(exp)} className="btn btn-warning btn-sm">
													Edit
												</button>
												<button onClick={() => handleDelete(exp.id)} className="btn btn-danger btn-sm">
													Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeTab === "testimonials" && (
					<div>
						<h4>Testimonials</h4>
						<div className="d-flex flex-column gap-2">
							{testimonials.map(testimonial => (
								<div key={testimonial.id} className={`card ${!testimonial.approved ? "border-warning" : ""}`}>
									<div className="card-body">
										<div className="d-flex justify-content-between align-items-start">
											<div className="flex-grow-1">
												<h5 className="card-title mb-1">{testimonial.clientName}</h5>
												<p className="text-muted small mb-2">
													{testimonial.clientTitle && `${testimonial.clientTitle}`}
													{testimonial.clientCompany && ` at ${testimonial.clientCompany}`} | Rating:&nbsp;
													{testimonial.rating || "N/A"} | Status:&nbsp;
													{testimonial.approved ? "Approved" : "Pending"} | Created:&nbsp;
													{formatDate(testimonial.createdAt)}
												</p>
												<p className="card-text small">{testimonial.content}</p>
											</div>
											<div className="d-flex gap-2">
												<button onClick={() => handleEdit(testimonial)} className="btn btn-warning btn-sm">
													Edit
												</button>
												<button
													onClick={() => handleToggleApproval(testimonial)}
													className={`btn btn-sm ${testimonial.approved ? "btn-outline-warning" : "btn-success"}`}
												>
													{testimonial.approved ? "Unapprove" : "Approve"}
												</button>
												<button onClick={() => handleDelete(testimonial.id)} className="btn btn-danger btn-sm">
													Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
