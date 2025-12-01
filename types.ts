
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type ReferenceType = 'journal' | 'book' | 'website' | 'conference';

export interface PdfAnnotation {
  id: string;
  type: 'path' | 'text' | 'highlight';
  page: number; // 1-based index
  color: string;
  // For paths/highlights
  points?: { x: number; y: number }[];
  lineWidth?: number;
  // For text
  text?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

export interface Reference {
  id: string;
  projectId: string;
  type: ReferenceType;
  title: string;
  authors: string[];
  year: string;
  publication?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  addedAt: string;
  hasPdf?: boolean;
  pdfData?: string; // Base64 Data URI for the PDF file
  pdfAnnotations?: PdfAnnotation[];
}

export interface Annotation {
  id: string;
  referenceId: string;
  text: string; // The selected text
  comment: string; // The user's note
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  progress: number;
  deadline?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Manuscript {
  id: string;
  projectId: string;
  title: string;
  sections: {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'review' | 'complete';
  }[];
  currentStep: number;
  updatedAt: string;
}

export type Language = 'fa' | 'en';
export type Theme = 'light' | 'dark';