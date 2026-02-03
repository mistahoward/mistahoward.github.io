import { PetFormProps } from "../../../types/pet-manager.types";
import { handleTextInputChange, handleSelectChange } from "../../../utils/form";

export const PetForm = ({
	formData,
	setFormData,
	onSubmit,
	onCancel,
	editingItem,
	imageFile,
	imagePreview,
	onImageChange,
	onImageRemove,
	iconFile,
	iconPreview,
	onIconChange,
	onIconRemove,
}: PetFormProps) => (
	<div className="card mb-3">
		<div className="card-body">
			<h4 className="card-title">{editingItem ? "Edit Pet" : "Add New Pet"}</h4>

			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Name *</label>
					<input
						type="text"
						className="form-control"
						value={formData.name}
						onChange={handleTextInputChange(formData, setFormData, "name")}
						placeholder="Pet name"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Species *</label>
					<select
						className="form-select"
						value={formData.species}
						onChange={handleSelectChange(formData, setFormData, "species")}
					>
						<option value="">Select species</option>
						<option value="cat">Cat</option>
						<option value="dog">Dog</option>
						<option value="other">Other</option>
					</select>
				</div>
			</div>

			<div className="row">
				<div className="col-md-4 mb-3">
					<label className="form-label">Breed</label>
					<input
						type="text"
						className="form-control"
						value={formData.breed}
						onChange={e => setFormData({ ...formData, breed: (e.target as HTMLInputElement).value })}
						placeholder="Breed"
					/>
				</div>
				<div className="col-md-4 mb-3">
					<label className="form-label">Nickname</label>
					<input
						type="text"
						className="form-control"
						value={formData.nickname}
						onChange={e => setFormData({ ...formData, nickname: (e.target as HTMLInputElement).value })}
						placeholder="Nickname"
					/>
				</div>
				<div className="col-md-4 mb-3">
					<label className="form-label">Dex ID</label>
					<input
						type="text"
						className="form-control"
						value={formData.dexId}
						onChange={e => setFormData({ ...formData, dexId: (e.target as HTMLInputElement).value })}
						placeholder="e.g., #001, #002"
					/>
				</div>
			</div>

			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Age (years)</label>
					<input
						type="number"
						className="form-control"
						value={formData.age}
						onChange={e => setFormData({ ...formData, age: (e.target as HTMLInputElement).value })}
						placeholder="Age"
						min="0"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Color</label>
					<input
						type="text"
						className="form-control"
						value={formData.color}
						onChange={e => setFormData({ ...formData, color: (e.target as HTMLInputElement).value })}
						placeholder="Color"
					/>
				</div>
			</div>

			<div className="mb-3">
				<label className="form-label">Personality Traits</label>
				<textarea
					className="form-control"
					value={formData.personality}
					onChange={e => setFormData({ ...formData, personality: (e.target as HTMLTextAreaElement).value })}
					placeholder="Friendly, playful, shy, etc. (JSON array format)"
					rows={2}
				/>
			</div>

			<div className="mb-3">
				<label className="form-label">Special Abilities</label>
				<textarea
					className="form-control"
					value={formData.specialAbilities}
					onChange={e => setFormData({ ...formData, specialAbilities: (e.target as HTMLTextAreaElement).value })}
					placeholder="Can open doors, knows tricks, etc. (JSON array format)"
					rows={2}
				/>
			</div>

			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Favorite Food</label>
					<input
						type="text"
						className="form-control"
						value={formData.favoriteFood}
						onChange={e => setFormData({ ...formData, favoriteFood: (e.target as HTMLInputElement).value })}
						placeholder="Favorite food"
					/>
				</div>
				<div className="col-md-6 mb-3">
					<label className="form-label">Favorite Toy</label>
					<input
						type="text"
						className="form-control"
						value={formData.favoriteToy}
						onChange={e => setFormData({ ...formData, favoriteToy: (e.target as HTMLInputElement).value })}
						placeholder="Favorite toy"
					/>
				</div>
			</div>

			<div className="mb-3">
				<label className="form-label">Description</label>
				<textarea
					className="form-control"
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
					placeholder="A brief description of this pet"
					rows={3}
				/>
			</div>

			<div className="mb-3">
				<label className="form-label">Origin Story</label>
				<textarea
					className="form-control"
					value={formData.originStory}
					onChange={e => setFormData({ ...formData, originStory: (e.target as HTMLTextAreaElement).value })}
					placeholder="The lore and story of how this pet came to be"
					rows={3}
				/>
			</div>

			<div className="mb-3">
				<label className="form-label">Pet Image</label>
				<div className="d-flex flex-column gap-2">
					<input type="file" accept="image/*" onChange={onImageChange} className="form-control" id="pet-image-upload" />

					{(imagePreview || formData.imageUrl) && (
						<div className="position-relative d-inline-block">
							<img
								src={imagePreview || formData.imageUrl}
								alt="Pet preview"
								className="img-thumbnail"
								style={{
									maxWidth: "200px",
									height: "150px",
									objectFit: "cover",
								}}
							/>
							{imageFile && (
								<button
									type="button"
									onClick={onImageRemove}
									className="btn btn-danger btn-sm position-absolute top-0 end-0"
									style={{ margin: "5px" }}
								>
									×
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mb-3">
				<label className="form-label">Pet Icon (for PetDex)</label>
				<div className="d-flex flex-column gap-2">
					<input type="file" accept="image/*" onChange={onIconChange} className="form-control" id="pet-icon-upload" />

					{(iconPreview || formData.iconUrl) && (
						<div className="position-relative d-inline-block">
							<img
								src={iconPreview || formData.iconUrl}
								alt="Pet icon preview"
								className="img-thumbnail"
								style={{ maxWidth: "80px", height: "80px", objectFit: "cover" }}
							/>
							{iconFile && (
								<button
									type="button"
									onClick={onIconRemove}
									className="btn btn-danger btn-sm position-absolute top-0 end-0"
									style={{ margin: "5px" }}
								>
									×
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mb-3">
				<label className="form-label">Stats (JSON format)</label>
				<textarea
					className="form-control"
					value={formData.stats}
					onChange={e => setFormData({ ...formData, stats: (e.target as HTMLTextAreaElement).value })}
					placeholder='{"hp": 100, "attack": 50, "defense": 30, "speed": 80}'
					rows={2}
				/>
			</div>

			<div className="row">
				<div className="col-md-6 mb-3">
					<label className="form-label">Adopted Date</label>
					<input
						type="date"
						className="form-control"
						value={formData.adoptedDate}
						onChange={e => setFormData({ ...formData, adoptedDate: (e.target as HTMLInputElement).value })}
					/>
				</div>
				<div className="col-md-6 mb-3 d-flex align-items-end">
					<div className="d-flex flex-column gap-2">
						<div className="form-check">
							<input
								type="checkbox"
								className="form-check-input"
								checked={formData.isActive}
								onChange={e => setFormData({ ...formData, isActive: (e.target as HTMLInputElement).checked })}
								id="active-check"
							/>
							<label className="form-check-label" htmlFor="active-check">
								Active (currently with you)
							</label>
						</div>
						<div className="form-check">
							<input
								type="checkbox"
								className="form-check-input"
								checked={formData.isMemorial}
								onChange={e => setFormData({ ...formData, isMemorial: (e.target as HTMLInputElement).checked })}
								id="memorial-check"
							/>
							<label className="form-check-label" htmlFor="memorial-check">
								Memorial (Rainbow Bridge)
							</label>
						</div>
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
