import { ThemeToggle } from "./ThemeToggle";
import type { NavItem } from "../types/navbar.types";

const leftNavItems: NavItem[] = [
	{ id: "about", label: "About" },
	{ id: "projects", label: "Projects" },
];
const centerNavItem: NavItem = { id: "name", label: "A.H" };
const rightNavItems: NavItem[] = [
	{ id: "pet-dex", label: "Pet-Dex" },
	{ id: "contact", label: "Contact" },
];

export const Navbar = () => {
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
					<button key={item.id} className="nav-link" onClick={() => handleNavClick(item)}>
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
					<button key={item.id} className="nav-link" onClick={() => handleNavClick(item)}>
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
