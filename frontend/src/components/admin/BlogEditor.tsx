import { useState, useEffect } from "preact/hooks";
import { BlogPost, BlogEditorProps } from "../../types/blog-editor.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../utils/crud";
import { generateSlug, handleTextInputChange, handleTextAreaChange, handleCheckboxChange } from "../../utils/form";
import { LoadingSpinner, ErrorAlert, formatDate } from "../../utils/ui";
import { API_URL } from "../../utils/api";

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

  const fetchPosts = async () => {
    await fetchItems({
      endpoint: "/api/admin/blog",
      onSuccess: setPosts,
      setError,
      setLoading,
    });
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
    if (editingPost) {
      await updateItem(
        "/api/admin/blog",
        editingPost.id,
        formData,
        () => {
          fetchPosts();
          handleCancel();
        },
        undefined,
        setError
      );
    } else {
      await createItem(
        "/api/admin/blog",
        formData,
        () => {
          fetchPosts();
          handleCancel();
        },
        undefined,
        setError
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirmDelete("this post")) return;

    const success = await deleteItem(
      "/api/admin/blog",
      id,
      () => {
        // Remove from local state immediately for responsive UI
        setPosts(prev => prev.filter(post => post.id !== id));
      },
      undefined,
      setError
    );
  };

  const handleGenerateSlug = () => {
    const slug = generateSlug(formData.title);
    setFormData({ ...formData, slug });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Blog Posts</h3>
        <button onClick={handleCreate} className="btn btn-success">
          New Post
        </button>
      </div>

      {error && <ErrorAlert error={error} />}

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
                onChange={handleTextInputChange(formData, setFormData, "title")}
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
                  onChange={handleTextInputChange(formData, setFormData, "slug")}
                  placeholder="post-slug"
                />
                <button onClick={handleGenerateSlug} className="btn btn-outline-secondary">
                  Generate
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Excerpt</label>
              <textarea
                className="form-control"
                value={formData.excerpt}
                onChange={handleTextAreaChange(formData, setFormData, "excerpt")}
                placeholder="Brief description of the post"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                value={formData.content}
                onChange={handleTextAreaChange(formData, setFormData, "content")}
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
                  onChange={handleCheckboxChange(formData, setFormData, "published")}
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
                    Created: {formatDate(post.createdAt)}
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