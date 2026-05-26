import type {
  ChangePasswordPayload,
  PushPreferences,
  SettingsBootstrap,
  UpdateProfilePayload,
  UserProfile,
} from './types';
import { logout as requestLogout } from '@/features/auth/api';
import { clearSession } from '@/features/auth/session';

const MOCK_DELAY_MS = 160;

let mockProfile: UserProfile = {
  id: 'mock-user-1',
  nickname: null,
  email: null,
  joinedAt: null,
  provider: 'email',
};

let mockPushPreferences: PushPreferences = {
  allPush: true,
  schedulePush: true,
  todoPush: true,
  servicePush: false,
};

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });
}

function cloneProfile(): UserProfile {
  return { ...mockProfile };
}

function clonePushPreferences(): PushPreferences {
  return { ...mockPushPreferences };
}

export async function getSettingsBootstrap(): Promise<SettingsBootstrap> {
  await delay();

  return {
    profile: cloneProfile(),
    pushPreferences: clonePushPreferences(),
  };
}

export async function getMyProfile(): Promise<UserProfile> {
  await delay();
  return cloneProfile();
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  await delay();

  if (payload.nickname !== undefined) {
    const nickname = payload.nickname.trim();

    if (nickname.length < 2 || nickname.length > 20) {
      throw new Error('INVALID_NICKNAME');
    }

    mockProfile = {
      ...mockProfile,
      nickname,
    };
  }

  return cloneProfile();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await delay();

  if (mockProfile.provider !== 'email') {
    throw new Error('PASSWORD_NOT_SUPPORTED_FOR_SOCIAL_ACCOUNT');
  }

  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error('PASSWORD_CONFIRM_MISMATCH');
  }
}

export async function withdrawAccount(): Promise<void> {
  await delay();

  mockProfile = {
    ...mockProfile,
    nickname: null,
  };
}

export async function getPushPreferences(): Promise<PushPreferences> {
  await delay();
  return clonePushPreferences();
}

export async function updatePushPreferences(payload: PushPreferences): Promise<PushPreferences> {
  await delay();

  mockPushPreferences = { ...payload };
  return clonePushPreferences();
}

export async function logout(): Promise<void> {
  try {
    await requestLogout();
  } finally {
    await clearSession();
  }
}
