import { Pet } from "../types/pet-manager.types";

export type DexCategory = "canine" | "feline" | "memorial";
export type DexPage = "info" | "story" | "stats";

export const DEX_CATEGORIES: { key: DexCategory; label: string }[] = [
	{ key: "canine", label: "Canine" },
	{ key: "feline", label: "Feline" },
	{ key: "memorial", label: "Rainbow Bridge" },
];

export const DEX_PAGES: { key: DexPage; label: string }[] = [
	{ key: "info", label: "Info" },
	{ key: "story", label: "Story" },
	{ key: "stats", label: "Stats" },
];

/** Stat keys the cards know how to label and color. Anything else shows with its own name. */
export const STAT_LABELS: Record<string, { label: string; tone: string }> = {
	hp: { label: "HP", tone: "hp" },
	health: { label: "HP", tone: "hp" },
	attack: { label: "Attack", tone: "attack" },
	defense: { label: "Defense", tone: "defense" },
	speed: { label: "Speed", tone: "speed" },
};

export const dexNumber = (pet: Pet) => parseInt((pet.dexId || "").replace("#", ""), 10) || 0;

export const formatDexNumber = (pet: Pet) => String(dexNumber(pet)).padStart(3, "0");

export const isInCategory = (pet: Pet, category: DexCategory) =>
	category === "memorial" ? !!pet.isMemorial : !pet.isMemorial && pet.species === (category === "canine" ? "dog" : "cat");

export const petsInCategory = (pets: Pet[], category: DexCategory) =>
	pets.filter(pet => isInCategory(pet, category)).sort((a, b) => dexNumber(a) - dexNumber(b));

// A named constant, so ESLint (double quotes) and Prettier (fewest escapes) agree on how to write it.
const QUOTE = String.fromCharCode(34);

/** Personality and abilities are stored as `"one","two","three"`. */
export const parseQuotedList = (value?: string) => {
	if (!value) return [];
	let trimmed = value.trim();
	if (trimmed.startsWith(QUOTE) && trimmed.endsWith(QUOTE)) trimmed = trimmed.slice(1, -1);
	return trimmed
		.split(/","/)
		.map(item => item.replace(/^"+|"+$/g, "").trim())
		.filter(Boolean);
};

/** Abilities read "Name: what it does". Each becomes a named move. */
export const parseMoves = (value?: string) =>
	parseQuotedList(value).map(entry => {
		const colon = entry.indexOf(":");
		return colon > 0
			? { name: entry.slice(0, colon).trim(), description: entry.slice(colon + 1).trim() }
			: { name: entry, description: "" };
	});

export const parseStats = (value?: string): [string, number][] => {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		if (!parsed || typeof parsed !== "object") return [];
		return Object.entries(parsed).map(([key, raw]) => [key, Math.max(0, Math.min(100, Math.round(Number(raw) || 0)))]);
	} catch {
		return [];
	}
};

export const statLabel = (key: string) =>
	STAT_LABELS[key.toLowerCase()] ?? { label: key.charAt(0).toUpperCase() + key.slice(1), tone: "other" };
