export interface Testimonial {
	id: number;
	clientName: string;
	clientTitle?: string;
	clientCompany?: string;
	content: string;
	rating?: number;
	createdAt: string;
	relationship: string;
	status: "needs_review" | "approved" | "denied";
} 