export interface Testimonial {
	id: number;
	clientName: string;
	clientTitle?: string;
	clientCompany?: string;
	content: string;
	rating?: number;
	createdAt: string;
} 