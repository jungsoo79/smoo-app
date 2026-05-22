import { checklistCategories, checklistTaskSectionsByDate } from './mock';
import type { ChecklistCategory, Task, TaskSection, TaskSectionsByDate, TodoPayload, TodoWithMeta } from './types';

let categories = [...checklistCategories];
let taskSectionsByDate: TaskSectionsByDate = { ...checklistTaskSectionsByDate };

function getSectionTitle(category: string) {
  return category === '없음' ? '일상' : category;
}

function removeTaskFromSections(sectionsByDate: TaskSectionsByDate, taskId: string) {
  return Object.fromEntries(
    Object.entries(sectionsByDate)
      .map(([date, sections]) => [
        date,
        sections
          .map((section) => ({
            ...section,
            tasks: section.tasks.filter((task) => task.id !== taskId),
          }))
          .filter((section) => section.tasks.length > 0),
      ])
      .filter(([, sections]) => sections.length > 0)
  ) as TaskSectionsByDate;
}

function addTaskToSection(sectionsByDate: TaskSectionsByDate, date: string, sectionTitle: string, task: Task) {
  const currentSections = sectionsByDate[date] ?? [];
  const sectionExists = currentSections.some((section) => section.title === sectionTitle);

  return {
    ...sectionsByDate,
    [date]: sectionExists
      ? currentSections.map((section) =>
          section.title === sectionTitle
            ? {
                ...section,
                tasks: [...section.tasks, task],
              }
            : section
        )
      : [
          ...currentSections,
          {
            title: sectionTitle,
            tasks: [task],
          },
        ],
  };
}

export async function getTaskSectionsByDateMap(): Promise<TaskSectionsByDate> {
  return { ...taskSectionsByDate };
}

export async function getTaskSectionsByDate(date: string): Promise<TaskSection[]> {
  return taskSectionsByDate[date] ?? [];
}

export async function createTodo(payload: TodoPayload): Promise<TodoWithMeta> {
  const sectionTitle = getSectionTitle(payload.category);
  const task: Task = {
    id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title,
    detail: payload.memo,
  };

  taskSectionsByDate = addTaskToSection(taskSectionsByDate, payload.date, sectionTitle, task);

  return {
    ...task,
    category: sectionTitle,
    date: payload.date,
  };
}

export async function updateTodo(taskId: string, payload: TodoPayload): Promise<TodoWithMeta> {
  const sectionTitle = getSectionTitle(payload.category);
  const existingTask = Object.values(taskSectionsByDate)
    .flatMap((sections) => sections.flatMap((section) => section.tasks))
    .find((task) => task.id === taskId);
  const task: Task = {
    id: taskId,
    title: payload.title,
    detail: payload.memo,
    badge: existingTask?.badge,
    done: existingTask?.done,
  };

  taskSectionsByDate = addTaskToSection(removeTaskFromSections(taskSectionsByDate, taskId), payload.date, sectionTitle, task);

  return {
    ...task,
    category: sectionTitle,
    date: payload.date,
  };
}

export async function deleteTodo(taskId: string): Promise<void> {
  taskSectionsByDate = removeTaskFromSections(taskSectionsByDate, taskId);
}

export async function reorderTaskSections(date: string, sections: TaskSection[]): Promise<TaskSection[]> {
  taskSectionsByDate = {
    ...taskSectionsByDate,
    [date]: sections,
  };

  return sections;
}

export async function getChecklistCategories(): Promise<ChecklistCategory[]> {
  return [...categories];
}

export async function createChecklistCategory(
  payload: Omit<ChecklistCategory, 'id' | 'isDefault'>
): Promise<ChecklistCategory> {
  const category: ChecklistCategory = {
    ...payload,
    id: Math.max(0, ...categories.map((item) => item.id)) + 1,
    isDefault: false,
  };

  categories = [...categories, category];

  return category;
}
