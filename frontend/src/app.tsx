import { useState } from "preact/hooks";
import { AdminPanel } from "./components/AdminPanel";
import { useKonamiCode } from "./utils/konami";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false);

	useKonamiCode(() => setShowAdmin(true));

	return (
		<>
			<Navbar />

			<main className="pt-2">
				<section id="home" className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10">
					<div className="container text-center">
						<div className="row justify-content-center">
							<div className="col-lg-8">
								<Hero />
								<h1 className="display-2 fw-bold mb-3">Hey, I&apos;m Alex.</h1>
								<p className="display-6 lead text-primary mb-4">Full Stack Software Engineer</p>
								<p className="fs-3 text-muted">
									I&apos;m the engineer who makes sure the back-end is powerful and the front-end proves it.
								</p>
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

				<section id="pet-dex" className="min-vh-100 d-flex align-items-center justify-content-center">
					<div className="container">
						<div className="row justify-content-center">
							<div className="col-lg-8 text-center">
								<h2 className="display-4 fw-bold mb-4">Pet Dex</h2>
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
