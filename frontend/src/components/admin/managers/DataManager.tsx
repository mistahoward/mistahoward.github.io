import { useState, useEffect } from "preact/hooks";
import {
	Project,
	Skill,
	Experience,
	Testimonial,
	Certification,
	DataManagerTab,
	CertificationFormState,
	DataManagerProps,
} from "../../../types/data-manager.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../../utils/crud";
import { formatDate } from "../../../utils/ui";
import { ManagerLayout } from "../shared/ManagerLayout";
import { CertificationForm } from "../forms/CertificationForm";
import {
	getInitialProjectForm,
	getInitialSkillForm,
	getInitialExperienceForm,
	getInitialTestimonialForm,
	getInitialCertificationForm,
} from "../shared/formUtils";
import { ProjectForm } from "../forms/ProjectForm";
import { SkillForm } from "../forms/SkillForm";
import { ExperienceForm } from "../forms/ExperienceForm";
import { TestimonialForm } from "../forms/TestimonialForm";
import { renderIcon, iconNameToLabel } from "../../../utils/iconMap";

export const DataManager = ({ lastFocusTime = 0, initialTab = "projects" }: DataManagerProps) => {
	const [activeTab, setActiveTab] = useState<DataManagerTab>(initialTab);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [projects, setProjects] = useState<Project[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [experience, setExperience] = useState<Experience[]>([]);
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [certifications, setCertifications] = useState<Certification[]>([]);

	const [isCreating, setIsCreating] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);

	const [certificationForm, setCertificationForm] = useState<CertificationFormState>(getInitialCertificationForm());
	const [projectForm, setProjectForm] = useState(getInitialProjectForm());
	const [skillForm, setSkillForm] = useState(getInitialSkillForm());
	const [experienceForm, setExperienceForm] = useState(getInitialExperienceForm());
	const [testimonialForm, setTestimonialForm] = useState(getInitialTestimonialForm());

	const [testimonialTab, setTestimonialTab] = useState("needs_review");

	const fetchData = async () => {
		try {
			const [projectsData, skillsData, experienceData, testimonialsData, certificationsData] = await Promise.all([
				fetchItems({ endpoint: "/api/admin/projects", setError }),
				fetchItems({ endpoint: "/api/admin/skills", setError }),
				fetchItems({ endpoint: "/api/admin/experience", setError }),
				fetchItems({ endpoint: "/api/admin/testimonials", setError }),
				fetchItems({ endpoint: "/api/admin/certifications", setError }),
			]);
			if (projectsData) setProjects(projectsData as Project[]);
			if (skillsData) setSkills(skillsData as Skill[]);
			if (experienceData) setExperience(experienceData as Experience[]);
			if (testimonialsData) setTestimonials(testimonialsData as Testimonial[]);
			if (certificationsData) setCertifications(certificationsData as Certification[]);
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

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

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
					projectType: item.projectType || "personal",
					technologies: item.technologies || "",
					githubUrl: item.githubUrl || "",
					liveUrl: item.liveUrl || "",
					imageUrl: item.imageUrl || "",
					nugetPackageId: item.nugetPackageId || "",
				});
				break;
			case "skills":
				setSkillForm({
					name: item.name,
					category: item.category || "",
					proficiency: item.proficiency || 3,
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
					current: item.current || false,
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
					relationship: item.relationship || "",
					status: item.status || "needs_review",
				});
				break;
			case "certifications":
				setCertificationForm({
					name: item.name,
					issuer: item.issuer,
					issueDate: item.issueDate,
					expiryDate: item.expiryDate || "",
					credentialId: item.credentialId || "",
					credentialUrl: item.credentialUrl || "",
					description: item.description || "",
					category: item.category || "",
					imageUrl: item.imageUrl || "",
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
		setProjectForm(getInitialProjectForm());
		setSkillForm(getInitialSkillForm());
		setExperienceForm(getInitialExperienceForm());
		setTestimonialForm(getInitialTestimonialForm());
		setCertificationForm(getInitialCertificationForm());
	};

	const handleSubmit = async () => {
		let data: any = {};
		switch (activeTab) {
			case "projects":
				data = { ...projectForm };
				break;
			case "skills":
				data = { ...skillForm };
				break;
			case "experience":
				data = { ...experienceForm, endDate: experienceForm.endDate || undefined };
				break;
			case "testimonials":
				data = {
					...testimonialForm,
					rating: Number(testimonialForm.rating),
				};
				break;
			case "certifications":
				data = { ...certificationForm, expiryDate: certificationForm.expiryDate || undefined };
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
		const confirmed = await confirmDelete("this item");
		if (!confirmed) return;

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

	const entityDisplayNames: Record<DataManagerTab, { title: string; create: string }> = {
		projects: { title: "Project Management", create: "Add New Project" },
		skills: { title: "Skill Management", create: "Add New Skill" },
		experience: { title: "Experience Management", create: "Add New Experience" },
		testimonials: { title: "Testimonial Management", create: "Add New Testimonial" },
		certifications: { title: "Certification Management", create: "Add New Certification" },
	};

	return (
		<ManagerLayout
			title={entityDisplayNames[activeTab].title}
			loading={loading}
			error={error}
			onCreate={handleCreate}
			createButtonText={entityDisplayNames[activeTab].create}
		>
			{(() => {
				switch (activeTab) {
					case "projects":
						if (isCreating || editingItem)
							return (
								<ProjectForm
									formData={projectForm}
									setFormData={setProjectForm}
									onSubmit={handleSubmit}
									onCancel={handleCancel}
									editingItem={editingItem}
								/>
							);
						break;
					case "skills":
						if (isCreating || editingItem)
							return (
								<SkillForm
									formData={skillForm}
									setFormData={setSkillForm}
									onSubmit={handleSubmit}
									onCancel={handleCancel}
									editingItem={editingItem}
								/>
							);
						break;
					case "experience":
						if (isCreating || editingItem)
							return (
								<ExperienceForm
									formData={experienceForm}
									setFormData={setExperienceForm}
									onSubmit={handleSubmit}
									onCancel={handleCancel}
									editingItem={editingItem}
								/>
							);
						break;
					case "testimonials":
						if (isCreating || editingItem)
							return (
								<TestimonialForm
									formData={testimonialForm as any}
									setFormData={setTestimonialForm as any}
									onSubmit={handleSubmit}
									onCancel={handleCancel}
									editingItem={editingItem}
								/>
							);
						break;
					case "certifications":
						if (isCreating || editingItem)
							return (
								<CertificationForm
									formData={certificationForm}
									setFormData={setCertificationForm}
									onSubmit={handleSubmit}
									onCancel={handleCancel}
									editingItem={editingItem}
								/>
							);
						break;
				}
				return null;
			})()}
			<div className="flex-grow-1 overflow-auto">
				{(() => {
					switch (activeTab) {
						case "projects":
							return (
								<div>
									<div className="d-flex flex-column gap-2">
										{projects.map(project => (
											<div key={project.id} className="card">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-start">
														<div className="flex-grow-1">
															<h5 className="card-title mb-1">{project.name}</h5>
															<p className="text-muted small mb-2">
																Type: {project.projectType}{" "}
																{project.githubUrl && (
																	<>
																		|{" "}
																		<a
																			href={project.githubUrl}
																			target="_blank"
																			rel="noopener noreferrer"
																		>
																			GitHub
																		</a>
																	</>
																)}{" "}
																{project.liveUrl && (
																	<>
																		|{" "}
																		<a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
																			Live
																		</a>
																	</>
																)}
															</p>
															{project.description && (
																<p className="card-text small">{project.description}</p>
															)}
															{project.technologies && (
																<div className="small mb-0">
																	<span className="text-muted">Technologies:&nbsp;</span>
																	{project.technologies.split(/,|;/).map((tech: string) => {
																		const t = tech.trim();
																		return (
																			<span
																				key={t}
																				className="me-2"
																				title={iconNameToLabel[t.replace(/ /g, "")] || t}
																			>
																				{renderIcon(t.replace(/ /g, ""))}
																			</span>
																		);
																	})}
																</div>
															)}
														</div>
														<div className="d-flex gap-2">
															<button onClick={() => handleEdit(project)} className="btn btn-warning btn-sm">
																Edit
															</button>
															<button
																onClick={() => handleDelete(project.id)}
																className="btn btn-danger btn-sm"
															>
																Delete
															</button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						case "skills":
							return (
								<div>
									<div className="d-flex flex-column gap-2">
										{skills.map(skill => (
											<div key={skill.id} className="card">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-start">
														<div className="flex-grow-1">
															<h5 className="card-title mb-1">{skill.name}</h5>
															<p className="text-muted small mb-2">
																Category: {skill.category} | Proficiency: {skill.proficiency}/5
															</p>
															{skill.icon && <p className="small mb-0">Icon: {skill.icon}</p>}
														</div>
														<div className="d-flex gap-2">
															<button onClick={() => handleEdit(skill)} className="btn btn-warning btn-sm">
																Edit
															</button>
															<button
																onClick={() => handleDelete(skill.id)}
																className="btn btn-danger btn-sm"
															>
																Delete
															</button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						case "experience":
							return (
								<div>
									<div className="d-flex flex-column gap-2">
										{experience.map(exp => (
											<div key={exp.id} className="card">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-start">
														<div className="flex-grow-1">
															<h5 className="card-title mb-1">
																{exp.position} @ {exp.company}
															</h5>
															<p className="text-muted small mb-2">
																{formatDate(exp.startDate)} -{" "}
																{exp.current ? "Present" : formatDate(exp.endDate || "")}
															</p>
															{exp.description && <p className="card-text small">{exp.description}</p>}
															{exp.technologies && (
																<div className="small mb-0">
																	<span className="text-muted">Technologies:&nbsp;</span>
																	{exp.technologies.split(/,|;/).map((tech: string) => {
																		const t = tech.trim();
																		return (
																			<span
																				key={t}
																				className="me-2"
																				title={iconNameToLabel[t.replace(/ /g, "")] || t}
																			>
																				{renderIcon(t.replace(/ /g, ""))}
																			</span>
																		);
																	})}
																</div>
															)}
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
							);
						case "testimonials":
							return (
								<div>
									<ul className="nav nav-tabs mb-3">
										<li className="nav-item">
											<button
												className={`nav-link${testimonialTab === "needs_review" ? " active" : ""}`}
												onClick={() => setTestimonialTab("needs_review")}
											>
												Needs Review
											</button>
										</li>
										<li className="nav-item">
											<button
												className={`nav-link${testimonialTab === "approved" ? " active" : ""}`}
												onClick={() => setTestimonialTab("approved")}
											>
												Approved
											</button>
										</li>
										<li className="nav-item">
											<button
												className={`nav-link${testimonialTab === "denied" ? " active" : ""}`}
												onClick={() => setTestimonialTab("denied")}
											>
												Denied
											</button>
										</li>
									</ul>
									<div className="d-flex flex-column gap-2">
										{testimonials
											.filter(t => t.status === testimonialTab)
											.map(testimonial => (
												<div key={testimonial.id} className="card">
													<div className="card-body">
														<div className="d-flex justify-content-between align-items-start">
															<div className="flex-grow-1">
																<h5 className="card-title mb-1">{testimonial.clientName}</h5>
																<p className="text-muted small mb-2">
																	{testimonial.clientTitle}{" "}
																	{testimonial.clientCompany && `@ ${testimonial.clientCompany}`}
																</p>
																<p className="small mb-0">
																	Rating: {testimonial.rating}/5{" "}
																	{testimonial.status === "approved" && (
																		<span className="badge bg-success ms-2">Approved</span>
																	)}
																	{testimonial.status === "needs_review" && (
																		<span className="badge bg-warning text-dark ms-2">
																			Needs Review
																		</span>
																	)}
																	{testimonial.status === "denied" && (
																		<span className="badge bg-danger ms-2">Denied</span>
																	)}
																</p>
																{testimonial.content && (
																	<p className="card-text small mt-2">{testimonial.content}</p>
																)}
															</div>
															<div className="d-flex gap-2">
																{testimonialTab === "needs_review" && (
																	<>
																		<button
																			className="btn btn-success btn-sm"
																			onClick={async () => {
																				await updateItem(
																					"/api/admin/testimonials",
																					testimonial.id,
																					{ status: "approved" },
																					fetchData,
																					undefined,
																					setError
																				);
																			}}
																		>
																			Approve
																		</button>
																		<button
																			className="btn btn-danger btn-sm"
																			onClick={async () => {
																				await updateItem(
																					"/api/admin/testimonials",
																					testimonial.id,
																					{ status: "denied" },
																					fetchData,
																					undefined,
																					setError
																				);
																			}}
																		>
																			Deny
																		</button>
																	</>
																)}
																<button
																	onClick={() => handleEdit(testimonial)}
																	className="btn btn-warning btn-sm"
																>
																	Edit
																</button>
																<button
																	onClick={() => handleDelete(testimonial.id)}
																	className="btn btn-danger btn-sm"
																>
																	Delete
																</button>
															</div>
														</div>
													</div>
												</div>
											))}
										{testimonials.filter(t => t.status === testimonialTab).length === 0 && (
											<div className="text-muted text-center">No testimonials in this category.</div>
										)}
									</div>
								</div>
							);
						case "certifications":
							return (
								<div>
									<div className="d-flex flex-column gap-2">
										{certifications.map(cert => (
											<div key={cert.id} className="card">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-start">
														<div className="flex-grow-1">
															<h5 className="card-title mb-1">{cert.name}</h5>
															<p className="text-muted small mb-2">
																Issuer: {cert.issuer} | Issue Date: {formatDate(cert.issueDate)}
																{cert.expiryDate && ` | Expiry Date: ${formatDate(cert.expiryDate)}`}
															</p>
															{cert.credentialId && (
																<p className="small mb-0">Credential ID: {cert.credentialId}</p>
															)}
															{cert.credentialUrl && (
																<p className="small mb-0">
																	Credential URL:{" "}
																	<a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
																		{cert.credentialUrl}
																	</a>
																</p>
															)}
															{cert.description && <p className="card-text small">{cert.description}</p>}
														</div>
														<div className="d-flex gap-2">
															<button onClick={() => handleEdit(cert)} className="btn btn-warning btn-sm">
																Edit
															</button>
															<button onClick={() => handleDelete(cert.id)} className="btn btn-danger btn-sm">
																Delete
															</button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							);
						default:
							return null;
					}
				})()}
			</div>
		</ManagerLayout>
	);
};
