import { useState, useEffect } from "preact/hooks";
import { AdminPanel } from "./components/admin/AdminPanel";
import { useKonamiCode } from "./utils/konami";
import { Navbar } from "./components/shared/nav/Navbar";
import { Home } from "./components/Home";
import { About } from "./components/about/About";
import { Projects } from "./components/Projects";
import { PetDex } from "./components/PetDex";
import { Blogs } from "./components/Blogs";
import Router from "preact-router";
import { TestimonialSubmitPage } from "./components/about/TestimonialSubmitPage";
import BlogPostPage from "./components/BlogPostPage";

// Component to handle scrolling to sections based on route
const SectionScroller = () => {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);

	useEffect(() => {
		// Update current path when location changes
		const handleRouteChange = () => {
			setCurrentPath(window.location.pathname);
		};

		window.addEventListener("popstate", handleRouteChange);

		// Also check periodically for route changes
		const interval = setInterval(() => {
			if (window.location.pathname !== currentPath) {
				setCurrentPath(window.location.pathname);
			}
		}, 100);

		return () => {
			window.removeEventListener("popstate", handleRouteChange);
			clearInterval(interval);
		};
	}, [currentPath]);

	useEffect(() => {
		const sectionMap: Record<string, string> = {
			"/about": "about",
			"/projects": "projects",
			"/pet-dex": "pet-dex",
			"/blogs": "blogs",
		};

		// Don't try to scroll for blog post routes
		if (currentPath.startsWith("/blog/")) {
			console.log("SectionScroller: Blog post route detected, skipping scroll");
			return;
		}

		const sectionId = sectionMap[currentPath];
		if (sectionId) {
			console.log(`SectionScroller: Navigating to ${currentPath}, looking for section ${sectionId}`);

			// Wait longer for components to render, especially if they're loading data
			const scrollToSection = () => {
				const element = document.getElementById(sectionId);
				const navbar = document.querySelector<HTMLElement>(".custom-navbar");

				if (element) {
					console.log(`SectionScroller: Found element, scrolling to ${sectionId}`);
					const navbarHeight = navbar ? navbar.offsetHeight : 0;
					const offset = navbarHeight + 8;
					const rect = element.getBoundingClientRect();
					const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
					const top = rect.top + scrollTop - offset;
					window.scrollTo({ top, behavior: "smooth" });
				} else {
					console.log(`SectionScroller: Element not found, retrying...`);
					// Retry after a longer delay
					setTimeout(scrollToSection, 500);
				}
			};

			// Initial delay, then retry if needed
			setTimeout(scrollToSection, 200);
		}
	}, [currentPath]);

	return null;
};

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<Navbar />
			<SectionScroller />

			<Router>
				<main path="/">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<main path="/about">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<main path="/projects">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<main path="/pet-dex">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<main path="/blogs">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<BlogPostPage path="/blog/:slug" />
				<TestimonialSubmitPage path="/testimonials/submit" />
			</Router>

			<AdminPanel isVisible={showAdmin} onClose={() => setShowAdmin(false)} />
		</>
	);
};
