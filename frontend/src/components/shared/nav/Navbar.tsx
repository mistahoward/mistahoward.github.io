import { useEffect, useState } from "preact/hooks";
import { ThemeToggle } from "./ThemeToggle";
import type { NavItem } from "../../../types/navbar.types";

const leftNavItems: NavItem[] = [
	{ id: "about", label: "About" },
	{ id: "projects", label: "Projects" },
];
const centerNavItem: NavItem = { id: "name", label: "A.H" };
const rightNavItems: NavItem[] = [
	{ id: "pet-dex", label: "Pet-Dex" },
	{ id: "blogs", label: "Blogs" },
];

export const Navbar = () => {
	const [activeSection, setActiveSection] = useState<string>("");

	useEffect(() => {
		const sectionIds = [...leftNavItems.map(item => item.id), ...rightNavItems.map(item => item.id)];
		const handleScroll = () => {
			const active = sectionIds.find(id => {
				const section = document.getElementById(id);
				if (!section) return false;
				const rect = section.getBoundingClientRect();
				return rect.top <= 80 && rect.bottom > 80;
			});
			setActiveSection(active || "");
		};
		document.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => document.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const handleNavClick = (item: NavItem) => {
		if (item.id === "name") {
			document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "start" });
			return;
		}
		scrollToSection(item.id);
	};

	return (
		<nav className="custom-navbar">
			<div className="navbar-section left">
				{leftNavItems.map(item => (
					<button
						key={item.id}
						className={`nav-link${activeSection === item.id ? " active" : ""}`}
						onClick={() => handleNavClick(item)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className="navbar-section center">
				<button className="nav-link fw-bold text-primary" onClick={() => handleNavClick(centerNavItem)}>
					{centerNavItem.label}
				</button>
			</div>
			<div className="navbar-section right">
				{rightNavItems.map(item => (
					<button
						key={item.id}
						className={`nav-link${activeSection === item.id ? " active" : ""}`}
						onClick={() => handleNavClick(item)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className="navbar-theme-toggle">
				<ThemeToggle />
			</div>
		</nav>
	);
};
