import { Hero } from "./Hero";

export const Home = () => {
	return (
		<section id="home" className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10">
			<div className="container text-center">
				<div className="row justify-content-center">
					<div className="col-lg-8">
						<Hero />
						<h1 className="display-2 fw-bold mb-3">Hey, I&apos;m Alex.</h1>
						<p className="display-5 lead text-primary mb-4">Full Stack Software Engineer II</p>
						<h2 className="text-muted">Front End Subject Matter Expert</h2>
						<p className="fs-3 text-muted">
							I&apos;m the engineer who makes sure the back-end is powerful and the front-end proves it.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
