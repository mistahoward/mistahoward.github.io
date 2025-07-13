import { ExperienceFormProps } from "../../../types/data-manager.types";

export const ExperienceForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: ExperienceFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Experience" : "Add New Experience"}</h4>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Company *</label>
					<input
						type="text"
						className="form-control"
						value={formData.company}
						onChange={e => setFormData({ ...formData, company: (e.target as HTMLInputElement).value })}
						placeholder="Company name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Position *</label>
					<input
						type="text"
						className="form-control"
						value={formData.position}
						onChange={e => setFormData({ ...formData, position: (e.target as HTMLInputElement).value })}
						placeholder="Job title"
					/>
				</div>
			</div>
			<div className="mb-3">
				<label className="form-label">Description</label>
				<textarea
					className="form-control"
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
					placeholder="Job description"
					rows={3}
				/>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Start Date *</label>
					<input
						type="date"
						className="form-control"
						value={formData.startDate}
						onChange={e => setFormData({ ...formData, startDate: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">End Date</label>
					<input
						type="date"
						className="form-control"
						value={formData.endDate}
						onChange={e => setFormData({ ...formData, endDate: (e.target as HTMLInputElement).value })}
						disabled={formData.current}
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Technologies (icon name, comma separated)</label>
					<input
						type="text"
						className="form-control"
						value={formData.technologies}
						onChange={e => setFormData({ ...formData, technologies: (e.target as HTMLInputElement).value })}
						placeholder="e.g. TbBrandCSharp"
					/>
				</div>
				<div className="col-md-6 mb-3 d-flex align-items-end">
					<div className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							checked={formData.current}
							onChange={e => setFormData({ ...formData, current: (e.target as HTMLInputElement).checked })}
							id="current-check"
						/>
						<label className="form-check-label" htmlFor="current-check">
							Current Position
						</label>
					</div>
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
