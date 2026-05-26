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
  done?: boolean;
}

export interface TaskSection {
  title: string;
  tasks: Task[];
}

export type TaskSectionsByDate = Record<string, TaskSection[]>;

export interface TodoPayload {
  category: string;
  date: string;
  memo?: string;
  title: string;
}

export interface TodoWithMeta extends Task {
  category: string;
  date: string;
}
