import type { ChecklistCategory, Task, TaskSection, TaskSectionsByDate, TodoPayload, TodoWithMeta } from './types';
import { deleteJson, getJson, patchJson, postJson } from '@/lib/api-client';

type TaskResponse = {
  categoryColor?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  completed: boolean;
  completedAt?: string | null;
  dueDate: string;
  id: number;
  memo?: string | null;
  sortOrder?: number | null;
  status?: string;
  title: string;
};

type TaskCategoryGroupResponse = {
  categoryColor?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  tasks: TaskResponse[];
};

type DailyTaskResponse = {
  categories: TaskCategoryGroupResponse[];
  date: string;
};

type TaskCategoryResponse = {
  color?: string | null;
  id: number;
  isDefault: boolean;
  name: string;
};

type TaskRequestBody = {
  categoryId?: number | null;
  dueDate: string;
  memo?: string;
  title: string;
};

function toTask(response: TaskResponse): Task {
  return {
    id: String(response.id),
    title: response.title,
    detail: response.memo ?? undefined,
    done: response.completed,
    categoryColor: response.categoryColor ?? undefined,
    categoryId: response.categoryId ?? null,
    categoryName: response.categoryName ?? null,
    sortOrder: response.sortOrder ?? 0,
  };
}

function toCategory(response: TaskCategoryResponse): ChecklistCategory {
  return {
    id: response.id,
    name: response.name,
    color: response.color ?? undefined,
    isDefault: response.isDefault,
  };
}

function toTaskSections(response: DailyTaskResponse): TaskSection[] {
  return response.categories.map((category) => ({
    title: category.categoryName ?? '일상',
    tasks: category.tasks.map(toTask),
  }));
}

function toTaskRequestBody(payload: TodoPayload): TaskRequestBody {
  return {
    title: payload.title,
    memo: payload.memo,
    dueDate: payload.date,
    categoryId: payload.categoryId ?? null,
  };
}

export async function getTaskSectionsByDateMap(): Promise<TaskSectionsByDate> {
  return {};
}

export async function getTaskSectionsByDate(date: string): Promise<TaskSection[]> {
  const response = await getJson<DailyTaskResponse>(`/api/tasks?date=${encodeURIComponent(date)}`);

  return toTaskSections(response);
}

export async function createTodo(payload: TodoPayload): Promise<TodoWithMeta> {
  const task = await postJson<TaskResponse>('/api/tasks', toTaskRequestBody(payload));

  return {
    ...toTask(task),
    category: task.categoryName ?? payload.category,
    date: task.dueDate,
  };
}

export async function updateTodo(taskId: string, payload: TodoPayload): Promise<TodoWithMeta> {
  const task = await patchJson<TaskResponse>(`/api/tasks/${taskId}`, toTaskRequestBody(payload));

  return {
    ...toTask(task),
    category: task.categoryName ?? payload.category,
    date: task.dueDate,
  };
}

export async function deleteTodo(taskId: string): Promise<void> {
  await deleteJson<void>(`/api/tasks/${taskId}`);
}

export async function completeTodo(taskId: string): Promise<Task> {
  return toTask(
    await patchJson<TaskResponse>(`/api/tasks/${taskId}/complete`)
  );
}

export async function incompleteTodo(taskId: string): Promise<Task> {
  return toTask(
    await patchJson<TaskResponse>(`/api/tasks/${taskId}/incomplete`)
  );
}

export async function reorderTasks(date: string, tasks: Task[]): Promise<TaskSection[]> {
  const response = await patchJson<DailyTaskResponse>('/api/tasks/reorder', {
    date,
    orders: tasks.map((task, index) => ({
      taskId: Number(task.id),
      sortOrder: index,
    })),
  });

  return toTaskSections(response);
}

export async function getChecklistCategories(): Promise<ChecklistCategory[]> {
  return (await getJson<TaskCategoryResponse[]>('/api/tasks/categories')).map(toCategory);
}

export async function createChecklistCategory(
  payload: Omit<ChecklistCategory, 'id' | 'isDefault'>
): Promise<ChecklistCategory> {
  const category = await postJson<TaskCategoryResponse>('/api/tasks/categories', {
    name: payload.name,
    color: payload.color,
  });

  return toCategory(category);
}

export async function deleteChecklistCategory(categoryId: number): Promise<void> {
  await deleteJson<void>(`/api/tasks/categories/${categoryId}`);
}
