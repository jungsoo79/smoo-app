import { getAccessToken } from '@/features/auth/session';

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const API_PREFIX = '/api/v1';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const apiBaseUrl = env?.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

type ApiErrorBody = {
  error?: string;
  code?: string;
  message?: string;
};

type ApiResponse<TResponse> = {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: TResponse;
};

type RequestOptions = {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse<TResponse>(response: Response) {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as TResponse | ApiResponse<TResponse> | ApiErrorBody) : undefined;

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | undefined;
    throw new ApiError(
      errorBody?.error ?? errorBody?.code ?? errorBody?.message ?? 'REQUEST_FAILED',
      response.status,
    );
  }

  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return (data as ApiResponse<TResponse>).data;
  }

  return data as TResponse;
}

function buildApiUrl(path: string) {
  const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath.startsWith('/api/')) {
    return `${baseUrl}${normalizedPath}`;
  }

  if (normalizedPath.startsWith(API_PREFIX)) {
    return `${baseUrl}${normalizedPath}`;
  }

  return `${baseUrl}${API_PREFIX}${normalizedPath}`;
}

export async function requestJson<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  if (options.auth) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method,
    headers,
    body,
  });

  return parseResponse<TResponse>(response);
}

export function getJson<TResponse>(path: string, auth = true) {
  return requestJson<TResponse>(path, { method: 'GET', auth });
}

export function postJson<TResponse>(path: string, body?: unknown, auth = true) {
  return requestJson<TResponse>(path, { method: 'POST', body, auth });
}

export function patchJson<TResponse>(path: string, body?: unknown, auth = true) {
  return requestJson<TResponse>(path, { method: 'PATCH', body, auth });
}

export function deleteJson<TResponse>(path: string, auth = true) {
  return requestJson<TResponse>(path, { method: 'DELETE', auth });
}
