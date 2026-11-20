import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import { Project } from "../../types/data-manager.types";
import { splitTechnologies } from "../../utils/technologies";
import { TechChips } from "../shared/TechChips";
import { ProjectBadges } from "./ProjectBadges";

const PREVIEW_TECH_COUNT = 4;

// A blank line in the admin form's description starts a new paragraph.
const splitParagraphs = (description?: string) =>
	(description ?? "")
		.split(/\n\s*\n/)
		.map(paragraph => paragraph.trim())
		.filter(Boolean);

// True while the clamped summary hides part of its text, so a short project gets no Read more.
const useIsClamped = (ref: { current: HTMLElement | null }, active: boolean) => {
	const [clamped, setClamped] = useState(false);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!active || !element) return undefined;
		const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [active]);

	return clamped;
};

const ExternalLink = ({ href, label, projectName }: { href: string; label: string; projectName: string }) => (
	<a href={href} target="_blank" rel="noopener noreferrer" className="project-meta-link">
		{label}
		<span className="visually-hidden">: {projectName}, opens in a new tab</span>
		<span className="project-meta-icon" aria-hidden="true">
			<FaExternalLinkAlt />
		</span>
	</a>
);

interface ProjectCardProps {
	project: Project;
	expanded: boolean;
	onToggle: (id: number) => void;
	className?: string;
}

// Closed: the first paragraph (clamped), a few tech chips and Read more. Open: every paragraph,
// the image if there is one, and every chip.
export const ProjectCard = ({ project, expanded, onToggle, className = "" }: ProjectCardProps) => {
	const summaryRef = useRef<HTMLParagraphElement>(null);
	const clamped = useIsClamped(summaryRef, !expanded);

	const paragraphs = splitParagraphs(project.description);
	const techs = splitTechnologies(project.technologies);
	const previewTechs = techs.slice(0, PREVIEW_TECH_COUNT);
	const hiddenTechCount = techs.length - previewTechs.length;
	const hasDetails = expanded || clamped || paragraphs.length > 1 || hiddenTechCount > 0 || !!project.imageUrl;
	const showPreviewTechs = !expanded && techs.length > 0;

	const titleId = `project-${project.id}-title`;
	const detailsId = `project-${project.id}-details`;
	const techHeadingId = `project-${project.id}-tech`;

	return (
		<article className={`project-card${className}`} aria-labelledby={titleId}>
			<div className="project-card-header">
				<h4 id={titleId} className="project-title">
					{project.name}
				</h4>
				<div className="project-meta">
					<ProjectBadges githubUrl={project.githubUrl} nugetPackageId={project.nugetPackageId} />
					{project.githubUrl && <ExternalLink href={project.githubUrl} label="GitHub" projectName={project.name} />}
					{project.liveUrl && <ExternalLink href={project.liveUrl} label="Live demo" projectName={project.name} />}
				</div>
			</div>

			<div id={detailsId} className="project-card-body">
				{expanded && project.imageUrl && <img src={project.imageUrl} alt={project.name} className="project-image" />}
				{paragraphs.length > 0 && (
					<div className="project-description">
						{expanded ? (
							paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
						) : (
							<p ref={summaryRef} className="project-summary">
								{paragraphs[0]}
							</p>
						)}
					</div>
				)}
				{expanded && techs.length > 0 && (
					<div>
						<p id={techHeadingId} className="project-tech-heading">
							Built with
						</p>
						<TechChips techs={techs} labelledBy={techHeadingId} />
					</div>
				)}
			</div>

			{(showPreviewTechs || hasDetails) && (
				<div className="project-card-footer">
					{showPreviewTechs && <TechChips techs={previewTechs} hiddenCount={hiddenTechCount} label="Built with" />}
					{hasDetails && (
						<button
							type="button"
							className="project-toggle"
							aria-expanded={expanded}
							aria-controls={detailsId}
							onClick={() => onToggle(project.id)}
						>
							{expanded ? "Show less" : "Read more"}
							<span className="visually-hidden"> about {project.name}</span>
							<span className="project-toggle-icon" aria-hidden="true">
								<FaChevronDown />
							</span>
						</button>
					)}
				</div>
			)}
		</article>
	);
};
