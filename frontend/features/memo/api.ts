import { deleteJson, getJson, patchJson, postJson } from '@/lib/api-client';

export type MemoItem = {
  body: string[];
  category: string;
  date: string;
  id: number;
  title: string;
};

type MemoSummaryResponse = {
  categoryId: number | null;
  categoryName: string | null;
  createdAt: string;
  id: number;
  preview: string | null;
  title: string;
  updatedAt: string;
};

type MemoDetailResponse = {
  categoryId: number | null;
  categoryName: string | null;
  content: string | null;
  createdAt: string;
  id: number;
  title: string;
  updatedAt: string;
};

type MemoCategoryResponse = {
  color: string | null;
  id: number;
  isDefault: boolean;
  name: string;
};

export type MemoPayload = {
  body: string;
  category: string;
  title: string;
};

function toDateString(value?: string | null) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function toMemoItem(response: MemoSummaryResponse | MemoDetailResponse): MemoItem {
  const content = 'content' in response ? response.content : response.preview;

  return {
    body: content ? content.split('\n') : [],
    category: response.categoryName ?? '기타',
    date: toDateString(response.updatedAt ?? response.createdAt),
    id: response.id,
    title: response.title,
  };
}

async function resolveCategoryId(categoryName: string) {
  const name = categoryName.trim();

  if (!name) {
    return null;
  }

  const categories = await getJson<MemoCategoryResponse[]>('/api/memos/categories');
  const existingCategory = categories.find((category) => category.name === name);

  if (existingCategory) {
    return existingCategory.id;
  }

  const createdCategory = await postJson<MemoCategoryResponse>('/api/memos/categories', {
    color: '#D9DADB',
    name,
  });

  return createdCategory.id;
}

export async function getMemos(keyword?: string): Promise<MemoItem[]> {
  const query = keyword?.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : '';
  return (await getJson<MemoSummaryResponse[]>(`/api/memos${query}`)).map(toMemoItem);
}

export async function createMemo(payload: MemoPayload): Promise<MemoItem> {
  const categoryId = await resolveCategoryId(payload.category);
  const memo = await postJson<MemoDetailResponse>('/api/memos', {
    categoryId,
    content: payload.body,
    pinned: false,
    title: payload.title,
  });

  return toMemoItem(memo);
}

export async function updateMemo(memoId: number, payload: MemoPayload): Promise<MemoItem> {
  const categoryId = await resolveCategoryId(payload.category);
  const memo = await patchJson<MemoDetailResponse>(`/api/memos/${memoId}`, {
    categoryId,
    content: payload.body,
    pinned: false,
    title: payload.title,
  });

  return toMemoItem(memo);
}

export async function deleteMemo(memoId: number): Promise<void> {
  await deleteJson<void>(`/api/memos/${memoId}`);
}
