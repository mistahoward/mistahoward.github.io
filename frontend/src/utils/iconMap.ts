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
	SiRedis,
	SiPreact,
	SiCloudflare,
	SiServerless,
	SiLangchain,
	SiFastapi,
	SiMysql,
	SiGatsby,
	SiFirebase,
	SiClaude,
	SiOllama,
	SiNodedotjs,
	SiForgejo
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
import { MdDataArray } from "react-icons/md";
import { DiMsqlServer } from "react-icons/di";
import { PiWindowsLogo } from "react-icons/pi";

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
	SiRedis,
	SiPreact,
	SiCloudflare,
	SiServerless,
	SiLangchain,
	SiFastapi,
	SiMysql,
	MdDataArray,
	DiMsqlServer,
	PiWindowsLogo,
	SiGatsby,
	SiFirebase,
	SiClaude,
	SiOllama,
	SiNodedotjs,
	SiForgejo
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
	SiRedis: "Redis",
	SiPreact: "Preact",
	SiCloudflare: "Cloudflare",
	SiServerless: "Serverless",
	SiLangchain: "Langchain",
	SiFastapi: "FastAPI",
	SiMysql: "MySQL",
	MdDataArray: "Vertex Database",
	DiMsqlServer: "Microsoft SQL Server",
	PiWindowsLogo: "Windows Forms",
	SiGatsby: "Gatsby",
	SiFirebase: "Firebase",
	SiClaude: "Claude Code",
	SiOllama: "Ollama",
	SiNodedotjs: "Node.js",
	SiForgejo: "Forgejo Actions"
};

// Labels without spaces or case ("claudecode", "node.js"), mapped back to their icon keys.
const normalize = (name: string) => name.replace(/\s+/g, "").toLowerCase();
const iconNameByLabel: Record<string, string> = Object.fromEntries(
	Object.entries(iconNameToLabel).map(([iconName, label]) => [normalize(label), iconName])
);

// Takes an icon key ("SiReact") or a label ("React", "Claude Code"), so a technology typed
// by its plain name still gets its icon.
export const renderIcon = (iconName: string, size = 24, className = "me-2") => {
	const IconComponent = iconMap[iconName] ?? iconMap[iconNameByLabel[normalize(iconName)]];
	if (IconComponent) return h(IconComponent, { size, className });
	return null;
};