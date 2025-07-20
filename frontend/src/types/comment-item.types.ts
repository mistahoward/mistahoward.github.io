import { Comment } from "./comment-list.types";

export interface CommentItemProps {
	comment: Comment;
	onUpdate: (commentId: string, content: string) => Promise<void>;
	onDelete: (commentId: string) => Promise<void>;
	onVote: (commentId: string, voteType: number) => Promise<void>;
	currentUserId?: string;
} 