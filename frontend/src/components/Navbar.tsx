import { useState } from "preact/hooks";
import type { NavItem } from "../types/navbar.types";

const navItems: NavItem[] = [
	{ id: "home", label: "Home" },
	{ id: "about", label: "About" },
	{ id: "projects", label: "Projects" },
	{ id: "contact", label: "Contact" },
];

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element)
			element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		setIsMenuOpen(false);
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
			<div className="container">
				<a className="navbar-brand fw-bold" href="#">
					Your Name
				</a>

				<button
					className="navbar-toggler"
					type="button"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-controls="navbarNav"
					aria-expanded={isMenuOpen}
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`} id="navbarNav">
					<ul className="navbar-nav ms-auto">
						{navItems.map(item => (
							<li key={item.id} className="nav-item">
								<button className="nav-link btn btn-link" onClick={() => scrollToSection(item.id)}>
									{item.label}
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		</nav>
	);
};
