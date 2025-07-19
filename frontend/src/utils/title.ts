const BASE_TITLE = "Alex Howard | Portfolio";

export const updatePageTitle = (section?: string, blogTitle?: string) => {
	if (blogTitle) {
		document.title = `${blogTitle} | ${BASE_TITLE}`;
		return;
	}

	if (section) {
		const sectionTitles: Record<string, string> = {
			"about": "About",
			"projects": "Projects",
			"pet-dex": "Pet-Dex",
			"blogs": "Blogs"
		};

		const sectionTitle = sectionTitles[section];
		if (sectionTitle) {
			document.title = `${sectionTitle} | ${BASE_TITLE}`;
			return;
		}
	}

	// Default title for home page
	document.title = BASE_TITLE;
}; 