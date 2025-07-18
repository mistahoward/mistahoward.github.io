export const getInitialProjectForm = () => ({
	name: "",
	description: "",
	projectType: "personal",
	technologies: "",
	githubUrl: "",
	liveUrl: "",
	imageUrl: "",
});

export const getInitialSkillForm = () => ({
	name: "",
	category: "",
	proficiency: 3,
	icon: "",
});

export const getInitialExperienceForm = () => ({
	company: "",
	position: "",
	description: "",
	startDate: "",
	endDate: "",
	current: false,
	technologies: "",
});

export const getInitialTestimonialForm = () => ({
	clientName: "",
	clientTitle: "",
	clientCompany: "",
	content: "",
	rating: 5,
	relationship: "",
	status: "needs_review",
});

export const getInitialCertificationForm = () => ({
	name: "",
	issuer: "",
	issueDate: "",
	expiryDate: "",
	credentialId: "",
	credentialUrl: "",
	description: "",
	category: "",
	imageUrl: "",
});

export const resetAllForms = () => ({
	project: getInitialProjectForm(),
	skill: getInitialSkillForm(),
	experience: getInitialExperienceForm(),
	testimonial: getInitialTestimonialForm(),
	certification: getInitialCertificationForm(),
}); 