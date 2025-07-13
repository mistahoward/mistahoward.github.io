import { BlogFormProps } from "../../../types/blog-editor.types";
import { generateSlug, handleTextInputChange, handleTextAreaChange, handleCheckboxChange } from "../../../utils/form";

export const BlogForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: BlogFormProps) => {
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
					<textarea
						className="form-control"
						value={formData.content}
						onChange={handleTextAreaChange(formData, setFormData, "content")}
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
