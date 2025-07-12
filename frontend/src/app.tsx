import { useState } from "preact/hooks";
import { AdminPanel } from "./components/AdminPanel";
import { useKonamiCode } from "./utils/konami";
import { Navbar } from "./components/Navbar";

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<Navbar />

			<main className="pt-5">
				<section id="home" className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10">
					<div className="container text-center">
						<div className="row justify-content-center">
							<div className="col-lg-8">
								<h1 className="display-3 fw-bold mb-3">Your Name</h1>
								<p className="lead text-muted mb-4">Developer & Designer</p>
								<h2 className="h3 mb-4">Welcome to My Portfolio</h2>
								<p className="fs-5 text-muted">This is where your amazing portfolio content will live.</p>
							</div>
						</div>
					</div>
				</section>

				<section id="about" className="min-vh-100 d-flex align-items-center justify-content-center">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-lg-8 text-center">
								<h2 className="display-4 fw-bold mb-4">About Me</h2>
								<p className="fs-5 text-muted">Tell your story here...</p>
							</div>
						</div>
					</div>
				</section>

				<section id="projects" className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-lg-8 text-center">
								<h2 className="display-4 fw-bold mb-4">Projects</h2>
								<p className="fs-5 text-muted">Showcase your work here...</p>
							</div>
						</div>
					</div>
				</section>

				<section id="contact" className="min-vh-100 d-flex align-items-center justify-content-center">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-lg-8 text-center">
								<h2 className="display-4 fw-bold mb-4">Contact</h2>
								<p className="fs-5 text-muted">Get in touch...</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			<AdminPanel isVisible={showAdmin} onClose={() => setShowAdmin(false)} />
		</>
	);
};
