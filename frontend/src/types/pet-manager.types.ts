export interface Pet {
	id: number;
	name: string;
	species: string;
	breed?: string;
	age?: number;
	color?: string;
	personality?: string;
	specialAbilities?: string;
	favoriteFood?: string;
	favoriteToy?: string;
	originStory?: string;
	description?: string;
	dexId?: string;
	imageUrl?: string;
	iconUrl?: string;
	stats?: string;
	nickname?: string;
	adoptedDate?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PetManagerProps {
	lastFocusTime?: number;
}

export interface PetFormState {
	name: string;
	species: string;
	breed: string;
	age: string;
	color: string;
	personality: string;
	specialAbilities: string;
	favoriteFood: string;
	favoriteToy: string;
	originStory: string;
	description: string;
	dexId: string;
	imageUrl: string;
	iconUrl: string;
	stats: string;
	nickname: string;
	adoptedDate: string;
	isActive: boolean;
}

export type PetFormProps = {
	formData: PetFormState;
	setFormData: (data: PetFormState) => void;
	onSubmit: () => void;
	onCancel: () => void;
	editingItem: Pet | null;
	imageFile: File | null;
	imagePreview: string;
	onImageChange: (e: Event) => void;
	onImageRemove: () => void;
	iconFile: File | null;
	iconPreview: string;
	onIconChange: (e: Event) => void;
	onIconRemove: () => void;
}; 