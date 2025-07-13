import { CertificationFormProps } from "../../../types/data-manager.types";

export const CertificationForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: CertificationFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Certification" : "Add New Certification"}</h4>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Name *</label>
					<input
						type="text"
						className="form-control"
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
						placeholder="Certification name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Issuer *</label>
					<input
						type="text"
						className="form-control"
						value={formData.issuer}
						onChange={e => setFormData({ ...formData, issuer: (e.target as HTMLInputElement).value })}
						placeholder="Issuing organization"
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Issue Date *</label>
					<input
						type="date"
						className="form-control"
						value={formData.issueDate}
						onChange={e => setFormData({ ...formData, issueDate: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Expiry Date</label>
					<input
						type="date"
						className="form-control"
						value={formData.expiryDate}
						onChange={e => setFormData({ ...formData, expiryDate: (e.target as HTMLInputElement).value })}
						placeholder="Leave empty if no expiry"
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Credential ID</label>
					<input
						type="text"
						className="form-control"
						value={formData.credentialId}
						onChange={e => setFormData({ ...formData, credentialId: (e.target as HTMLInputElement).value })}
						placeholder="Certificate ID or number"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Credential URL</label>
					<input
						type="url"
						className="form-control"
						value={formData.credentialUrl}
						onChange={e => setFormData({ ...formData, credentialUrl: (e.target as HTMLInputElement).value })}
						placeholder="https://example.com/verify"
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Category</label>
					<select
						className="form-select"
						value={formData.category}
						onChange={e => setFormData({ ...formData, category: (e.target as HTMLSelectElement).value })}
					>
						<option value="">Select category</option>
						<option value="cloud">Cloud</option>
						<option value="security">Security</option>
						<option value="development">Development</option>
						<option value="database">Database</option>
						<option value="devops">DevOps</option>
						<option value="project-management">Project Management</option>
						<option value="other">Other</option>
					</select>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Image URL</label>
					<input
						type="url"
						className="form-control"
						value={formData.imageUrl}
						onChange={e => setFormData({ ...formData, imageUrl: (e.target as HTMLInputElement).value })}
						placeholder="https://example.com/badge.png"
					/>
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label">Description</label>
				<textarea
					className="form-control"
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
					placeholder="Brief description of the certification"
					rows={3}
				/>
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
