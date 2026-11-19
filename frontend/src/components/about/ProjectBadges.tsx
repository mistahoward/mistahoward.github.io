import { useEffect, useState } from "preact/hooks";
import { FaStar, FaExternalLinkAlt } from "react-icons/fa";
import { fetchGitHubStars, fetchNuGetInfo, formatDownloads, GitHubRepoInfo, NuGetPackageInfo } from "../../utils/projectBadges";

interface ProjectBadgesProps {
	githubUrl?: string;
	nugetPackageId?: string;
}

// Quiet inline stats for a project card's header: GitHub stars, then the NuGet version and downloads.
// Renders nothing until the lookups answer, and nothing at all when there's nothing to show.
export const ProjectBadges = ({ githubUrl, nugetPackageId }: ProjectBadgesProps) => {
	const [githubInfo, setGithubInfo] = useState<GitHubRepoInfo | null>(null);
	const [nugetInfo, setNugetInfo] = useState<NuGetPackageInfo | null>(null);

	useEffect(() => {
		let active = true;
		if (githubUrl)
			fetchGitHubStars(githubUrl).then(info => {
				if (active) setGithubInfo(info);
			});
		if (nugetPackageId)
			fetchNuGetInfo(nugetPackageId).then(info => {
				if (active) setNugetInfo(info);
			});
		return () => {
			active = false;
		};
	}, [githubUrl, nugetPackageId]);

	return (
		<>
			{githubInfo && githubInfo.stars > 0 && (
				<span className="project-meta-item" title="GitHub stars">
					<span className="project-meta-icon" aria-hidden="true">
						<FaStar />
					</span>
					{githubInfo.stars.toLocaleString()}
					<span className="visually-hidden"> GitHub stars</span>
				</span>
			)}
			{nugetInfo && (
				<>
					<a
						href={`https://www.nuget.org/packages/${nugetPackageId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="project-meta-link"
					>
						NuGet {nugetInfo.version}
						<span className="visually-hidden">, opens in a new tab</span>
						<span className="project-meta-icon" aria-hidden="true">
							<FaExternalLinkAlt />
						</span>
					</a>
					<span className="project-meta-item">{formatDownloads(nugetInfo.downloads)} downloads</span>
				</>
			)}
		</>
	);
};
