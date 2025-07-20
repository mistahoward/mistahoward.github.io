import { useState, useEffect, useRef } from "preact/hooks";
import { format } from "date-fns";
import { markdownToHtml } from "../../utils/markdown";
import { CommentForm } from "./CommentForm";
import { UserBadge } from "./UserBadge";
import { CommentItemProps } from "../../types/comment-item.types";
import { FaThumbsUp, FaThumbsDown, FaReply, FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa";
import { LuGithub } from "react-icons/lu";

export const CommentItem = ({ comment, onUpdate, onDelete, onVote, onAddComment, currentUserId, depth = 0 }: CommentItemProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const isOwner = currentUserId === comment.userId;

	// Safely access user data with fallbacks
	const user = comment.user || {
		displayName: "Unknown User",
		photoUrl: undefined,
		role: "user",
		githubUsername: undefined,
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		if (showDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showDropdown]);

	const handleUpdate = async (content: string) => {
		try {
			await onUpdate(comment.id, content);
			setIsEditing(false);
		} catch (error) {
			console.error("Error updating comment:", error);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this comment?")) return;

		try {
			setIsDeleting(true);
			await onDelete(comment.id);
		} catch (error) {
			console.error("Error deleting comment:", error);
			setIsDeleting(false);
		}
	};

	const handleVote = async (voteType: number) => {
		try {
			await onVote(comment.id, voteType);
		} catch (error) {
			console.error("Error voting on comment:", error);
		}
	};

	if (isEditing) {
		return (
			<div className="comment-item">
				<CommentForm
					onSubmit={handleUpdate}
					initialContent={comment.content}
					onCancel={() => setIsEditing(false)}
					isEditing={true}
				/>
			</div>
		);
	}

	return (
		<div className="comment-item">
			<div className="comment-header">
				<div className="comment-header-content">
					<div className="user-section">
						{user.photoUrl ? (
							<img src={user.photoUrl} alt={user.displayName} className="user-avatar" />
						) : (
							<div className="user-avatar bg-secondary d-flex align-items-center justify-content-center text-white">
								{user.displayName?.charAt(0) || "U"}
							</div>
						)}
						<div className="user-info">
							<div className="user-name">
								{user.displayName}
								<UserBadge role={user.role} />
								{user.githubUsername && (
									<a
										href={`https://github.com/${user.githubUsername}`}
										target="_blank"
										rel="noopener noreferrer"
										className="github-link"
										title={`View ${user.displayName}'s GitHub profile`}
									>
										<LuGithub />
									</a>
								)}
							</div>
							<div className="comment-date">
								{format(new Date(comment.createdAt + " UTC"), "PPP 'at' h:mm a")}
								{comment.isEdited && " (edited)"}
							</div>
						</div>
					</div>
					<div className="comment-actions">
						<button onClick={() => setIsReplying(!isReplying)} className="action-button" title="Reply">
							<FaReply />
						</button>
						{isOwner && (
							<div className="custom-dropdown" ref={dropdownRef}>
								<button
									className="dropdown-toggle action-button"
									type="button"
									onClick={() => setShowDropdown(!showDropdown)}
									aria-expanded={showDropdown}
								>
									<FaEllipsisH />
								</button>
								{showDropdown && (
									<div
										className="dropdown-menu"
										style={{ display: "block", position: "absolute", top: "100%", right: "0", zIndex: 1000 }}
									>
										<button
											className="dropdown-item"
											onClick={() => {
												setIsEditing(true);
												setShowDropdown(false);
											}}
										>
											<FaEdit />
											<span className="ms-2">Edit</span>
										</button>
										<button
											className="dropdown-item text-danger"
											onClick={() => {
												handleDelete();
												setShowDropdown(false);
											}}
											disabled={isDeleting}
										>
											<FaTrash />
											<span className="ms-2">{isDeleting ? "Deleting..." : "Delete"}</span>
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="comment-content-wrapper">
				<div className="comment-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(comment.content) }} />
				<div className="comment-actions-inline">
					<div className="vote-buttons">
						<button
							onClick={() => handleVote(1)}
							className={`vote-button ${comment.userVote === 1 ? "voted-up" : ""}`}
							title="Upvote"
						>
							<FaThumbsUp />
						</button>
						<span className="vote-count">{comment.voteCount || 0}</span>
						<button
							onClick={() => handleVote(-1)}
							className={`vote-button ${comment.userVote === -1 ? "voted-down" : ""}`}
							title="Downvote"
						>
							<FaThumbsDown />
						</button>
					</div>
				</div>
			</div>

			{isReplying && (
				<div className="reply-form">
					<CommentForm
						onSubmit={async content => {
							try {
								// Call the parent's addComment function with the parentId
								await onAddComment(content, comment.id);
								setIsReplying(false);
							} catch (error) {
								console.error("Error creating reply:", error);
							}
						}}
						parentId={comment.id}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{/* Render nested replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="comment-replies" style={{ marginLeft: `${Math.min(depth + 1, 3) * 1.5}rem` }}>
					{comment.replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onUpdate={onUpdate}
							onDelete={onDelete}
							onVote={onVote}
							onAddComment={onAddComment}
							currentUserId={currentUserId}
							depth={depth + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};
