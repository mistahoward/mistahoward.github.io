import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../../contexts/AuthContext";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { LoginButton } from "./LoginButton";
import { LoadingSpinner } from "../../utils/ui";
import { API_URL } from "../../utils/api";
import { getIdToken } from "../../utils/firebase";
import { getGitHubUsername } from "../../utils/firebase";
import { Comment } from "../../types/comment-list.types";
import { CommentsSectionProps } from "../../types/comments-section.types";

export const CommentsSection = ({ blogSlug }: CommentsSectionProps) => {
	const { user, loading } = useAuth();
	const [comments, setComments] = useState<Comment[]>([]);
	const [loadingComments, setLoadingComments] = useState(true);
	const [error, setError] = useState("");
	const [showCommentForm, setShowCommentForm] = useState(false);

	useEffect(() => {
		fetchComments();
	}, [blogSlug, user]);

	const fetchComments = async () => {
		try {
			setLoadingComments(true);
			const url = new URL(`${API_URL}/api/comments/${encodeURIComponent(blogSlug)}`);
			console.log("Fetching comments - user:", user, "user?.uid:", user?.uid);
			if (user?.uid) {
				url.searchParams.set("userId", user.uid);
				console.log("Added userId to URL:", user.uid);
			} else {
				console.log("No user.uid available, not adding userId parameter");
			}

			const response = await fetch(url.toString());
			if (!response.ok) throw new Error("Failed to fetch comments");

			const data = await response.json();
			setComments(data);
		} catch (err) {
			console.error("Error fetching comments:", err);
			setError("Failed to load comments");
		} finally {
			setLoadingComments(false);
		}
	};

	const addComment = async (content: string, parentId?: string) => {
		try {
			const token = await getIdToken();
			if (!token) throw new Error("Not authenticated");

			// Extract GitHub username from current user with API fallback
			const githubUsername = user ? await getGitHubUsername(user) : "";
			console.log("User data for GitHub extraction:", {
				displayName: user?.displayName,
				email: user?.email,
				photoURL: user?.photoURL,
				providerData: user?.providerData,
			});
			console.log("Extracted GitHub username:", githubUsername);

			const response = await fetch(`${API_URL}/api/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					blogSlug,
					content,
					parentId,
					githubUsername,
				}),
			});

			if (!response.ok) throw new Error("Failed to create comment");

			await response.json(); // Response is not used since we refresh comments

			// Refresh comments to get the complete data with user info
			await fetchComments();
		} catch (err) {
			console.error("Error creating comment:", err);
			throw err;
		}
	};

	const updateComment = async (commentId: string, content: string) => {
		try {
			const token = await getIdToken();
			if (!token) throw new Error("Not authenticated");

			const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) throw new Error("Failed to update comment");

			const updatedComment = await response.json();
			setComments(prev => prev.map(comment => (comment.id === commentId ? updatedComment : comment)));
		} catch (err) {
			console.error("Error updating comment:", err);
			throw err;
		}
	};

	const deleteComment = async (commentId: string) => {
		try {
			const token = await getIdToken();
			if (!token) throw new Error("Not authenticated");

			const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error("Failed to delete comment");

			setComments(prev => prev.filter(comment => comment.id !== commentId));
		} catch (err) {
			console.error("Error deleting comment:", err);
			throw err;
		}
	};

	const voteComment = async (commentId: string, voteType: number) => {
		try {
			const token = await getIdToken();
			if (!token) throw new Error("Not authenticated");

			// Optimistically update the vote count and user vote state
			setComments(prev =>
				prev.map(comment => {
					if (comment.id === commentId) {
						// Ensure voteCount is a number
						const currentVoteCount = Number(comment.voteCount) || 0;
						const currentUserVote = Number(comment.userVote) || 0;

						console.log("Vote calculation:", {
							commentId,
							voteType,
							currentVoteCount,
							currentUserVote,
							action: currentUserVote === 0 ? "add" : currentUserVote === voteType ? "remove" : "change",
						});

						// Calculate new vote count based on previous vote
						let newVoteCount = currentVoteCount;
						if (currentUserVote === 0) {
							// No previous vote, add the new vote
							newVoteCount = voteType === 1 ? currentVoteCount + 1 : currentVoteCount - 1;
						} else if (currentUserVote === voteType) {
							// Same vote type, remove the vote
							newVoteCount = voteType === 1 ? currentVoteCount - 1 : currentVoteCount + 1;
						} else {
							// Different vote type, change the vote (add 2 to the difference)
							newVoteCount = voteType === 1 ? currentVoteCount + 2 : currentVoteCount - 2;
						}

						// Update user vote state
						const newUserVote = currentUserVote === voteType ? 0 : voteType;

						console.log("Vote result:", {
							newVoteCount,
							newUserVote,
						});

						return {
							...comment,
							voteCount: newVoteCount,
							userVote: newUserVote,
						};
					}
					return comment;
				})
			);

			const response = await fetch(`${API_URL}/api/comments/${commentId}/vote`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ voteType }),
			});

			if (!response.ok) throw new Error("Failed to vote on comment");

			// Don't refetch on success - optimistic update is sufficient
			// Only refetch on error to revert optimistic update
		} catch (err) {
			console.error("Error voting on comment:", err);
			// Revert optimistic update on error
			await fetchComments();
			throw err;
		}
	};

	if (loading)
		return (
			<div className="text-center py-4">
				<LoadingSpinner />
			</div>
		);

	return (
		<div className="comments-section">
			<div className="comments-header">
				<h3 className="comments-title">Comments</h3>
			</div>

			{!user ? (
				<div className="login-prompt">
					<p className="text-muted mb-3">Please log in to leave a comment</p>
					<LoginButton />
				</div>
			) : (
				<div className="comment-form-wrapper">
					{!showCommentForm ? (
						<div className="post-comment-prompt">
							<button className="btn btn-primary" onClick={() => setShowCommentForm(true)}>
								Post Comment
							</button>
						</div>
					) : (
						<CommentForm onSubmit={addComment} onCancel={() => setShowCommentForm(false)} />
					)}
				</div>
			)}

			<div className="comments-list-wrapper">
				{loadingComments ? (
					<div className="loading-comments">
						<LoadingSpinner />
						<p className="text-muted mt-2">Loading comments...</p>
					</div>
				) : error ? (
					<div className="comments-error text-danger">{error}</div>
				) : (
					<CommentList
						comments={comments}
						onUpdate={updateComment}
						onDelete={deleteComment}
						onVote={voteComment}
						currentUserId={user?.uid}
					/>
				)}
			</div>
		</div>
	);
};
