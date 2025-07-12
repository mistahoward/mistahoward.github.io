import { h } from "preact";
import { TbBrandCSharp } from "react-icons/tb";
import { SiBlazor, SiTypescript, SiJavascript, SiReact, SiXml, SiGit, SiSqlite, SiConfluence } from "react-icons/si";
import { VscAzureDevops } from "react-icons/vsc";

export const iconMap: Record<string, any> = {
	TbBrandCSharp,
	SiBlazor,
	SiTypescript,
	SiJavascript,
	VscAzureDevops,
	SiReact,
	SiXml,
	SiGit,
	SiSqlite,
	SiConfluence,
};

export const iconNameToLabel: Record<string, string> = {
	TbBrandCSharp: "C#",
	SiBlazor: "Blazor",
	SiTypescript: "TypeScript",
	SiJavascript: "JavaScript",
	VscAzureDevops: "Azure DevOps",
	SiReact: "React",
	SiXml: "XML",
	SiGit: "Git",
	SiSqlite: "SQLite",
	SiConfluence: "Confluence",
};

export const renderIcon = (iconName: string, size = 24, className = "me-2") => {
	const IconComponent = iconMap[iconName];
	if (IconComponent) return h(IconComponent, { size, className });
	return null;
}; 