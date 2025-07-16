import { ProjectList } from "./about/ProjectList";

export const Projects = () => {
	return (
		<section id="projects" className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-8 text-center mb-5">
						<h2 className="display-4 fw-bold">Projects</h2>
					</div>
				</div>
				<div className="row justify-content-center">
					<div className="col-12">
						<ProjectList />
					</div>
				</div>
			</div>
		</section>
	);
};
