// State persistence utility for auto-saving form data
import { useMemo, useEffect, useRef } from "preact/hooks";

export interface AutoSaveOptions {
	key: string;
	debounceMs?: number;
	maxSize?: number; // Maximum size in bytes for localStorage
	compress?: boolean; // Whether to compress data (basic implementation)
}

export interface SaveStatus {
	lastSaved?: Date;
	hasUnsavedChanges: boolean;
	isSaving: boolean;
}

export class StatePersistence {
	private static instances = new Map<string, StatePersistence>();
	private timeoutId: number | null = null;
	private lastSaved: string = "";
	private lastSavedTime?: Date;
	private isSaving: boolean = false;
	private options: Required<AutoSaveOptions>;

	private constructor(options: AutoSaveOptions) {
		this.options = {
			debounceMs: 1000,
			maxSize: 1024 * 1024, // 1MB default
			compress: false,
			...options
		};
	}

	static getInstance(key: string, options?: Partial<AutoSaveOptions>): StatePersistence {
		const fullKey = `autosave_${key}`;
		if (!StatePersistence.instances.has(fullKey)) {
			StatePersistence.instances.set(fullKey, new StatePersistence({ key: fullKey, ...options }));
		}
		return StatePersistence.instances.get(fullKey)!;
	}

	save<T>(data: T): void {
		// Don't save if data is null (user hasn't made changes)
		if (data === null) {
			this.isSaving = false;
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = null;
			}
			return;
		}

		try {
			const serialized = JSON.stringify(data);

			// Check if data has actually changed
			if (serialized === this.lastSaved) {
				// If data hasn't changed, we're not saving
				this.isSaving = false;
				this.timeoutId = null; // Clear any pending timeout
				return;
			}

			// Don't save if data is essentially empty (just default values)
			if (this.isEmptyData(data)) {
				this.clear();
				return;
			}

			// Check size limit
			if (serialized.length > this.options.maxSize) {
				console.warn(`Auto-save data too large (${serialized.length} bytes), skipping save`);
				this.isSaving = false;
				this.timeoutId = null; // Clear any pending timeout
				return;
			}

			// Clear existing timeout
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = null;
			}

			// Set saving status
			this.isSaving = true;
			console.log(`Starting auto-save for ${this.options.key}`);

			// Debounce the save operation
			this.timeoutId = window.setTimeout(() => {
				try {
					localStorage.setItem(this.options.key, serialized);
					this.lastSaved = serialized;
					this.lastSavedTime = new Date();
					this.isSaving = false;
					this.timeoutId = null; // Clear the timeout reference
					console.log(`Auto-saved state for ${this.options.key} at ${this.lastSavedTime.toLocaleTimeString()}`);
				} catch (error) {
					console.error("Failed to save state:", error);
					this.isSaving = false;
					this.timeoutId = null; // Clear the timeout reference
				}
			}, this.options.debounceMs);

		} catch (error) {
			console.error("Error serializing state:", error);
			this.isSaving = false;
			this.timeoutId = null; // Clear any pending timeout
		}
	}

	private isEmptyData<T>(data: T): boolean {
		if (!data) return true;

		// Check if it's an object with only empty/default values
		if (typeof data === "object" && data !== null) {
			const obj = data as any;

			// Common blog form default values
			const defaultValues = {
				title: "",
				slug: "",
				content: "",
				excerpt: "",
				published: false,
				tags: []
			};

			// Check if all values match defaults
			for (const [key, defaultValue] of Object.entries(defaultValues)) {
				if (obj[key] !== undefined && obj[key] !== defaultValue) {
					return false;
				}
			}

			return true;
		}

		return false;
	}

	load<T>(defaultValue: T): T {
		try {
			const saved = localStorage.getItem(this.options.key);
			if (!saved) return defaultValue;

			const parsed = JSON.parse(saved);
			this.lastSaved = saved;
			this.lastSavedTime = new Date();
			console.log(`Loaded auto-saved state for ${this.options.key}`);
			return parsed;
		} catch (error) {
			console.error("Error loading saved state:", error);
			return defaultValue;
		}
	}

	clear(): void {
		try {
			localStorage.removeItem(this.options.key);
			this.lastSaved = "";
			this.lastSavedTime = undefined;
			this.isSaving = false;
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = null;
			}
			console.log(`Cleared auto-saved state for ${this.options.key}`);
		} catch (error) {
			console.error("Error clearing saved state:", error);
		}
	}

	hasSavedData(): boolean {
		return localStorage.getItem(this.options.key) !== null;
	}

	getSaveStatus(): SaveStatus {
		const status = {
			lastSaved: this.lastSavedTime,
			hasUnsavedChanges: this.isSaving || this.timeoutId !== null,
			isSaving: this.isSaving
		};

		console.log(`Save status for ${this.options.key}:`, status);
		return status;
	}

	// Force immediate save (useful for beforeunload events)
	forceSave<T>(data: T): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		this.save(data);
	}
}

// Hook for React/Preact components
export function useAutoSave<T>(
	key: string,
	data: T,
	options?: Partial<AutoSaveOptions>
): {
	loadSavedData: () => T | null;
	clearSavedData: () => void;
	hasSavedData: () => boolean;
	getSaveStatus: () => SaveStatus;
} {
	// Use useMemo to ensure the persistence instance is stable
	const persistence = useMemo(() => StatePersistence.getInstance(key, options), [key]);

	// Use useRef to track the last saved data to prevent unnecessary saves
	const lastSavedDataRef = useRef<string>("");

	// Auto-save when data changes, but only if data is actually different
	useEffect(() => {
		// Don't save if data is null
		if (data === null) return;

		try {
			const serialized = JSON.stringify(data);

			// Only save if data has actually changed
			if (serialized !== lastSavedDataRef.current) {
				console.log(`Data changed for ${key}, triggering save`);
				lastSavedDataRef.current = serialized;
				persistence.save(data);
			}
		} catch (error) {
			console.error("Error in useAutoSave effect:", error);
		}
	}, [persistence, data]);

	return {
		loadSavedData: () => {
			try {
				return persistence.load(null as any);
			} catch {
				return null;
			}
		},
		clearSavedData: () => persistence.clear(),
		hasSavedData: () => persistence.hasSavedData(),
		getSaveStatus: () => persistence.getSaveStatus()
	};
} 