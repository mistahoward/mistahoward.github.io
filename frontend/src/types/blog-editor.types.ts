export interface BlogPost {
	id: number;
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	published: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	tags: string[];
}

export interface BlogEditorProps {
	lastFocusTime?: number;
}

export interface BlogFormState {
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	published: boolean;
	tags: string[];
}

export type BlogFormProps = {
	formData: BlogFormState;
	setFormData: (data: BlogFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: BlogPost | null;
}; 