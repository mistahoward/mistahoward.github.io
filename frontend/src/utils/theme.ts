export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "bs-theme";

export class ThemeManager {
	private static instance: ThemeManager;
	private currentTheme: Theme = "light";
	private listeners: ((theme: Theme) => void)[] = [];

	private constructor() {
		this.loadTheme();
	}

	static getInstance(): ThemeManager {
		if (!ThemeManager.instance)
			ThemeManager.instance = new ThemeManager();
		return ThemeManager.instance;
	}

	private loadTheme(): void {
		const storedTheme = sessionStorage.getItem(THEME_STORAGE_KEY) as Theme;

		if (storedTheme && (storedTheme === "light" || storedTheme === "dark"))
			this.currentTheme = storedTheme;
		else
			this.currentTheme = "light";

		this.applyTheme();
	}

	private applyTheme(): void {
		const html = document.documentElement;

		if (this.currentTheme === "dark")
			html.setAttribute("data-bs-theme", "dark");
		else
			html.removeAttribute("data-bs-theme");


		this.listeners.forEach(listener => listener(this.currentTheme));
	}

	getTheme(): Theme {
		return this.currentTheme;
	}

	setTheme(theme: Theme): void {
		if (theme !== "light" && theme !== "dark")
			throw new Error("Theme must be 'light' or 'dark'");

		this.currentTheme = theme;
		sessionStorage.setItem(THEME_STORAGE_KEY, theme);
		this.applyTheme();
	}

	toggleTheme(): void {
		const newTheme = this.currentTheme === "light" ? "dark" : "light";
		this.setTheme(newTheme);
	}

	subscribe(listener: (theme: Theme) => void): () => void {
		this.listeners.push(listener);

		return () => {
			const index = this.listeners.indexOf(listener);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}
}

export const themeManager = ThemeManager.getInstance(); 