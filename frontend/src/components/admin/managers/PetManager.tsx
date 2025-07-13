import { useState, useEffect } from "preact/hooks";
import { Pet, PetFormState } from "../../../types/pet-manager.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../../utils/crud";
import { ManagerLayout } from "../shared/ManagerLayout";
import { PetForm } from "../forms/PetForm";
import { apiRequestWithFormData } from "../../../utils/api";

export const PetManager = () => {
	const [pets, setPets] = useState<Pet[]>([]);
	const [editingPet, setEditingPet] = useState<Pet | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState<PetFormState>({
		name: "",
		species: "",
		breed: "",
		age: "",
		weight: "",
		color: "",
		personality: "",
		specialAbilities: "",
		favoriteFood: "",
		favoriteToy: "",
		rescueStory: "",
		imageUrl: "",
		iconUrl: "",
		stats: "",
		nickname: "",
		adoptedDate: "",
		isActive: true,
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreview, setIconPreview] = useState<string>("");

	const fetchPets = async () => {
		await fetchItems({
			endpoint: "/api/admin/pets",
			onSuccess: setPets,
			setError,
			setLoading,
		});
	};

	useEffect(() => {
		fetchPets();
	}, []);

	const handleCreate = () => {
		setIsCreating(true);
		setEditingPet(null);
		setFormData({
			name: "",
			species: "",
			breed: "",
			age: "",
			weight: "",
			color: "",
			personality: "",
			specialAbilities: "",
			favoriteFood: "",
			favoriteToy: "",
			rescueStory: "",
			imageUrl: "",
			iconUrl: "",
			stats: "",
			nickname: "",
			adoptedDate: "",
			isActive: true,
		});
		setImageFile(null);
		setImagePreview("");
		setIconFile(null);
		setIconPreview("");
	};

	const handleEdit = (pet: Pet) => {
		setEditingPet(pet);
		setIsCreating(false);
		setFormData({
			name: pet.name,
			species: pet.species,
			breed: pet.breed || "",
			age: pet.age?.toString() || "",
			weight: pet.weight?.toString() || "",
			color: pet.color || "",
			personality: pet.personality || "",
			specialAbilities: pet.specialAbilities || "",
			favoriteFood: pet.favoriteFood || "",
			favoriteToy: pet.favoriteToy || "",
			rescueStory: pet.rescueStory || "",
			imageUrl: pet.imageUrl || "",
			iconUrl: pet.iconUrl || "",
			stats: pet.stats || "",
			nickname: pet.nickname || "",
			adoptedDate: pet.adoptedDate || "",
			isActive: pet.isActive,
		});
		setImageFile(null);
		setImagePreview(pet.imageUrl || "");
		setIconFile(null);
		setIconPreview(pet.iconUrl || "");
	};

	const handleCancel = () => {
		setIsCreating(false);
		setEditingPet(null);
		setFormData({
			name: "",
			species: "",
			breed: "",
			age: "",
			weight: "",
			color: "",
			personality: "",
			specialAbilities: "",
			favoriteFood: "",
			favoriteToy: "",
			rescueStory: "",
			imageUrl: "",
			iconUrl: "",
			stats: "",
			nickname: "",
			adoptedDate: "",
			isActive: true,
		});
		setImageFile(null);
		setImagePreview("");
		setIconFile(null);
		setIconPreview("");
	};

	const handleImageChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = e => setImagePreview(e.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleImageRemove = () => {
		setImageFile(null);
		setImagePreview("");
	};

	const handleIconChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			setIconFile(file);
			const reader = new FileReader();
			reader.onload = e => setIconPreview(e.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleIconRemove = () => {
		setIconFile(null);
		setIconPreview("");
	};

	const uploadImage = async (file: File | null): Promise<string | null> => {
		if (!file) return null;
		try {
			const formData = new FormData();
			formData.append("image", file);
			const response = await apiRequestWithFormData("/api/admin/pets/upload-image", formData);
			if (response.ok) {
				const data = await response.json();
				return data.imageUrl;
			} else {
				setError("Failed to upload image");
				return null;
			}
		} catch (err) {
			setError("Network error uploading image");
			return null;
		}
	};

	const handleSubmit = async () => {
		let imageUrl = formData.imageUrl;
		let iconUrl = formData.iconUrl;
		if (imageFile) {
			const uploadedUrl = await uploadImage(imageFile);
			if (uploadedUrl) imageUrl = uploadedUrl;
			else return;
		}
		if (iconFile) {
			const uploadedIconUrl = await uploadImage(iconFile);
			if (uploadedIconUrl) iconUrl = uploadedIconUrl;
			else return;
		}
		const submitData = {
			...formData,
			imageUrl,
			iconUrl,
			age: formData.age ? parseInt(formData.age) : undefined,
			weight: formData.weight ? parseInt(formData.weight) : undefined,
		};
		if (editingPet) {
			await updateItem<Pet, typeof submitData>(
				"/api/admin/pets",
				editingPet.id,
				submitData,
				() => {
					// Update local state directly instead of refetching
					setPets(prevPets =>
						prevPets.map(pet =>
							pet.id === editingPet.id ? { ...pet, ...submitData, updatedAt: new Date().toISOString() } : pet
						)
					);
					handleCancel();
				},
				undefined,
				setError
			);
		} else {
			await createItem<Pet, typeof submitData>(
				"/api/admin/pets",
				submitData,
				() => {
					// For create, we need to refetch since we don't have the new pet's ID
					fetchPets();
					handleCancel();
				},
				undefined,
				setError
			);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirmDelete("this pet")) return;

		await deleteItem(
			"/api/admin/pets",
			id,
			() => {
				setPets(prevPets => prevPets.filter(pet => pet.id !== id));
			},
			undefined,
			setError
		);
	};

	return (
		<ManagerLayout title="Pet Management" loading={loading} error={error} onCreate={handleCreate} createButtonText="Add New Pet">
			{(isCreating || editingPet) && (
				<PetForm
					formData={formData}
					setFormData={setFormData}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					editingItem={editingPet}
					imageFile={imageFile}
					imagePreview={imagePreview}
					onImageChange={handleImageChange}
					onImageRemove={handleImageRemove}
					iconFile={iconFile}
					iconPreview={iconPreview}
					onIconChange={handleIconChange}
					onIconRemove={handleIconRemove}
				/>
			)}

			<div className="flex-grow-1 overflow-auto">
				{pets.map(pet => (
					<div key={pet.id} className={`card mb-2 ${!pet.isActive ? "opacity-75 bg-light" : ""}`}>
						<div className="card-body">
							<div className="d-flex gap-3">
								{pet.iconUrl && (
									<div className="flex-shrink-0 d-flex flex-column align-items-center me-2">
										<img
											src={pet.iconUrl}
											alt={pet.name + " icon"}
											className="img-thumbnail border border-primary"
											style={{ width: "48px", height: "48px", objectFit: "cover" }}
										/>
										<small className="text-muted">Icon</small>
									</div>
								)}
								{pet.imageUrl && (
									<div className="flex-shrink-0">
										<img
											src={pet.imageUrl}
											alt={pet.name}
											className="img-thumbnail"
											style={{ width: "80px", height: "80px", objectFit: "cover" }}
										/>
									</div>
								)}
								<div className="flex-grow-1">
									<div className="d-flex align-items-center gap-2 mb-1">
										<h5 className="card-title mb-0">{pet.name}</h5>
										{pet.nickname && <span className="text-muted fst-italic">({pet.nickname})</span>}
										<span className={`badge ${pet.isActive ? "bg-success" : "bg-secondary"}`}>
											{pet.isActive ? "Active" : "Inactive"}
										</span>
									</div>
									<p className="text-muted small mb-1">
										{pet.species} • {pet.breed || "Unknown breed"} • {pet.age ? ` ${pet.age} years old` : ""} •{" "}
										{pet.weight ? ` ${pet.weight} lbs` : ""}
									</p>
									{pet.color && <p className="small mb-1">Color: {pet.color}</p>}
									{pet.personality && <p className="small mb-0">Personality: {pet.personality}</p>}
								</div>
								<div className="d-flex gap-2">
									<button onClick={() => handleEdit(pet)} className="btn btn-warning btn-sm">
										Edit
									</button>
									<button onClick={() => handleDelete(pet.id)} className="btn btn-danger btn-sm">
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</ManagerLayout>
	);
};
