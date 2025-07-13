export interface Project {
	id: number;
	name: string;
	description?: string;
	projectType: string;
	technologies?: string;
	githubUrl: string;
	liveUrl?: string;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Skill {
	id: number;
	name: string;
	category: string;
	proficiency: number;
	icon?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Experience {
	id: number;
	company: string;
	position: string;
	description?: string;
	startDate: string;
	endDate?: string;
	current: boolean;
	technologies?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Testimonial {
	id: number;
	clientName: string;
	clientTitle?: string;
	clientCompany?: string;
	content: string;
	rating?: number;
	projectId?: number;
	approved: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Certification {
	id: number;
	name: string;
	issuer: string;
	issueDate: string;
	expiryDate?: string;
	credentialId?: string;
	credentialUrl?: string;
	description?: string;
	category?: string;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface DataManagerProps {
	lastFocusTime?: number;
	initialTab?: DataManagerTab;
}

export type ProjectFormProps = {
	formData: ProjectFormState;
	setFormData: (data: ProjectFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Project | null;
};

export type SkillFormProps = {
	formData: SkillFormState;
	setFormData: (data: SkillFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Skill | null;
};

export type ExperienceFormProps = {
	formData: ExperienceFormState;
	setFormData: (data: ExperienceFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Experience | null;
};

export type TestimonialFormProps = {
	formData: TestimonialFormState;
	setFormData: (data: TestimonialFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Testimonial | null;
};

export type CertificationFormProps = {
	formData: CertificationFormState;
	setFormData: (data: CertificationFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Certification | null;
};

export type ProjectFormState = {
	name: string;
	description: string;
	projectType: string;
	technologies: string;
	githubUrl: string;
	liveUrl: string;
	imageUrl: string;
};

export type SkillFormState = {
	name: string;
	category: string;
	proficiency: number;
	icon: string;
};

export type ExperienceFormState = {
	company: string;
	position: string;
	description: string;
	startDate: string;
	endDate: string;
	current: boolean;
	technologies: string;
};

export type TestimonialFormState = {
	clientName: string;
	clientTitle: string;
	clientCompany: string;
	content: string;
	rating: number;
	projectId: string;
	approved: boolean;
};

export type CertificationFormState = {
	name: string;
	issuer: string;
	issueDate: string;
	expiryDate: string;
	credentialId: string;
	credentialUrl: string;
	description: string;
	category: string;
	imageUrl: string;
};

export type DataManagerTab = "projects" | "skills" | "experience" | "testimonials" | "certifications";

export interface DataManagerTabsProps {
	activeTab: DataManagerTab;
	setActiveTab: (tab: DataManagerTab) => void;
	counts: { [K in DataManagerTab]: number };
} 