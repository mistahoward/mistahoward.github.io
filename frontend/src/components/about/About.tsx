import { AboutStatic } from "./AboutStatic";
import { SkillsList } from "./SkillsList";
import { ExperienceList } from "./ExperienceList";
import { TestimonialsList } from "./TestimonialsList";
import { CertificationsList } from "./CertificationsList";
import { useState } from "preact/hooks";

export const About = () => {
	const [activeTab, setActiveTab] = useState("skills");

	return (
		<section id="about" className="min-vh-100 d-flex align-items-center justify-content-center mt-4 mt-sm-0 mt-md-4 mt-xl-0">
			<div className="container">
				<div className="row justify-content-center align-items-start">
					<div className="col-lg-5 mb-4 mb-lg-0">
						<AboutStatic />
					</div>
					<div className="col-lg-7">
						{/* Mobile Dropdown for Tabs */}
						<div className="about-tabs-dropdown d-lg-none mb-3">
							<select
								className="form-select"
								value={activeTab}
								onChange={e => setActiveTab(e.currentTarget.value)}
								aria-label="Select About Section"
							>
								<option value="skills">Skills</option>
								<option value="experience">Experience</option>
								<option value="certifications">Certifications</option>
								<option value="testimonials">Testimonials</option>
							</select>
						</div>
						{/* Desktop Tabs */}
						<ul className="nav nav-tabs mb-3 d-none d-lg-flex" role="tablist">
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link${activeTab === "skills" ? " active" : ""}`}
									id="skills-tab"
									data-bs-toggle="tab"
									type="button"
									role="tab"
									aria-selected={activeTab === "skills"}
									onClick={() => setActiveTab("skills")}
								>
									Skills
								</button>
							</li>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link${activeTab === "experience" ? " active" : ""}`}
									id="experience-tab"
									data-bs-toggle="tab"
									type="button"
									role="tab"
									aria-selected={activeTab === "experience"}
									onClick={() => setActiveTab("experience")}
								>
									Experience
								</button>
							</li>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link${activeTab === "certifications" ? " active" : ""}`}
									id="certifications-tab"
									data-bs-toggle="tab"
									type="button"
									role="tab"
									aria-selected={activeTab === "certifications"}
									onClick={() => setActiveTab("certifications")}
								>
									Certifications
								</button>
							</li>
							<li className="nav-item" role="presentation">
								<button
									className={`nav-link${activeTab === "testimonials" ? " active" : ""}`}
									id="testimonials-tab"
									data-bs-toggle="tab"
									type="button"
									role="tab"
									aria-selected={activeTab === "testimonials"}
									onClick={() => setActiveTab("testimonials")}
								>
									Testimonials
								</button>
							</li>
						</ul>
						<div className="tab-content p-3 border rounded bg-body">
							<div
								className={`tab-pane fade${activeTab === "skills" ? " show active" : ""}`}
								id="skills"
								role="tabpanel"
								aria-labelledby="skills-tab"
							>
								<SkillsList />
							</div>
							<div
								className={`tab-pane fade${activeTab === "experience" ? " show active" : ""}`}
								id="experience"
								role="tabpanel"
								aria-labelledby="experience-tab"
							>
								<ExperienceList />
							</div>
							<div
								className={`tab-pane fade${activeTab === "certifications" ? " show active" : ""}`}
								id="certifications"
								role="tabpanel"
								aria-labelledby="certifications-tab"
							>
								<CertificationsList />
							</div>
							<div
								className={`tab-pane fade${activeTab === "testimonials" ? " show active" : ""}`}
								id="testimonials"
								role="tabpanel"
								aria-labelledby="testimonials-tab"
							>
								<TestimonialsList />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
