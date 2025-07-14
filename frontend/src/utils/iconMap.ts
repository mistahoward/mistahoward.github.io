import { h } from "preact";
import { TbBrandCSharp } from "react-icons/tb";
import {
	SiBlazor,
	SiTypescript,
	SiJavascript,
	SiReact,
	SiXml,
	SiGit,
	SiSqlite,
	SiConfluence,
	SiDotnet,
	SiRedux,
	SiJquery,
	SiJest,
	SiRedis
} from "react-icons/si";
import {
	FaRecycle,
	FaHtml5,
	FaCss3Alt,
	FaSass,
	FaPython,
	FaLaravel,
	FaRust,
	FaBootstrap,
	FaTheaterMasks,
	FaDocker
} from "react-icons/fa";
import { VscAzureDevops } from "react-icons/vsc";
import { TbBrandReactNative } from "react-icons/tb";
import { RiPhpFill } from "react-icons/ri";
import { CgCPlusPlus } from "react-icons/cg";

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
	FaRecycle,
	FaHtml5,
	FaCss3Alt,
	FaSass,
	FaPython,
	TbBrandReactNative,
	RiPhpFill,
	FaLaravel,
	CgCPlusPlus,
	SiDotnet,
	SiRedux,
	SiJquery,
	FaRust,
	FaBootstrap,
	FaTheaterMasks,
	SiJest,
	FaDocker,
	SiRedis
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
	FaRecycle: "Agile Methodology",
	FaHtml5: "HTML5",
	FaCss3Alt: "CSS3",
	FaSass: "SCSS",
	FaPython: "Python",
	TbBrandReactNative: "React Native",
	RiPhpFill: "PHP",
	FaLaravel: "Laravel",
	CgCPlusPlus: "C++",
	SiDotnet: ".NET",
	SiRedux: "Redux",
	SiJquery: "jQuery",
	FaRust: "Rust",
	FaBootstrap: "Bootstrap",
	FaTheaterMasks: "Playwright",
	SiJest: "Jest",
	FaDocker: "Docker",
	SiRedis: "Redis"
};

export const renderIcon = (iconName: string, size = 24, className = "me-2") => {
	const IconComponent = iconMap[iconName];
	if (IconComponent) return h(IconComponent, { size, className });
	return null;
}; 