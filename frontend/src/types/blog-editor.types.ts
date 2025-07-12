export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogEditorProps {
  lastFocusTime?: number;
} 