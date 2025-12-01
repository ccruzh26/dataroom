export interface DocumentSection {
  id: string;
  documentId: string;
  title: string;
  content: string;
  order: number;
  embedding?: unknown;
}

export interface Category {
  id: string;
  name: string;
  color?: string | null;
  order: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Document {
  id: string;
  title: string;
  path: string;
  order: number;
  summary: string | null;
  content: string;
  parentId?: string | null;
  categoryId?: string | null;
  isFolder?: boolean | null;
  isFile?: boolean | null;
  fileUrl?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  sections?: DocumentSection[];
  children?: Document[];
}

export interface Citation {
  index: number;
  docId: string;
  sectionId?: string;
  docTitle: string;
  sectionTitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt?: Date | null;
}

export type ViewMode = 'outline' | 'cards';
