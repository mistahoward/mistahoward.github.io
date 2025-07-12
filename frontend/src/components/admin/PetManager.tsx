import { useState, useEffect } from "preact/hooks";
import { Pet, PetManagerProps } from "../../types/pet-manager.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../utils/crud";
import { handleTextInputChange, handleTextAreaChange, handleSelectChange, handleCheckboxChange, handleNumberInputChange } from "../../utils/form";
import { LoadingSpinner, ErrorAlert, formatDate } from "../../utils/ui";
import { API_URL, apiRequestWithFormData } from "../../utils/api";

export function PetManager({ lastFocusTime = 0 }: PetManagerProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
    stats: "",
    nickname: "",
    adoptedDate: "",
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    if (lastFocusTime > 0) {
      fetchPets();
    }
  }, [lastFocusTime]); 

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
      stats: "",
      nickname: "",
      adoptedDate: "",
      isActive: true,
    });
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
      stats: pet.stats || "",
      nickname: pet.nickname || "",
      adoptedDate: pet.adoptedDate || "",
      isActive: pet.isActive,
    });
    setImageFile(null);
    setImagePreview(pet.imageUrl || "");
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
      stats: "",
      nickname: "",
      adoptedDate: "",
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiRequestWithFormData('/api/admin/pets/upload-image', formData);

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        setError('Failed to upload image');
        return null;
      }
    } catch (err) {
      setError('Network error uploading image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    // Upload image first if there's a new image
    let imageUrl = formData.imageUrl;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return; // Don't proceed if image upload failed
      }
    }

    const submitData = {
      ...formData,
      imageUrl,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
    };

    if (editingPet) {
      await updateItem(
        "/api/admin/pets",
        editingPet.id,
        submitData,
        () => {
          fetchPets();
          handleCancel();
        },
        undefined,
        setError
      );
    } else {
      await createItem(
        "/api/admin/pets",
        submitData,
        () => {
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

    const success = await deleteItem(
      "/api/admin/pets",
      id,
      () => {
        // Remove the pet from local state immediately for responsive UI
        setPets(prevPets => prevPets.filter(pet => pet.id !== id));
      },
      undefined,
      setError
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Pet Management</h3>
        <button onClick={handleCreate} className="btn btn-success">
          Add New Pet
        </button>
      </div>

      {error && <ErrorAlert error={error} />}

      {(isCreating || editingPet) && (
        <div className="card mb-3">
          <div className="card-body">
            <h4 className="card-title">{editingPet ? "Edit Pet" : "Add New Pet"}</h4>
            
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
              <div className="col-md-6 mb-3">
                <label className="form-label">Breed</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: (e.target as HTMLInputElement).value })}
                  placeholder="Breed"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: (e.target as HTMLInputElement).value })}
                  placeholder="Nickname"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Age (years)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: (e.target as HTMLInputElement).value })}
                  placeholder="Age"
                  min="0"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Weight (lbs)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: (e.target as HTMLInputElement).value })}
                  placeholder="Weight"
                  min="0"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: (e.target as HTMLInputElement).value })}
                  placeholder="Color"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Personality Traits</label>
              <textarea
                className="form-control"
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: (e.target as HTMLTextAreaElement).value })}
                placeholder="Friendly, playful, shy, etc. (JSON array format)"
                rows={2}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Special Abilities</label>
              <textarea
                className="form-control"
                value={formData.specialAbilities}
                onChange={(e) => setFormData({ ...formData, specialAbilities: (e.target as HTMLTextAreaElement).value })}
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
                  onChange={(e) => setFormData({ ...formData, favoriteFood: (e.target as HTMLInputElement).value })}
                  placeholder="Favorite food"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Favorite Toy</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.favoriteToy}
                  onChange={(e) => setFormData({ ...formData, favoriteToy: (e.target as HTMLInputElement).value })}
                  placeholder="Favorite toy"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Rescue Story</label>
              <textarea
                className="form-control"
                value={formData.rescueStory}
                onChange={(e) => setFormData({ ...formData, rescueStory: (e.target as HTMLTextAreaElement).value })}
                placeholder="How you found/adopted this pet"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Pet Image</label>
              <div className="d-flex flex-column gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                  id="pet-image-upload"
                />
                
                {(imagePreview || formData.imageUrl) && (
                  <div className="position-relative d-inline-block">
                    <img 
                      src={imagePreview || formData.imageUrl} 
                      alt="Pet preview" 
                      className="img-thumbnail"
                      style={{ maxWidth: "200px", height: "150px", objectFit: "cover" }}
                    />
                    {imageFile && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
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
                onChange={(e) => setFormData({ ...formData, stats: (e.target as HTMLTextAreaElement).value })}
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
                  onChange={(e) => setFormData({ ...formData, adoptedDate: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div className="col-md-6 mb-3 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLInputElement).checked })}
                    id="active-check"
                  />
                  <label className="form-check-label" htmlFor="active-check">
                    Active (currently with you)
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button onClick={handleSubmit} className="btn btn-primary">
                {editingPet ? "Update" : "Create"}
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow-1 overflow-auto">
        {pets.map((pet) => (
          <div key={pet.id} className={`card mb-2 ${!pet.isActive ? "opacity-75 bg-light" : ""}`}>
            <div className="card-body">
              <div className="d-flex gap-3">
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
                    {pet.species} • {pet.breed || "Unknown breed"} • 
                    {pet.age ? ` ${pet.age} years old` : ""} • 
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
    </div>
  );
} 