import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_STORAGE_KEY = 'zerly.auth.session';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
};

type SessionInput = Omit<AuthSession, 'expiresAt'>;

function getWebStorage() {
  return (globalThis as { localStorage?: Storage }).localStorage;
}

async function setStoredValue(value: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(SESSION_STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, value);
}

async function getStoredValue() {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(SESSION_STORAGE_KEY) ?? null;
  }

  return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
}

async function deleteStoredValue() {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.tokenType === 'string' &&
    typeof session.expiresIn === 'number' &&
    typeof session.expiresAt === 'number'
  );
}

export async function saveSession(session: SessionInput) {
  const nextSession: AuthSession = {
    ...session,
    expiresAt: Date.now() + session.expiresIn * 1000,
  };

  await setStoredValue(JSON.stringify(nextSession));
  return nextSession;
}

export async function getSession() {
  const storedValue = await getStoredValue();

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue);

    if (isAuthSession(parsed)) {
      return parsed;
    }
  } catch {
    // Invalid session data should not keep the app in an ambiguous auth state.
  }

  await clearSession();
  return null;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken ?? null;
}

export async function clearSession() {
  await deleteStoredValue();
}
