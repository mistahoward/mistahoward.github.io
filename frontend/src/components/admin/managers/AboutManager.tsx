import { useEffect, useState } from "preact/hooks";
import { apiRequest } from "../../../utils/api";
import { showToast } from "../../../utils/sweetalert";
import { ErrorAlert, LoadingSpinner } from "../../../utils/ui";
import { ABOUT_CONTENT_ENDPOINT, AboutMeText } from "../../about/AboutMe";

// Edits the About Me text on the home page. It's saved as Markdown in the SiteContent table
// (key "about") and the preview below uses the site's own component, so it looks the same.
export const AboutManager = () => {
	const [saved, setSaved] = useState("");
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		apiRequest(ABOUT_CONTENT_ENDPOINT)
			.then(async response => {
				// No row yet just means nothing has been saved: start from an empty editor.
				if (response.status === 404) return "";
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const row: { content: string } = await response.json();
				return row.content;
			})
			.then(content => {
				setSaved(content);
				setDraft(content);
			})
			.catch(() => setError("Couldn't load the About Me text."))
			.finally(() => setLoading(false));
	}, []);

	const dirty = draft !== saved;

	const save = async () => {
		setSaving(true);
		setError("");
		try {
			const response = await apiRequest("/api/admin/content/about", {
				method: "PUT",
				body: JSON.stringify({ content: draft }),
			});
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.error || `HTTP ${response.status}`);
			}
			setSaved(draft);
			showToast("About Me saved");
		} catch (err) {
			setError(`Couldn't save: ${err instanceof Error ? err.message : "network error"}`);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="h-100 d-flex flex-column">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h3 className="mb-0">About Me</h3>
				<div className="d-flex gap-2">
					<button className="btn btn-secondary" onClick={() => setDraft(saved)} disabled={!dirty || saving}>
						Discard changes
					</button>
					<button className="btn btn-primary" onClick={save} disabled={!dirty || saving || !draft.trim()}>
						{saving ? "Saving..." : "Save"}
					</button>
				</div>
			</div>

			{error && <ErrorAlert error={error} />}

			{loading ? (
				<div className="flex-grow-1 d-flex align-items-center justify-content-center">
					<LoadingSpinner />
				</div>
			) : (
				<div className="flex-grow-1 overflow-auto">
					<label htmlFor="about-me-text" className="form-label">
						Text
					</label>
					<textarea
						id="about-me-text"
						className="form-control"
						rows={12}
						value={draft}
						onInput={e => setDraft((e.target as HTMLTextAreaElement).value)}
					/>
					<div className="form-text mb-3">
						Markdown: **bold**, *italic* and [a link](https://example.com). A blank line starts a new paragraph.
						{dirty && <span className="text-warning ms-2">Unsaved changes</span>}
					</div>
					<h6 className="text-muted">Preview</h6>
					<div className="about-content border rounded p-3">
						<AboutMeText content={draft} />
					</div>
				</div>
			)}
		</div>
	);
};
