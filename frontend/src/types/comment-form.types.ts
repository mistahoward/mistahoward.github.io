export interface CommentFormProps {
	onSubmit: (content: string, parentId?: string) => Promise<void>;
	parentId?: string;
	initialContent?: string;
	onCancel?: () => void;
	isEditing?: boolean;
} 