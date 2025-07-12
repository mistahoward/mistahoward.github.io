import { useState, useEffect } from "preact/hooks";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

interface BlogEditorProps {
  lastFocusTime?: number;
}

export function BlogEditor({ lastFocusTime = 0 }: BlogEditorProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    published: false,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/blog`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (lastFocusTime > 0) {
      fetchPosts();
    }
  }, [lastFocusTime]); 

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      published: false,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      published: post.published,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      published: false,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingPost 
        ? `${API_URL}/api/admin/blog/${editingPost.id}`
        : `${API_URL}/api/admin/blog`;
      
      const method = editingPost ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPosts();
        handleCancel();
        setError("");
      } else {
        setError("Failed to save post");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        // Remove from local state immediately for responsive UI
        setPosts(prev => prev.filter(post => post.id !== id));
        setError("");
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Blog Posts</h3>
        <button onClick={handleCreate} className="btn btn-success">
          New Post
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {(isCreating || editingPost) && (
        <div className="card mb-3">
          <div className="card-body">
            <h4 className="card-title">{editingPost ? "Edit Post" : "Create New Post"}</h4>
            
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: (e.target as HTMLInputElement).value })}
                placeholder="Post title"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Slug</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: (e.target as HTMLInputElement).value })}
                  placeholder="post-slug"
                />
                <button onClick={generateSlug} className="btn btn-outline-secondary">
                  Generate
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Excerpt</label>
              <textarea
                className="form-control"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: (e.target as HTMLTextAreaElement).value })}
                placeholder="Brief description of the post"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: (e.target as HTMLTextAreaElement).value })}
                placeholder="Post content (markdown supported)"
                rows={15}
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: (e.target as HTMLInputElement).checked })}
                  id="published-check"
                />
                <label className="form-check-label" htmlFor="published-check">
                  Published
                </label>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button onClick={handleSubmit} className="btn btn-primary">
                {editingPost ? "Update" : "Create"}
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow-1 overflow-auto">
        {posts.map((post) => (
          <div key={post.id} className="card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h5 className="card-title mb-1">{post.title}</h5>
                  <p className="text-muted small mb-2">
                    Slug: {post.slug} | 
                    Status: {post.published ? "Published" : "Draft"} |
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  {post.excerpt && <p className="card-text small">{post.excerpt}</p>}
                </div>
                <div className="d-flex gap-2">
                  <button onClick={() => handleEdit(post)} className="btn btn-warning btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="btn btn-danger btn-sm">
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