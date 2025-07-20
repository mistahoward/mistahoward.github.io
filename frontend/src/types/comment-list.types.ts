export interface Comment {
	id: string;
	blogSlug: string;
	userId: string;
	parentId?: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	isEdited: boolean;
	isDeleted: boolean;
	voteCount?: number;
	userVote?: number; // 0 = no vote, 1 = upvote, -1 = downvote
	user: {
		id: string;
		displayName: string;
		photoUrl?: string;
		githubUsername?: string;
		role?: string;
	};
}

export interface CommentListProps {
	comments: Comment[];
	onUpdate: (commentId: string, content: string) => Promise<void>;
	onDelete: (commentId: string) => Promise<void>;
	onVote: (commentId: string, voteType: number) => Promise<void>;
	currentUserId?: string;
} 