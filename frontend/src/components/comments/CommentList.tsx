import { CommentItem } from "./CommentItem";
import { CommentListProps } from "../../types/comment-list.types";

export const CommentList = ({ comments, onUpdate, onDelete, onVote, currentUserId }: CommentListProps) => {
	if (comments.length === 0) {
		return (
			<div className="text-center py-4 text-muted">
				<p>No comments yet. Be the first to comment!</p>
			</div>
		);
	}

	return (
		<div className="comment-list">
			{comments.map(comment => (
				<CommentItem
					key={comment.id}
					comment={comment}
					onUpdate={onUpdate}
					onDelete={onDelete}
					onVote={onVote}
					currentUserId={currentUserId}
				/>
			))}
		</div>
	);
};
