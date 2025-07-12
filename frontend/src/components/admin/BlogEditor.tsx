import { useState, useEffect } from "preact/hooks";
import "./BlogEditor.scss";

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="blog-editor">
      <div className="blog-header">
        <h3>Blog Posts</h3>
        <button onClick={handleCreate} className="create-btn">
          New Post
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {(isCreating || editingPost) && (
        <div className="blog-form">
          <h4>{editingPost ? "Edit Post" : "Create New Post"}</h4>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: (e.target as HTMLInputElement).value })}
              placeholder="Post title"
            />
          </div>

          <div className="form-group">
            <label>Slug</label>
            <div className="slug-input">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: (e.target as HTMLInputElement).value })}
                placeholder="post-slug"
              />
              <button onClick={generateSlug} className="generate-slug-btn">
                Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: (e.target as HTMLTextAreaElement).value })}
              placeholder="Brief description of the post"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: (e.target as HTMLTextAreaElement).value })}
              placeholder="Post content (markdown supported)"
              rows={15}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: (e.target as HTMLInputElement).checked })}
              />
              Published
            </label>
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} className="save-btn">
              {editingPost ? "Update" : "Create"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <div className="post-info">
              <h4>{post.title}</h4>
              <p className="post-meta">
                Slug: {post.slug} | 
                Status: {post.published ? "Published" : "Draft"} |
                Created: {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            </div>
            <div className="post-actions">
              <button onClick={() => handleEdit(post)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(post.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 