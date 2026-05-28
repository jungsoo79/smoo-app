import type { ChecklistCategory, Task, TaskSection, TaskSectionsByDate, TodoPayload, TodoWithMeta } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const apiBaseUrl = env?.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const userId = env?.EXPO_PUBLIC_MOCK_USER_ID ?? DEFAULT_USER_ID;

type ApiResponse<T> = {
  code?: string;
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
};

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

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-USER-ID': userId,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...init?.headers,
    },
  });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as ApiResponse<T>) : undefined;

  if (!response.ok) {
    throw new Error(body?.message ?? body?.code ?? 'TASK_API_REQUEST_FAILED');
  }

  return body?.data as T;
}

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
  const response = await request<DailyTaskResponse>(`/api/tasks?date=${encodeURIComponent(date)}`);

  return toTaskSections(response);
}

export async function createTodo(payload: TodoPayload): Promise<TodoWithMeta> {
  const task = await request<TaskResponse>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(toTaskRequestBody(payload)),
  });

  return {
    ...toTask(task),
    category: task.categoryName ?? payload.category,
    date: task.dueDate,
  };
}

export async function updateTodo(taskId: string, payload: TodoPayload): Promise<TodoWithMeta> {
  const task = await request<TaskResponse>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(toTaskRequestBody(payload)),
  });

  return {
    ...toTask(task),
    category: task.categoryName ?? payload.category,
    date: task.dueDate,
  };
}

export async function deleteTodo(taskId: string): Promise<void> {
  await request<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function completeTodo(taskId: string): Promise<Task> {
  return toTask(
    await request<TaskResponse>(`/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
    })
  );
}

export async function incompleteTodo(taskId: string): Promise<Task> {
  return toTask(
    await request<TaskResponse>(`/api/tasks/${taskId}/incomplete`, {
      method: 'PATCH',
    })
  );
}

export async function reorderTasks(date: string, tasks: Task[]): Promise<TaskSection[]> {
  const response = await request<DailyTaskResponse>('/api/tasks/reorder', {
    method: 'PATCH',
    body: JSON.stringify({
      date,
      orders: tasks.map((task, index) => ({
        taskId: Number(task.id),
        sortOrder: index,
      })),
    }),
  });

  return toTaskSections(response);
}

export async function getChecklistCategories(): Promise<ChecklistCategory[]> {
  return (await request<TaskCategoryResponse[]>('/api/tasks/categories')).map(toCategory);
}

export async function createChecklistCategory(
  payload: Omit<ChecklistCategory, 'id' | 'isDefault'>
): Promise<ChecklistCategory> {
  const category = await request<TaskCategoryResponse>('/api/tasks/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      color: payload.color,
    }),
  });

  return toCategory(category);
}

export async function deleteChecklistCategory(categoryId: number): Promise<void> {
  await request<void>(`/api/tasks/categories/${categoryId}`, {
    method: 'DELETE',
  });
}
