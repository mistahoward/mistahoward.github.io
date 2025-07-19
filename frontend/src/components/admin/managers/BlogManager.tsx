import { useState, useEffect } from "preact/hooks";
import { BlogPost, BlogFormState } from "../../../types/blog-editor.types";
import { fetchItems, createItem, updateItem, deleteItem, confirmDelete } from "../../../utils/crud";
import { formatDate } from "../../../utils/ui";
import { ManagerLayout } from "../shared/ManagerLayout";
import { BlogForm } from "../forms/BlogForm";

console.log("BlogManager rendered");

export const BlogManager = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState<BlogFormState>({
		title: "",
		slug: "",
		content: "",
		excerpt: "",
		published: false,
		tags: [],
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

	// Removed the lastFocusTime effect to prevent infinite loop

	const handleCreate = () => {
		setIsCreating(true);
		setEditingPost(null);
		setFormData({
			title: "",
			slug: "",
			content: "",
			excerpt: "",
			published: false,
			tags: [],
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
			tags: post.tags || [],
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
			tags: [],
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

		await deleteItem(
			"/api/admin/blog",
			id,
			() => {
				setPosts(prev => prev.filter(post => post.id !== id));
			},
			undefined,
			setError
		);
	};

	return (
		<ManagerLayout title="Blog Posts" loading={loading} error={error} onCreate={handleCreate} createButtonText="New Post">
			{(isCreating || editingPost) && (
				<BlogForm
					formData={formData}
					setFormData={setFormData}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					editingItem={editingPost}
				/>
			)}

			<div className="flex-grow-1 overflow-auto">
				{posts.map(post => (
					<div key={post.id} className="card mb-2">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-start">
								<div className="flex-grow-1">
									<h5 className="card-title mb-1">{post.title}</h5>
									<p className="text-muted small mb-2">
										Slug: {post.slug} | Status: {post.published ? "Published" : "Draft"} | Created:{" "}
										{formatDate(post.createdAt)}
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
		</ManagerLayout>
	);
};
