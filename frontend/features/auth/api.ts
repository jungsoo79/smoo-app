const DEFAULT_API_BASE_URL = 'http://localhost:8080';

const apiBaseUrl =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

type ApiErrorBody = {
  error?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type SignupResponse = {
  id: string;
  email: string;
};

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as TResponse | ApiErrorBody) : undefined;

  if (!response.ok) {
    throw new Error((data as ApiErrorBody | undefined)?.error ?? 'REQUEST_FAILED');
  }

  return data as TResponse;
}

export function login(email: string, password: string) {
  return postJson<LoginResponse>('/auth/login', { email, password });
}

export function signup(email: string, password: string) {
  return postJson<SignupResponse>('/auth/signup', { email, password });
}

