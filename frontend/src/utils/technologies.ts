import { iconNameToLabel, resolveIconName } from "./iconMap";

// Projects and experience store technologies as one string of icon keys or plain labels,
// separated by commas or semicolons ("SiReact, TypeScript; Claude Code").
export const techIconName = (tech: string) => tech.replace(/ /g, "");

export const techLabel = (tech: string) => {
	const iconName = resolveIconName(techIconName(tech));
	return (iconName && iconNameToLabel[iconName]) || tech;
};

// Splits the stored string and drops repeats, so "TbBrandCSharp, TbBrandCsharp" shows C# once.
export const splitTechnologies = (technologies?: string) => {
	const seen = new Set<string>();
	return (technologies ?? "")
		.split(/,|;/)
		.map(tech => tech.trim())
		.filter(tech => {
			if (!tech) return false;
			const label = techLabel(tech).toLowerCase();
			if (seen.has(label)) return false;
			seen.add(label);
			return true;
		});
};
