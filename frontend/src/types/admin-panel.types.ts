export interface AdminPanelProps {
	isVisible: boolean;
	onClose: () => void;
}

export type Section =
	| "blog"
	| "pets"
	| "projects"
	| "skills"
	| "experience"
	| "testimonials"
	| "certifications"
	| "testimonial-invites"
	| "tags";

export interface ManagerLayoutProps {
	title: string;
	loading: boolean;
	error: string;
	onCreate: () => void;
	createButtonText: string;
	children: import("preact").ComponentChildren;
} 