import { useEffect, useState } from "preact/hooks";
import { FaStar, FaDownload } from "react-icons/fa";
import { SiNuget } from "react-icons/si";
import { fetchGitHubStars, fetchNuGetInfo, formatDownloads, GitHubRepoInfo, NuGetPackageInfo } from "../../utils/projectBadges";

interface ProjectBadgesProps {
	githubUrl?: string;
	nugetPackageId?: string;
}

export const ProjectBadges = ({ githubUrl, nugetPackageId }: ProjectBadgesProps) => {
	const [githubInfo, setGithubInfo] = useState<GitHubRepoInfo | null>(null);
	const [nugetInfo, setNugetInfo] = useState<NuGetPackageInfo | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			const promises: Promise<void>[] = [];

			if (githubUrl) {
				promises.push(
					fetchGitHubStars(githubUrl).then(info => {
						setGithubInfo(info);
					})
				);
			}

			if (nugetPackageId) {
				promises.push(
					fetchNuGetInfo(nugetPackageId).then(info => {
						setNugetInfo(info);
					})
				);
			}

			await Promise.all(promises);
			setLoading(false);
		};

		fetchData();
	}, [githubUrl, nugetPackageId]);

	// Don't render anything if there's nothing to show
	if (!githubInfo && !nugetInfo && !loading) {
		return null;
	}

	// Style to match btn-sm height
	const badgeStyle = { padding: "0.25rem 0.5rem", fontSize: "0.875rem", lineHeight: "1.5" };

	return (
		<div className="d-flex flex-wrap gap-2 align-items-center">
			{/* NuGet Version Badge */}
			{nugetInfo && (
				<a
					href={`https://www.nuget.org/packages/${nugetPackageId}`}
					target="_blank"
					rel="noopener noreferrer"
					className="badge text-decoration-none d-flex align-items-center gap-1"
					style={{ ...badgeStyle, backgroundColor: "#004880" }}
					title={`NuGet Package: ${nugetPackageId}`}
				>
					<SiNuget />
					{nugetInfo.version}
				</a>
			)}

			{/* NuGet Downloads Badge */}
			{nugetInfo && (
				<span
					className="badge d-flex align-items-center gap-1"
					style={{ ...badgeStyle, backgroundColor: "#004880" }}
					title="NuGet Downloads"
				>
					<FaDownload size={12} />
					{formatDownloads(nugetInfo.downloads)}
				</span>
			)}

			{/* GitHub Stars Badge - next to GitHub button */}
			{githubInfo && githubInfo.stars > 0 && (
				<span className="badge bg-dark d-flex align-items-center gap-1" style={badgeStyle} title="GitHub Stars">
					<FaStar style={{ color: "#ffc107" }} />
					{githubInfo.stars.toLocaleString()}
				</span>
			)}
		</div>
	);
};
