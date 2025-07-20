import { useEffect, useRef, useState } from "preact/hooks";
import { CommentItem } from "./CommentItem";
import { CommentListProps } from "../../types/comment-list.types";
import { YakShaverSpinner } from "../shared/YakShaverSpinner";

export const CommentList = ({
	comments,
	onUpdate,
	onDelete,
	onVote,
	onAddComment,
	currentUserId,
	hasMore = false,
	onLoadMore,
	loading = false,
}: CommentListProps) => {
	const [visibleComments, setVisibleComments] = useState(comments.slice(0, 10));
	const [page, setPage] = useState(1);
	const loadingRef = useRef<HTMLDivElement>(null);

	// Update visible comments when comments array changes
	useEffect(() => {
		const itemsPerPage = 10;
		const endIndex = page * itemsPerPage;
		setVisibleComments(comments.slice(0, endIndex));
	}, [comments, page]);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				const target = entries[0];
				if (target.isIntersecting && hasMore && !loading) {
					setPage(prev => prev + 1);
					if (onLoadMore) {
						onLoadMore(page + 1);
					}
				}
			},
			{
				threshold: 0.1,
				root: document.querySelector(".comment-list-container"), // Use the scroll container as root
			}
		);

		if (loadingRef.current) {
			observer.observe(loadingRef.current);
		}

		return () => {
			if (loadingRef.current) {
				observer.unobserve(loadingRef.current);
			}
		};
	}, [hasMore, loading, onLoadMore, page]);

	if (comments.length === 0) {
		return (
			<div className="text-center py-4 text-muted">
				<p>No comments yet. Be the first to comment!</p>
			</div>
		);
	}

	return (
		<div className="comment-list-container">
			<div className="comment-list">
				{visibleComments.map(comment => (
					<CommentItem
						key={comment.id}
						comment={comment}
						onUpdate={onUpdate}
						onDelete={onDelete}
						onVote={onVote}
						onAddComment={onAddComment}
						currentUserId={currentUserId}
						depth={0}
					/>
				))}

				{/* Loading indicator for infinite scroll */}
				{hasMore && (
					<div ref={loadingRef} className="text-center py-4">
						{loading ? (
							<div className="d-flex justify-content-center align-items-center">
								<YakShaverSpinner />
								<span className="ms-2">Loading more comments...</span>
							</div>
						) : (
							<div className="text-muted">
								<span>Scroll to load more</span>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
