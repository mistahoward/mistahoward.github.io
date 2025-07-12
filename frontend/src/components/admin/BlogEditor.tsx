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

      <style>{`
        .blog-editor {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .blog-header h3 {
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

        .blog-form {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .blog-form h4 {
          margin-top: 0;
          margin-bottom: 20px;
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
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .slug-input {
          display: flex;
          gap: 10px;
        }

        .slug-input input {
          flex: 1;
        }

        .generate-slug-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
        }

        .generate-slug-btn:hover {
          background: #5a6268;
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

        .posts-list {
          flex: 1;
          overflow-y: auto;
        }

        .post-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 10px;
          background: white;
        }

        .post-info {
          flex: 1;
        }

        .post-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .post-meta {
          margin: 0 0 5px 0;
          font-size: 12px;
          color: #666;
        }

        .post-excerpt {
          margin: 0;
          font-size: 14px;
          color: #555;
        }

        .post-actions {
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