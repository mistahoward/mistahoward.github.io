import { useState, useEffect } from "preact/hooks";

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id: number;
  name: string;
  description?: string;
  projectType: string;
  technologies?: string;
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  technologies?: string;
  createdAt: string;
  updatedAt: string;
}

interface Testimonial {
  id: number;
  clientName: string;
  clientTitle?: string;
  clientCompany?: string;
  content: string;
  rating?: number;
  projectId?: number;
  approved: boolean;
  createdAt: string;
}

interface DataManagerProps {
  lastFocusTime?: number;
}

export function DataManager({ lastFocusTime = 0 }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "skills" | "experience" | "testimonials">("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Project form
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    projectType: "personal",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
  });

  // Skill form
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    proficiency: 3,
    icon: "",
  });

  // Experience form
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    current: false,
    technologies: "",
  });

  // Testimonial form
  const [testimonialForm, setTestimonialForm] = useState({
    clientName: "",
    clientTitle: "",
    clientCompany: "",
    content: "",
    rating: 5,
    projectId: "",
    approved: false,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    try {
      const [projectsRes, skillsRes, experienceRes, testimonialsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/projects`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/skills`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/experience`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/testimonials`, { headers: getAuthHeaders() }),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (skillsRes.ok) setSkills(await skillsRes.json());
      if (experienceRes.ok) setExperience(await experienceRes.json());
      if (testimonialsRes.ok) setTestimonials(await testimonialsRes.json());
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (lastFocusTime > 0) {
      fetchData();
    }
  }, [lastFocusTime]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    resetForms();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsCreating(false);
    
    if (activeTab === "projects") {
      setProjectForm({
        name: item.name,
        description: item.description || "",
        projectType: item.projectType,
        technologies: item.technologies || "",
        githubUrl: item.githubUrl,
        liveUrl: item.liveUrl || "",
        imageUrl: item.imageUrl || "",
      });
    } else if (activeTab === "skills") {
      setSkillForm({
        name: item.name,
        category: item.category,
        proficiency: item.proficiency,
        icon: item.icon || "",
      });
    } else if (activeTab === "experience") {
      setExperienceForm({
        company: item.company,
        position: item.position,
        description: item.description || "",
        startDate: item.startDate,
        endDate: item.endDate || "",
        current: item.current,
        technologies: item.technologies || "",
      });
    } else if (activeTab === "testimonials") {
      setTestimonialForm({
        clientName: item.clientName,
        clientTitle: item.clientTitle || "",
        clientCompany: item.clientCompany || "",
        content: item.content,
        rating: item.rating || 5,
        projectId: item.projectId?.toString() || "",
        approved: item.approved,
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    resetForms();
  };

  const resetForms = () => {
    setProjectForm({
      name: "",
      description: "",
      projectType: "personal",
      technologies: "",
      githubUrl: "",
      liveUrl: "",
      imageUrl: "",
    });
    setSkillForm({
      name: "",
      category: "",
      proficiency: 3,
      icon: "",
    });
    setExperienceForm({
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: "",
      current: false,
      technologies: "",
    });
    setTestimonialForm({
      clientName: "",
      clientTitle: "",
      clientCompany: "",
      content: "",
      rating: 5,
      projectId: "",
      approved: false,
    });
  };

  const handleSubmit = async () => {
    try {
      let url = "";
      let method = "POST";
      let data: any = {};

      if (activeTab === "projects") {
        url = editingItem 
          ? `${API_URL}/api/admin/projects/${editingItem.id}`
          : `${API_URL}/api/admin/projects`;
        method = editingItem ? "PUT" : "POST";
        data = projectForm;
      } else if (activeTab === "skills") {
        url = editingItem 
          ? `${API_URL}/api/admin/skills/${editingItem.id}`
          : `${API_URL}/api/admin/skills`;
        method = editingItem ? "PUT" : "POST";
        data = skillForm;
      } else if (activeTab === "experience") {
        url = editingItem 
          ? `${API_URL}/api/admin/experience/${editingItem.id}`
          : `${API_URL}/api/admin/experience`;
        method = editingItem ? "PUT" : "POST";
        data = experienceForm;
      } else if (activeTab === "testimonials") {
        url = editingItem 
          ? `${API_URL}/api/admin/testimonials/${editingItem.id}`
          : `${API_URL}/api/admin/testimonials`;
        method = editingItem ? "PUT" : "POST";
        data = {
          ...testimonialForm,
          projectId: testimonialForm.projectId ? parseInt(testimonialForm.projectId) : undefined,
        };
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        handleCancel();
        setError("");
      } else {
        setError(`Failed to save ${activeTab.slice(0, -1)}`);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/${activeTab}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        // Remove from local state immediately for responsive UI
        if (activeTab === "projects") {
          setProjects(prev => prev.filter(item => item.id !== id));
        } else if (activeTab === "skills") {
          setSkills(prev => prev.filter(item => item.id !== id));
        } else if (activeTab === "experience") {
          setExperience(prev => prev.filter(item => item.id !== id));
        } else if (activeTab === "testimonials") {
          setTestimonials(prev => prev.filter(item => item.id !== id));
        }
        setError("");
      } else {
        setError(`Failed to delete ${activeTab.slice(0, -1)}`);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleToggleApproval = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...testimonial,
          approved: !testimonial.approved,
        }),
      });

      if (response.ok) {
        setTestimonials(prev => prev.map(item => 
          item.id === testimonial.id 
            ? { ...item, approved: !item.approved }
            : item
        ));
        setError("");
      } else {
        setError("Failed to update testimonial");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="data-manager">
      <div className="data-header">
        <h3>Data Management</h3>
        <button onClick={handleCreate} className="create-btn">
          Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="data-tabs">
        <button
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          Projects ({projects.length})
        </button>
        <button
          className={activeTab === "skills" ? "active" : ""}
          onClick={() => setActiveTab("skills")}
        >
          Skills ({skills.length})
        </button>
        <button
          className={activeTab === "experience" ? "active" : ""}
          onClick={() => setActiveTab("experience")}
        >
          Experience ({experience.length})
        </button>
        <button
          className={activeTab === "testimonials" ? "active" : ""}
          onClick={() => setActiveTab("testimonials")}
        >
          Testimonials ({testimonials.length})
        </button>
      </div>

      {/* Project Form */}
      {activeTab === "projects" && (isCreating || editingItem) && (
        <div className="data-form">
          <h4>{editingItem ? "Edit Project" : "Add New Project"}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: (e.target as HTMLInputElement).value })}
                placeholder="Project name"
              />
            </div>
            <div className="form-group">
              <label>Project Type *</label>
              <select
                value={projectForm.projectType}
                onChange={(e) => setProjectForm({ ...projectForm, projectType: (e.target as HTMLSelectElement).value })}
              >
                <option value="personal">Personal</option>
                <option value="professional">Professional</option>
                <option value="academic">Academic</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: (e.target as HTMLTextAreaElement).value })}
              placeholder="Project description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GitHub URL *</label>
              <input
                type="url"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: (e.target as HTMLInputElement).value })}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="form-group">
              <label>Live URL</label>
              <input
                type="url"
                value={projectForm.liveUrl}
                onChange={(e) => setProjectForm({ ...projectForm, liveUrl: (e.target as HTMLInputElement).value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Technologies</label>
              <input
                type="text"
                value={projectForm.technologies}
                onChange={(e) => setProjectForm({ ...projectForm, technologies: (e.target as HTMLInputElement).value })}
                placeholder="React, Node.js, TypeScript (comma separated)"
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={projectForm.imageUrl}
                onChange={(e) => setProjectForm({ ...projectForm, imageUrl: (e.target as HTMLInputElement).value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingItem ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skill Form */}
      {activeTab === "skills" && (isCreating || editingItem) && (
        <div className="data-form">
          <h4>{editingItem ? "Edit Skill" : "Add New Skill"}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: (e.target as HTMLInputElement).value })}
                placeholder="Skill name"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: (e.target as HTMLSelectElement).value })}
              >
                <option value="">Select category</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="devops">DevOps</option>
                <option value="database">Database</option>
                <option value="mobile">Mobile</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Proficiency (1-5) *</label>
              <input
                type="number"
                value={skillForm.proficiency}
                onChange={(e) => setSkillForm({ ...skillForm, proficiency: parseInt((e.target as HTMLInputElement).value) })}
                min="1"
                max="5"
              />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <input
                type="text"
                value={skillForm.icon}
                onChange={(e) => setSkillForm({ ...skillForm, icon: (e.target as HTMLInputElement).value })}
                placeholder="Icon class or URL"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingItem ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Experience Form */}
      {activeTab === "experience" && (isCreating || editingItem) && (
        <div className="data-form">
          <h4>{editingItem ? "Edit Experience" : "Add New Experience"}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                value={experienceForm.company}
                onChange={(e) => setExperienceForm({ ...experienceForm, company: (e.target as HTMLInputElement).value })}
                placeholder="Company name"
              />
            </div>
            <div className="form-group">
              <label>Position *</label>
              <input
                type="text"
                value={experienceForm.position}
                onChange={(e) => setExperienceForm({ ...experienceForm, position: (e.target as HTMLInputElement).value })}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={experienceForm.description}
              onChange={(e) => setExperienceForm({ ...experienceForm, description: (e.target as HTMLTextAreaElement).value })}
              placeholder="Job description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={experienceForm.startDate}
                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={experienceForm.endDate}
                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: (e.target as HTMLInputElement).value })}
                disabled={experienceForm.current}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Technologies</label>
              <input
                type="text"
                value={experienceForm.technologies}
                onChange={(e) => setExperienceForm({ ...experienceForm, technologies: (e.target as HTMLInputElement).value })}
                placeholder="React, Node.js, TypeScript (comma separated)"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={experienceForm.current}
                  onChange={(e) => setExperienceForm({ ...experienceForm, current: (e.target as HTMLInputElement).checked })}
                />
                Current Position
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingItem ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Testimonial Form */}
      {activeTab === "testimonials" && (isCreating || editingItem) && (
        <div className="data-form">
          <h4>{editingItem ? "Edit Testimonial" : "Add New Testimonial"}</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Client Name *</label>
              <input
                type="text"
                value={testimonialForm.clientName}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, clientName: (e.target as HTMLInputElement).value })}
                placeholder="Client name"
              />
            </div>
            <div className="form-group">
              <label>Client Title</label>
              <input
                type="text"
                value={testimonialForm.clientTitle}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, clientTitle: (e.target as HTMLInputElement).value })}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Client Company</label>
            <input
              type="text"
              value={testimonialForm.clientCompany}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, clientCompany: (e.target as HTMLInputElement).value })}
              placeholder="Company name"
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={testimonialForm.content}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, content: (e.target as HTMLTextAreaElement).value })}
              placeholder="Testimonial content"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating (1-5)</label>
              <input
                type="number"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt((e.target as HTMLInputElement).value) })}
                min="1"
                max="5"
              />
            </div>
            <div className="form-group">
              <label>Project ID</label>
              <input
                type="number"
                value={testimonialForm.projectId}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, projectId: (e.target as HTMLInputElement).value })}
                placeholder="Related project ID"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={testimonialForm.approved}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, approved: (e.target as HTMLInputElement).checked })}
              />
              Approved
            </label>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingItem ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="data-content">
        {activeTab === "projects" && (
          <div className="projects-section">
            <h4>Projects</h4>
            <div className="data-list">
              {projects.map((project) => (
                <div key={project.id} className="data-item">
                  <div className="item-info">
                    <h5>{project.name}</h5>
                    <p className="item-meta">
                      Type: {project.projectType} | 
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    {project.description && <p className="item-description">{project.description}</p>}
                    <p className="item-links">
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>
                      )}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(project)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="skills-section">
            <h4>Skills</h4>
            <div className="data-list">
              {skills.map((skill) => (
                <div key={skill.id} className="data-item">
                  <div className="item-info">
                    <h5>{skill.name}</h5>
                    <p className="item-meta">
                      Category: {skill.category} | 
                      Proficiency: {skill.proficiency}/5 | 
                      Created: {new Date(skill.createdAt).toLocaleDateString()}
                    </p>
                    {skill.icon && <p className="item-icon">Icon: {skill.icon}</p>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(skill)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(skill.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="experience-section">
            <h4>Work Experience</h4>
            <div className="data-list">
              {experience.map((exp) => (
                <div key={exp.id} className="data-item">
                  <div className="item-info">
                    <h5>{exp.position} at {exp.company}</h5>
                    <p className="item-meta">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Unknown"}
                    </p>
                    {exp.description && <p className="item-description">{exp.description}</p>}
                    {exp.technologies && <p className="item-tech">Technologies: {exp.technologies}</p>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(exp)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(exp.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "testimonials" && (
          <div className="testimonials-section">
            <h4>Testimonials</h4>
            <div className="data-list">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={`data-item ${!testimonial.approved ? "pending" : ""}`}>
                  <div className="item-info">
                    <h5>{testimonial.clientName}</h5>
                    <p className="item-meta">
                      {testimonial.clientTitle && `${testimonial.clientTitle}`}
                      {testimonial.clientCompany && ` at ${testimonial.clientCompany}`} | 
                      Rating: {testimonial.rating || "N/A"} | 
                      Status: {testimonial.approved ? "Approved" : "Pending"} |
                      Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>
                    <p className="item-content">{testimonial.content}</p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(testimonial)} className="edit-btn">Edit</button>
                    <button 
                      onClick={() => handleToggleApproval(testimonial)} 
                      className="approve-btn"
                    >
                      {testimonial.approved ? "Unapprove" : "Approve"}
                    </button>
                    <button onClick={() => handleDelete(testimonial.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .data-manager {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .data-header h3 {
          margin: 0;
        }

        .create-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .create-btn:hover {
          background: #218838;
        }

        .error {
          color: #dc3545;
          margin-bottom: 15px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
        }

        .data-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .data-form h4 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: 25px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          margin: 0;
          cursor: pointer;
        }

        .checkbox-group input {
          width: auto;
          margin-right: 8px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .save-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #0056b3;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .data-tabs {
          display: flex;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }

        .data-tabs button {
          background: none;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .data-tabs button:hover {
          color: #333;
        }

        .data-tabs button.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .data-content {
          flex: 1;
          overflow-y: auto;
        }

        .data-content h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
          background: white;
        }

        .data-item.pending {
          border-left: 4px solid #ffc107;
          background: #fffbf0;
        }

        .item-info {
          flex: 1;
        }

        .item-info h5 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .item-meta {
          margin: 0 0 5px 0;
          font-size: 12px;
          color: #666;
        }

        .item-description,
        .item-content {
          margin: 5px 0;
          font-size: 14px;
          color: #555;
          line-height: 1.4;
        }

        .item-links {
          margin: 5px 0 0 0;
        }

        .item-links a {
          color: #007bff;
          text-decoration: none;
          margin-right: 15px;
          font-size: 13px;
        }

        .item-links a:hover {
          text-decoration: underline;
        }

        .item-tech,
        .item-icon {
          margin: 5px 0;
          font-size: 13px;
          color: #666;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn {
          background: #ffc107;
          color: #212529;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-btn:hover {
          background: #e0a800;
        }

        .approve-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .approve-btn:hover {
          background: #218838;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .delete-btn:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
} 