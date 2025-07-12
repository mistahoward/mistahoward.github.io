export interface Pet {
	id: number;
	name: string;
	species: string;
	breed?: string;
	age?: number;
	weight?: number;
	color?: string;
	personality?: string;
	specialAbilities?: string;
	favoriteFood?: string;
	favoriteToy?: string;
	rescueStory?: string;
	imageUrl?: string;
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