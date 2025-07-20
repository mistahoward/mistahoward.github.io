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
	replies?: Comment[]; // Nested replies
	user: {
		id: string;
		displayName: string;
		photoUrl?: string;
		githubUsername?: string;
		role?: string;
	};
}

export interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalComments: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface CommentListProps {
	comments: Comment[];
	onUpdate: (commentId: string, content: string) => Promise<void>;
	onDelete: (commentId: string) => Promise<void>;
	onVote: (commentId: string, voteType: number) => Promise<void>;
	onAddComment: (content: string, parentId?: string) => Promise<void>;
	currentUserId?: string;
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	loading?: boolean;
	hasMore?: boolean;
	onLoadMore?: (page: number) => void;
} 