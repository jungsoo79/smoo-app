import { postJson } from '@/lib/api-client';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type SignupResponse = {
  id: string;
  email: string;
  nickname?: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export function login(email: string, password: string) {
  return postJson<LoginResponse>('/auth/login', { email, password }, false);
}

export function signup(email: string, password: string, nickname: string) {
  return postJson<SignupResponse>('/auth/signup', { email, password, nickname }, false);
}

export function verifyEmail(email: string, token: string) {
  return postJson<VerifyEmailResponse>('/auth/verify-email', { email, token }, false);
}

export function logout() {
  return postJson<void>('/auth/logout');
}
