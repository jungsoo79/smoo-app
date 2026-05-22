import type { ChecklistCategory, TaskSectionsByDate } from './types';

export const checklistCategories: ChecklistCategory[] = [
  { id: 1, name: '업무', color: '#9C4545', isDefault: true },
  { id: 2, name: '약속', color: '#6B8BDD', isDefault: true },
  { id: 3, name: '운동', color: '#1B9720', isDefault: true },
];

export const checklistTaskSectionsByDate: TaskSectionsByDate = {};
