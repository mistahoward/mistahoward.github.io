import { useState, useEffect } from "preact/hooks";
import "./PetManager.scss";

const API_URL = import.meta.env.VITE_API_URL;

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  personality?: string;
  specialAbilities?: string;
  favoriteFood?: string;
  favoriteToy?: string;
  rescueStory?: string;
  imageUrl?: string;
  stats?: string;
  nickname?: string;
  adoptedDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PetManagerProps {
  lastFocusTime?: number;
}

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/pets`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        setError("Failed to fetch pets");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
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

      const response = await fetch(`${API_URL}/api/admin/pets/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeaders().Authorization,
        },
        body: formData,
      });

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
    try {
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

      const url = editingPet 
        ? `${API_URL}/api/admin/pets/${editingPet.id}`
        : `${API_URL}/api/admin/pets`;
      
      const method = editingPet ? "PUT" : "POST";
      
      const submitData = {
        ...formData,
        imageUrl,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
      };
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchPets();
        handleCancel();
        setError("");
      } else {
        setError("Failed to save pet");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/pets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        // Remove the pet from local state immediately for responsive UI
        setPets(prevPets => prevPets.filter(pet => pet.id !== id));
        setError("");
      } else {
        setError("Failed to delete pet");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="pet-manager">
      <div className="pet-header">
        <h3>Pet Management</h3>
        <button onClick={handleCreate} className="create-btn">
          Add New Pet
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {(isCreating || editingPet) && (
        <div className="pet-form">
          <h4>{editingPet ? "Edit Pet" : "Add New Pet"}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
                placeholder="Pet name"
              />
            </div>
            <div className="form-group">
              <label>Species *</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: (e.target as HTMLSelectElement).value })}
              >
                <option value="">Select species</option>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: (e.target as HTMLInputElement).value })}
                placeholder="Breed"
              />
            </div>
            <div className="form-group">
              <label>Nickname</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: (e.target as HTMLInputElement).value })}
                placeholder="Nickname"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: (e.target as HTMLInputElement).value })}
                placeholder="Age"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Weight (lbs)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: (e.target as HTMLInputElement).value })}
                placeholder="Weight"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: (e.target as HTMLInputElement).value })}
                placeholder="Color"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Personality Traits</label>
            <textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: (e.target as HTMLTextAreaElement).value })}
              placeholder="Friendly, playful, shy, etc. (JSON array format)"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Special Abilities</label>
            <textarea
              value={formData.specialAbilities}
              onChange={(e) => setFormData({ ...formData, specialAbilities: (e.target as HTMLTextAreaElement).value })}
              placeholder="Can open doors, knows tricks, etc. (JSON array format)"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Favorite Food</label>
              <input
                type="text"
                value={formData.favoriteFood}
                onChange={(e) => setFormData({ ...formData, favoriteFood: (e.target as HTMLInputElement).value })}
                placeholder="Favorite food"
              />
            </div>
            <div className="form-group">
              <label>Favorite Toy</label>
              <input
                type="text"
                value={formData.favoriteToy}
                onChange={(e) => setFormData({ ...formData, favoriteToy: (e.target as HTMLInputElement).value })}
                placeholder="Favorite toy"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rescue Story</label>
            <textarea
              value={formData.rescueStory}
              onChange={(e) => setFormData({ ...formData, rescueStory: (e.target as HTMLTextAreaElement).value })}
              placeholder="How you found/adopted this pet"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Pet Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                id="pet-image-upload"
              />
              <label htmlFor="pet-image-upload" className="image-upload-label">
                {uploadingImage ? "Uploading..." : "Choose Image"}
              </label>
              
              {(imagePreview || formData.imageUrl) && (
                <div className="image-preview">
                  <img 
                    src={imagePreview || formData.imageUrl} 
                    alt="Pet preview" 
                    className="preview-image"
                  />
                  {imageFile && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="remove-image-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Stats (JSON format)</label>
            <textarea
              value={formData.stats}
              onChange={(e) => setFormData({ ...formData, stats: (e.target as HTMLTextAreaElement).value })}
              placeholder='{"hp": 100, "attack": 50, "defense": 30, "speed": 80}'
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Adopted Date</label>
              <input
                type="date"
                value={formData.adoptedDate}
                onChange={(e) => setFormData({ ...formData, adoptedDate: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: (e.target as HTMLInputElement).checked })}
                />
                Active (currently with you)
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingPet ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="pets-list">
        {pets.map((pet) => (
          <div key={pet.id} className={`pet-item ${!pet.isActive ? "inactive" : ""}`}>
            {pet.imageUrl && (
              <div className="pet-image">
                <img src={pet.imageUrl} alt={pet.name} className="pet-thumbnail" />
              </div>
            )}
            <div className="pet-info">
              <div className="pet-header-info">
                <h4>{pet.name}</h4>
                {pet.nickname && <span className="nickname">({pet.nickname})</span>}
                <span className={`status ${pet.isActive ? "active" : "inactive"}`}>
                  {pet.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="pet-meta">
                {pet.species} • {pet.breed || "Unknown breed"} • 
                {pet.age ? ` ${pet.age} years old` : ""} • 
                {pet.weight ? ` ${pet.weight} lbs` : ""}
              </p>
              {pet.color && <p className="pet-color">Color: {pet.color}</p>}
              {pet.personality && <p className="pet-personality">Personality: {pet.personality}</p>}
            </div>
            <div className="pet-actions">
              <button onClick={() => handleEdit(pet)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(pet.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 