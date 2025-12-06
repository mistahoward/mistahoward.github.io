/**
 * Utility functions for fetching GitHub stars and NuGet package info
 */

export interface GitHubRepoInfo {
	stars: number;
	error?: string;
}

export interface NuGetPackageInfo {
	version: string;
	downloads: number;
	error?: string;
}

/**
 * Parse owner and repo from a GitHub URL
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/anything/else
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	try {
		const parsed = new URL(url);
		if (parsed.hostname !== "github.com") return null;

		const parts = parsed.pathname.split("/").filter(Boolean);
		if (parts.length < 2) return null;

		const owner = parts[0];
		let repo = parts[1];

		// Remove .git suffix if present
		if (repo.endsWith(".git")) {
			repo = repo.slice(0, -4);
		}

		return { owner, repo };
	} catch {
		return null;
	}
}

/**
 * Fetch GitHub repository star count
 * Returns null if the repo has 0 stars or on error (to hide the badge)
 */
export async function fetchGitHubStars(githubUrl: string): Promise<GitHubRepoInfo | null> {
	const parsed = parseGitHubUrl(githubUrl);
	if (!parsed) return null;

	try {
		const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		const stars = data.stargazers_count;

		// Only return if there are stars (hide badge for 0 stars)
		if (stars > 0) {
			return { stars };
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Fetch NuGet package info (version and downloads)
 */
export async function fetchNuGetInfo(packageId: string): Promise<NuGetPackageInfo | null> {
	if (!packageId) return null;

	try {
		// Use the NuGet search API to get package info
		const response = await fetch(
			`https://azuresearch-usnc.nuget.org/query?q=packageid:${encodeURIComponent(packageId)}&take=1`
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (!data.data || data.data.length === 0) {
			return null;
		}

		const pkg = data.data[0];

		// Verify we got the exact package (case-insensitive match)
		if (pkg.id.toLowerCase() !== packageId.toLowerCase()) {
			return null;
		}

		return {
			version: pkg.version,
			downloads: pkg.totalDownloads,
		};
	} catch {
		return null;
	}
}

/**
 * Format download count for display (e.g., 1.2K, 3.4M)
 */
export function formatDownloads(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1)}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1)}K`;
	}
	return count.toString();
}

