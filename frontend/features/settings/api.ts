import type {
  ChangePasswordPayload,
  PushPreferences,
  SettingsPreferences,
  SettingsBootstrap,
  UpdateProfilePayload,
  UserProfile,
} from './types';
import { logout as requestLogout } from '@/features/auth/api';
import { clearSession } from '@/features/auth/session';
import { getJson, patchJson, postJson } from '@/lib/api-client';

const DEFAULT_PREFERENCES: SettingsPreferences = {
  theme: 'system',
  language: 'ko',
};

type ProfileResponse = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type PreferencesResponse = {
  theme: string | null;
  language: string | null;
};

function toUserProfile(profile: ProfileResponse): UserProfile {
  return {
    id: '',
    nickname: profile.name,
    email: profile.email,
    joinedAt: null,
    provider: 'email',
  };
}

function toSettingsPreferences(preferences: PreferencesResponse): SettingsPreferences {
  const theme = preferences.theme === 'light' || preferences.theme === 'dark' ? preferences.theme : 'system';

  return {
    theme,
    language: preferences.language,
  };
}

export async function getSettingsBootstrap(): Promise<SettingsBootstrap> {
  const [profile, preferences, pushPreferences] = await Promise.all([
    getMyProfile(),
    getSettingsPreferences().catch(() => DEFAULT_PREFERENCES),
    getPushPreferences(),
  ]);

  return {
    profile,
    preferences,
    pushPreferences,
  };
}

export async function getMyProfile(): Promise<UserProfile> {
  const profile = await getJson<ProfileResponse>('/profiles/me');
  return toUserProfile(profile);
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const nickname = payload.nickname?.trim();

  if (nickname !== undefined && (nickname.length < 2 || nickname.length > 20)) {
    throw new Error('INVALID_NICKNAME');
  }

  const profile = await patchJson<ProfileResponse>('/profiles/me', { name: nickname });
  return toUserProfile(profile);
}

export async function getSettingsPreferences(): Promise<SettingsPreferences> {
  const preferences = await getJson<PreferencesResponse>('/settings/preferences');
  return toSettingsPreferences(preferences);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error('PASSWORD_CONFIRM_MISMATCH');
  }

  await patchJson<void>('/auth/password/change', {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });
}

export async function withdrawAccount(): Promise<void> {
  await postJson<void>('/account-deletion-requests', { reason: 'USER_REQUESTED_FROM_SETTINGS' });
  await clearSession();
}

export async function getPushPreferences(): Promise<PushPreferences> {
  return getJson<PushPreferences>('/settings/push-preferences');
}

export async function updatePushPreferences(payload: PushPreferences): Promise<PushPreferences> {
  return patchJson<PushPreferences>('/settings/push-preferences', payload);
}

export async function logout(): Promise<void> {
  try {
    await requestLogout();
  } finally {
    await clearSession();
  }
}
