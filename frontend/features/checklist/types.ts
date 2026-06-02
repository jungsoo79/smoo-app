export interface ChecklistCategory {
  id: number;
  name: string;
  color?: string;
  isDefault: boolean;
}

export interface Task {
  id: string;
  title: string;
  detail?: string;
  badge?: string;
  categoryColor?: string;
  categoryId?: number | null;
  categoryName?: string | null;
  done?: boolean;
  sortOrder?: number;
}

export interface TaskSection {
  title: string;
  tasks: Task[];
}

export type TaskSectionsByDate = Record<string, TaskSection[]>;

export interface TodoPayload {
  category: string;
  categoryId?: number | null;
  date: string;
  memo?: string;
  title: string;
}

export interface TodoWithMeta extends Task {
  category: string;
  date: string;
}
