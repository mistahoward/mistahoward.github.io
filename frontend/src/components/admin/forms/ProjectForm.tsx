import { ProjectFormProps } from "../../../types/data-manager.types";

export const ProjectForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: ProjectFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Project" : "Add New Project"}</h4>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Name *</label>
					<input
						type="text"
						className="form-control"
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
						placeholder="Project name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Project Type *</label>
					<select
						className="form-select"
						value={formData.projectType}
						onChange={e => setFormData({ ...formData, projectType: (e.target as HTMLSelectElement).value })}
					>
						<option value="personal">Personal</option>
						<option value="professional">Professional</option>
						<option value="academic">Academic</option>
					</select>
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label">Description</label>
				<textarea
					className="form-control"
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
					placeholder="Project description"
					rows={3}
				/>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">GitHub URL</label>
					<input
						type="url"
						className="form-control"
						value={formData.githubUrl}
						onChange={e => setFormData({ ...formData, githubUrl: (e.target as HTMLInputElement).value })}
						placeholder="https://github.com/username/repo"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Live URL</label>
					<input
						type="url"
						className="form-control"
						value={formData.liveUrl}
						onChange={e => setFormData({ ...formData, liveUrl: (e.target as HTMLInputElement).value })}
						placeholder="https://example.com"
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Technologies</label>
					<input
						type="text"
						className="form-control"
						value={formData.technologies}
						onChange={e => setFormData({ ...formData, technologies: (e.target as HTMLInputElement).value })}
						placeholder="React, Node.js, TypeScript (comma separated)"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Image URL</label>
					<input
						type="url"
						className="form-control"
						value={formData.imageUrl}
						onChange={e => setFormData({ ...formData, imageUrl: (e.target as HTMLInputElement).value })}
						placeholder="https://example.com/image.jpg"
					/>
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
