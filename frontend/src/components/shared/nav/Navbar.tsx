import { useEffect, useState } from "preact/hooks";
import { route } from "preact-router";
import { ThemeToggle } from "./ThemeToggle";
import type { NavItem } from "../../../types/navbar.types";
import { updatePageTitle } from "../../../utils/title";

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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentPath, setCurrentPath] = useState<string>("");

	useEffect(() => {
		setCurrentPath(window.location.pathname);

		const handleRouteChange = () => setCurrentPath(window.location.pathname);

		window.addEventListener("popstate", handleRouteChange);

		const interval = setInterval(() => {
			if (window.location.pathname !== currentPath) setCurrentPath(window.location.pathname);
		}, 100);

		return () => {
			window.removeEventListener("popstate", handleRouteChange);
			clearInterval(interval);
		};
	}, [currentPath]);

	useEffect(() => {
		const homePageRoutes = ["/", "/about", "/projects", "/pet-dex", "/blogs"];
		const isHomePageRoute = homePageRoutes.includes(currentPath);
		const isBlogPostRoute = currentPath.startsWith("/blog/");

		if (isHomePageRoute) {
			const sectionIds = [...leftNavItems.map(item => item.id), ...rightNavItems.map(item => item.id)];
			const handleScroll = () => {
				const navbar = document.querySelector<HTMLElement>(".custom-navbar");
				const navbarHeight = navbar ? navbar.offsetHeight : 0;
				const offset = navbarHeight + 20;
				const active = sectionIds.find(id => {
					const section = document.getElementById(id);
					if (!section) return false;
					const rect = section.getBoundingClientRect();
					return rect.top <= offset && rect.bottom > offset;
				});
				setActiveSection(active || "");
				// Update page title based on active section
				updatePageTitle(active || "");
			};
			document.addEventListener("scroll", handleScroll, { passive: true });
			handleScroll();
			return () => document.removeEventListener("scroll", handleScroll);
		} else if (isBlogPostRoute) {
			// For blog post routes, don't apply scroll detection - let the blog post component handle the title
			setActiveSection("blogs");
		} else {
			switch (true) {
				case currentPath === "/about":
					setActiveSection("about");
					break;
				case currentPath === "/projects":
					setActiveSection("projects");
					break;
				case currentPath === "/pet-dex":
					setActiveSection("pet-dex");
					break;
				case currentPath === "/blogs":
				case currentPath.startsWith("/blog/"):
					setActiveSection("blogs");
					break;
				default:
					setActiveSection("");
					break;
			}
		}
	}, [currentPath]);

	const handleNavClick = (item: NavItem) => {
		if (item.id === "name") {
			route("/");
			setMobileMenuOpen(false);
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		route(`/${item.id}`);
		setMobileMenuOpen(false);
	};

	return (
		<nav className="custom-navbar">
			<div className="custom-navbar-inner">
				<div className="navbar-mobile-left d-sm-none">
					<button
						className="navbar-hamburger"
						aria-label="Open menu"
						onClick={() => setMobileMenuOpen(true)}
						style={{ display: mobileMenuOpen ? "none" : undefined }}
					>
						<span className="navbar-toggler-icon" />
					</button>
					<button className="nav-link fw-bold text-primary navbar-mobile-brand" onClick={() => handleNavClick(centerNavItem)}>
						{centerNavItem.label}
					</button>
				</div>
				<div className="navbar-theme-toggle d-sm-none">
					<ThemeToggle />
				</div>

				<div className="navbar-section left d-none d-sm-flex">
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
				<div className="navbar-section center d-none d-sm-flex">
					<button className="nav-link fw-bold text-primary" onClick={() => handleNavClick(centerNavItem)}>
						{centerNavItem.label}
					</button>
				</div>
				<div className="navbar-section right d-none d-sm-flex">
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
				<div className="navbar-theme-toggle d-none d-sm-flex">
					<ThemeToggle />
				</div>

				{mobileMenuOpen && (
					<div className="navbar-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
						<div className="navbar-mobile-menu" onClick={e => e.stopPropagation()}>
							<button className="navbar-mobile-close" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
								&times;
							</button>
							<div className="navbar-mobile-links">
								{[...leftNavItems, centerNavItem, ...rightNavItems].map(item => (
									<button
										key={item.id}
										className={`nav-link${activeSection === item.id ? " active" : ""}`}
										onClick={() => handleNavClick(item)}
									>
										{item.label}
									</button>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};
