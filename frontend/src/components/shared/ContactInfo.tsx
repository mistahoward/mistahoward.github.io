import { FaRegEnvelope } from "react-icons/fa";
import { LuFileUser, LuGithub, LuLinkedin } from "react-icons/lu";

export const ContactInfo = () => {
	return (
		<div className="mt-4 mb-5">
			<div className="d-flex justify-content-center gap-5 fs-2">
				<a
					href="https://github.com/mistahoward"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					className="text-primary"
				>
					<LuGithub />
				</a>
				<a
					href="https://linkedin.com/in/jalexhoward"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn"
					className="text-primary"
				>
					<LuLinkedin />
				</a>
				<a href="mailto:me@jayhoward.dev" aria-label="Email" className="text-primary">
					<FaRegEnvelope />
				</a>
				<a href="/resume.pdf" download="Jay-Howard-Resume.pdf" aria-label="Resume" title="Download resume" className="text-primary">
					<LuFileUser />
				</a>
			</div>
		</div>
	);
};
