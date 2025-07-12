import { useState } from "preact/hooks";
import { AdminPanel } from "./components/AdminPanel";
import { useKonamiCode } from "./utils/konami";

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<div className="app-container">
				<header className="app-header">
					<h1>Your Name</h1>
					<p className="tagline">Developer & Designer</p>
				</header>

				<main className="app-main">
					<div className="welcome-section">
						<h2>Welcome to My Portfolio</h2>
						<p>This is where your amazing portfolio content will live.</p>
					</div>
				</main>
			</div>

			<AdminPanel isVisible={showAdmin} onClose={() => setShowAdmin(false)} />
		</>
	);
};
