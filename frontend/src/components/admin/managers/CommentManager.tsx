import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../../../contexts/AuthContext";
import { API_URL } from "../../../utils/api";
import { Comment } from "../../../types/comment-list.types";
import { LoadingSpinner } from "../../../utils/ui";

interface CommentWithBlog extends Comment {
	blogSlug: string;
}

export const CommentManager = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { user: _user } = useAuth();
	const [comments, setComments] = useState<CommentWithBlog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("all"); // all, flagged, deleted
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
	const [blogSlugs, setBlogSlugs] = useState<string[]>([]);

	useEffect(() => {
		fetchComments();
	}, [selectedBlogSlug]);

	useEffect(() => {
		fetchBlogSlugs();
	}, []);

	const fetchBlogSlugs = async () => {
		try {
			const adminToken = localStorage.getItem("adminToken");
			if (!adminToken) throw new Error("Not authenticated");

			const response = await fetch(`${API_URL}/api/admin/comments/blog-slugs`, {
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			});

			if (!response.ok) throw new Error("Failed to fetch blog slugs");

			const data = await response.json();
			setBlogSlugs(data);
		} catch (err) {
			console.error("Error fetching blog slugs:", err);
		}
	};

	const fetchComments = async () => {
		try {
			setLoading(true);
			const adminToken = localStorage.getItem("adminToken");
			if (!adminToken) throw new Error("Not authenticated");

			const url = new URL(`${API_URL}/api/admin/comments`);
			if (selectedBlogSlug) {
				url.searchParams.set("blogSlug", selectedBlogSlug);
			}

			const response = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			});

			if (!response.ok) throw new Error("Failed to fetch comments");

			const data = await response.json();
			setComments(data);
		} catch (err) {
			console.error("Error fetching comments:", err);
			setError("Failed to load comments");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = async (comment: CommentWithBlog) => {
		const confirmMessage = `Are you sure you want to delete this comment?\n\nComment by: ${comment.user.displayName}\nBlog Post: ${comment.blogSlug}\nContent: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? "..." : ""}\n\nThis action cannot be undone.`;

		if (confirm(confirmMessage)) {
			try {
				const adminToken = localStorage.getItem("adminToken");
				if (!adminToken) throw new Error("Not authenticated");

				const response = await fetch(`${API_URL}/api/admin/comments/${comment.id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${adminToken}`,
					},
				});

				if (!response.ok) throw new Error("Failed to delete comment");

				setComments(prev => prev.filter(c => c.id !== comment.id));
			} catch (err) {
				console.error("Error deleting comment:", err);
				setError("Failed to delete comment");
			}
		}
	};

	const filteredComments = comments.filter(comment => {
		const matchesFilter =
			filter === "all" || (filter === "flagged" && comment.isDeleted) || (filter === "deleted" && comment.isDeleted);

		const matchesSearch =
			searchTerm === "" ||
			comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
			comment.user.displayName.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	if (loading) {
		return (
			<div className="text-center py-4">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="comment-manager">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>Comment Management</h4>
				<div className="d-flex gap-2">
					<input
						type="text"
						className="form-control form-control-sm"
						placeholder="Search comments..."
						value={searchTerm}
						onChange={e => setSearchTerm((e.target as HTMLInputElement).value)}
					/>
					<select
						className="form-select form-select-sm"
						value={selectedBlogSlug}
						onChange={e => setSelectedBlogSlug((e.target as HTMLSelectElement).value)}
					>
						<option value="">All Blog Posts</option>
						{blogSlugs.map(slug => (
							<option key={slug} value={slug}>
								{slug}
							</option>
						))}
					</select>
					<select
						className="form-select form-select-sm"
						value={filter}
						onChange={e => setFilter((e.target as HTMLSelectElement).value)}
					>
						<option value="all">All Comments</option>
						<option value="flagged">Flagged</option>
						<option value="deleted">Deleted</option>
					</select>
				</div>
			</div>

			{error && <div className="alert alert-danger">{error}</div>}

			<div className="table-responsive">
				<table className="table table-sm">
					<thead>
						<tr>
							<th>User</th>
							<th>Comment</th>
							<th>Blog Post</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredComments.map(comment => (
							<tr key={comment.id}>
								<td>
									<div className="d-flex align-items-center gap-2">
										{comment.user.photoUrl ? (
											<img
												src={comment.user.photoUrl}
												alt={comment.user.displayName}
												className="rounded-circle"
												width="24"
												height="24"
											/>
										) : (
											<div
												className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
												style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}
											>
												{comment.user.displayName?.charAt(0) || "U"}
											</div>
										)}
										<span className="small">{comment.user.displayName}</span>
									</div>
								</td>
								<td>
									<div className="text-truncate" style={{ maxWidth: "200px" }} title={comment.content}>
										{comment.content}
									</div>
								</td>
								<td>
									<span className="badge bg-secondary">{comment.blogSlug}</span>
								</td>
								<td>
									<small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
								</td>
								<td>
									<button
										className="btn btn-sm btn-outline-danger"
										onClick={() => handleDeleteClick(comment)}
										title="Delete Comment"
									>
										🗑️
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredComments.length === 0 && (
				<div className="text-center py-4 text-muted">
					<p>No comments found</p>
				</div>
			)}
		</div>
	);
};
