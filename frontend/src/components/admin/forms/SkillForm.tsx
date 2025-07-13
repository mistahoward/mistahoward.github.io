import { SkillFormProps } from "../../../types/data-manager.types";

export const SkillForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: SkillFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Skill" : "Add New Skill"}</h4>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Name *</label>
					<input
						type="text"
						className="form-control"
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
						placeholder="Skill name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Category *</label>
					<select
						className="form-select"
						value={formData.category}
						onChange={e => setFormData({ ...formData, category: (e.target as HTMLSelectElement).value })}
					>
						<option value="">Select category</option>
						<option value="frontend">Frontend</option>
						<option value="backend">Backend</option>
						<option value="full-stack">Full-Stack</option>
						<option value="devops">DevOps</option>
						<option value="database">Database</option>
						<option value="mobile">Mobile</option>
						<option value="other">Other</option>
					</select>
				</div>
			</div>
			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Proficiency (1-5) *</label>
					<input
						type="number"
						className="form-control"
						value={formData.proficiency}
						onChange={e => setFormData({ ...formData, proficiency: parseInt((e.target as HTMLInputElement).value) })}
						min="1"
						max="5"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Icon</label>
					<input
						type="text"
						className="form-control"
						value={formData.icon}
						onChange={e => setFormData({ ...formData, icon: (e.target as HTMLInputElement).value })}
						placeholder="Icon class or URL"
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
