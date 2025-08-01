import { TestimonialFormProps } from "../../../types/data-manager.types";

export const TestimonialForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: TestimonialFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Testimonial" : "Add New Testimonial"}</h4>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Client Name *</label>
					<input
						type="text"
						className="form-control"
						value={formData.clientName}
						onChange={e => setFormData({ ...formData, clientName: (e.target as HTMLInputElement).value })}
						placeholder="Client name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Client Title</label>
					<input
						type="text"
						className="form-control"
						value={formData.clientTitle}
						onChange={e => setFormData({ ...formData, clientTitle: (e.target as HTMLInputElement).value })}
						placeholder="Job title"
					/>
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label">Client Company</label>
				<input
					type="text"
					className="form-control"
					value={formData.clientCompany}
					onChange={e => setFormData({ ...formData, clientCompany: (e.target as HTMLInputElement).value })}
					placeholder="Company name"
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Content *</label>
				<textarea
					className="form-control"
					value={formData.content}
					onChange={e => setFormData({ ...formData, content: (e.target as HTMLTextAreaElement).value })}
					placeholder="Testimonial content"
					rows={4}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label">Relationship *</label>
				<input
					type="text"
					className="form-control"
					value={formData.relationship}
					onChange={e => setFormData({ ...formData, relationship: (e.target as HTMLInputElement).value })}
					placeholder="How do you know Alex?"
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
