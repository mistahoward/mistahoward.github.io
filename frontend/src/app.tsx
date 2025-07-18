import { useState } from "preact/hooks";
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

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<Navbar />

			<Router>
				<main path="/">
					<Home />
					<About />
					<Projects />
					<PetDex />
					<Blogs />
				</main>
				<TestimonialSubmitPage path="/testimonials/submit" />
			</Router>

			<AdminPanel isVisible={showAdmin} onClose={() => setShowAdmin(false)} />
		</>
	);
};
