import { useState } from "preact/hooks";
import { AdminPanel } from "./components/AdminPanel";
import { useKonamiCode } from "./utils/konami";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { About } from "./components/About";
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
