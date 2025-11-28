export interface DailyNote {
  id: string;
  date: Date | string;
  rawText: string;
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  proseSummary: string | null;
  actionItems: string | null;
  taskCategory: string | null;
  taskDescription: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProcessedNote {
  yesterday: string[];
  today: string[];
  blockers: string[];
  proseSummary: string;
  actionItems: ActionItem[];
}

export interface TaskClassification {
  taskCategory: string;
  taskDescription: string;
}

export interface NoteFormData {
  rawText: string;
  yesterday?: string;
  today?: string;
  blockers?: string;
  proseSummary?: string;
  actionItems?: ActionItem[];
  taskCategory?: string;
  taskDescription?: string;
}

export type RecordingState = 'idle' | 'recording' | 'processing';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

