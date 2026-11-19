import { useEffect, useState } from "preact/hooks";
import { apiRequest } from "../../utils/api";
import { markdownToHtml } from "../../utils/markdown";

export const ABOUT_CONTENT_ENDPOINT = "/api/content/about";

// The About Me text, from the admin panel's Markdown. A blank line starts a new paragraph and
// a single line break stays a line break. The admin panel's preview uses this same component.
export const AboutMeText = ({ content }: { content: string }) => (
	<>
		{content
			.split(/\n\s*\n/)
			.map(block => block.trim())
			.filter(Boolean)
			.map((block, index) => (
				<p key={index} className="fs-5 text-muted" dangerouslySetInnerHTML={{ __html: markdownToHtml(block) }} />
			))}
	</>
);

export const AboutMe = () => {
	const [content, setContent] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		apiRequest(ABOUT_CONTENT_ENDPOINT)
			.then(response => (response.ok ? response.json() : Promise.reject(response.status)))
			.then((row: { content: string }) => setContent(row.content))
			.catch(() => setError("Couldn't load this section."));
	}, []);

	return (
		<div className="about-content">
			<h2 className="display-4 fw-bold mb-4">About Me</h2>
			{error ? <p className="text-danger">{error}</p> : <AboutMeText content={content} />}
		</div>
	);
};
