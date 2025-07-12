import { useState } from "preact/hooks";
import { AdminPanel } from "./components/admin/AdminPanel";
import { useKonamiCode } from "./utils/konami";
import { Navbar } from "./components/shared/nav/Navbar";
import { Home } from "./components/Home";
import { About } from "./components/about/About";
import { Projects } from "./components/Projects";
import { PetDex } from "./components/PetDex";
import { Contact } from "./components/Contact";

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<Navbar />

			<main>
				<Home />
				<About />
				<Projects />
				<PetDex />
				<Contact />
			</main>

			<AdminPanel isVisible={showAdmin} onClose={() => setShowAdmin(false)} />
		</>
	);
};
