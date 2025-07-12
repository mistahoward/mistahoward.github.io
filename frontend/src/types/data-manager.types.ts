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
}

export interface DataManagerProps {
	lastFocusTime?: number;
} 