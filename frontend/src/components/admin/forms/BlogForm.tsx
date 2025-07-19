import { BlogFormProps } from "../../../types/blog-editor.types";
import { generateSlug, handleTextInputChange, handleTextAreaChange, handleCheckboxChange } from "../../../utils/form";
import { useEffect, useState, useRef } from "preact/hooks";
import { MarkdownEditor } from "./MarkdownEditor";

export const BlogForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: BlogFormProps) => {
	const [allTags, setAllTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
	const tagInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		fetch("/api/admin/tags", {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		})
			.then(res => res.json())
			.then(data => {
				const tags = Array.isArray(data) ? data : data.data || [];
				setAllTags(tags.map((t: any) => t.name));
			});
	}, []);

	useEffect(() => {
		if (tagInput.trim() === "") {
			setTagSuggestions([]);
			return;
		}
		const inputLower = tagInput.toLowerCase();
		setTagSuggestions(allTags.filter(t => t.toLowerCase().includes(inputLower) && !formData.tags.includes(t)));
	}, [tagInput, allTags, formData.tags]);

	const addTag = (tag: string) => {
		if (!formData.tags.includes(tag)) {
			setFormData({ ...formData, tags: [...formData.tags, tag] });
		}
		setTagInput("");
		setTagSuggestions([]);
		if (tagInputRef.current) tagInputRef.current.focus();
	};

	const removeTag = (tag: string) => {
		setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
	};

	const handleTagInputKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && tagInput.trim()) {
			e.preventDefault();
			addTag(tagInput.trim());
		}
		if (e.key === "Backspace" && !tagInput && formData.tags.length) {
			removeTag(formData.tags[formData.tags.length - 1]);
		}
	};

	const handleTagSuggestionClick = (tag: string) => {
		addTag(tag);
	};

	const handleTagInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setTagInput(target.value);
	};

	const handleGenerateSlug = () => {
		const slug = generateSlug(formData.title);
		setFormData({ ...formData, slug });
	};

	return (
		<div className="card mb-3">
			<div className="card-body">
				<h4 className="card-title">{editingItem ? "Edit Post" : "Create New Post"}</h4>

				<div className="mb-3">
					<label className="form-label">Title</label>
					<input
						type="text"
						className="form-control"
						value={formData.title}
						onChange={handleTextInputChange(formData, setFormData, "title")}
						placeholder="Post title"
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Slug</label>
					<div className="input-group">
						<input
							type="text"
							className="form-control"
							value={formData.slug}
							onChange={handleTextInputChange(formData, setFormData, "slug")}
							placeholder="post-slug"
						/>
						<button onClick={handleGenerateSlug} className="btn btn-outline-secondary">
							Generate
						</button>
					</div>
				</div>

				<div className="mb-3">
					<label className="form-label">Tags</label>
					<div className="d-flex flex-wrap gap-2 mb-2">
						{formData.tags.map(tag => (
							<span key={tag} className="badge bg-primary d-flex align-items-center" style={{ fontSize: "1rem" }}>
								{tag}
								<button
									type="button"
									className="btn-close btn-close-white ms-2"
									style={{ fontSize: "0.8rem" }}
									aria-label="Remove"
									onClick={() => removeTag(tag)}
								/>
							</span>
						))}
					</div>
					<input
						type="text"
						className="form-control"
						placeholder="Type to search or add tags..."
						value={tagInput}
						onInput={handleTagInputChange}
						onKeyDown={handleTagInputKeyDown as any}
						ref={tagInputRef}
					/>
					{tagSuggestions.length > 0 && (
						<ul className="list-group position-absolute" style={{ zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
							{tagSuggestions.map(tag => (
								<li
									key={tag}
									className="list-group-item list-group-item-action"
									style={{ cursor: "pointer" }}
									onClick={() => handleTagSuggestionClick(tag)}
								>
									{tag}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="mb-3">
					<label className="form-label">Excerpt</label>
					<textarea
						className="form-control"
						value={formData.excerpt}
						onChange={handleTextAreaChange(formData, setFormData, "excerpt")}
						placeholder="Brief description of the post"
						rows={3}
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Content</label>
					<MarkdownEditor
						value={formData.content}
						onChange={value => setFormData({ ...formData, content: value })}
						placeholder="Post content (markdown supported)"
						rows={15}
					/>
				</div>

				<div className="mb-3">
					<div className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							checked={formData.published}
							onChange={handleCheckboxChange(formData, setFormData, "published")}
							id="published-check"
						/>
						<label className="form-check-label" htmlFor="published-check">
							Published
						</label>
					</div>
				</div>

				<div className="d-flex gap-2">
					<button onClick={onSubmit} className="btn btn-primary">
						{editingItem ? "Update" : "Create"}
					</button>
					<button onClick={onCancel} className="btn btn-secondary">
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};
