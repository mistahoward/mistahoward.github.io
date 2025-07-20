import { useState, useCallback } from "preact/hooks";
import { useAuth } from "../../contexts/AuthContext";
import { CommentFormProps } from "../../types/comment-form.types";

export const CommentForm = ({ onSubmit, parentId, initialContent = "", onCancel, isEditing = false }: CommentFormProps) => {
	const { user } = useAuth();
	const [content, setContent] = useState(initialContent);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [honeypot, setHoneypot] = useState("");

	const handleContentChange = useCallback((e: Event) => {
		const target = e.target as HTMLTextAreaElement;
		setContent(target.value);
	}, []);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		// Honeypot check - if this field is filled, it's likely a bot
		if (honeypot.trim()) {
			console.log("Honeypot field filled - potential spam detected");
			return; // Silently reject without showing an error
		}

		if (!content.trim()) {
			setError("Comment cannot be empty");
			return;
		}

		try {
			setIsSubmitting(true);
			setError("");
			await onSubmit(content.trim(), parentId);
			setContent("");
			setHoneypot("");
		} catch (err) {
			console.error("Error submitting comment:", err);
			setError("Failed to submit comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setContent(initialContent);
		setError("");
		onCancel?.();
	};

	return (
		<div className="comment-form">
			<div className="comment-form-container">
				<form onSubmit={handleSubmit}>
					{/* Honeypot field - hidden from users but visible to bots */}
					<div className="honeypot-field" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
						<input
							type="text"
							name="website"
							value={honeypot}
							onChange={e => setHoneypot(e.currentTarget.value)}
							tabIndex={-1}
							aria-hidden="true"
						/>
					</div>
					<div className="d-flex align-items-start gap-3">
						{user?.photoURL ? (
							<img src={user.photoURL} alt={user.displayName || "User"} className="user-avatar" />
						) : (
							<div className="user-avatar bg-secondary d-flex align-items-center justify-content-center text-white">
								{user?.displayName?.charAt(0) || "U"}
							</div>
						)}
						<div className="flex-grow-1 d-flex flex-column">
							<textarea
								value={content}
								onChange={handleContentChange}
								className="comment-textarea"
								rows={3}
								placeholder={isEditing ? "Edit your comment..." : "Write a comment..."}
								disabled={isSubmitting}
							/>
							{error && <div className="error-message">{error}</div>}
						</div>
					</div>
					<div className="form-bottom">
						<div className="markdown-info">
							Supports
							<br />
							<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">
								Markdown
							</a>
						</div>
						<div className="action-buttons">
							{onCancel && (
								<button type="button" onClick={handleCancel} className="btn btn-outline-secondary" disabled={isSubmitting}>
									Cancel
								</button>
							)}
							<button
								type="submit"
								className={`btn ${isSubmitting || !content.trim() ? "btn-secondary" : "btn-primary"}`}
								disabled={isSubmitting || !content.trim()}
							>
								{isSubmitting ? "Submitting..." : isEditing ? "Update" : "Post Comment"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};
