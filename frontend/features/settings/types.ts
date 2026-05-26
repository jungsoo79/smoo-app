export type AuthProvider = 'email' | 'google' | 'kakao';

export type UserProfile = {
  id: string;
  nickname: string | null;
  email: string | null;
  joinedAt: string | null;
  provider: AuthProvider;
};

export type PushPreferences = {
  allPush: boolean;
  schedulePush: boolean;
  todoPush: boolean;
  servicePush: boolean;
};

export type UpdateProfilePayload = {
  nickname?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SettingsBootstrap = {
  profile: UserProfile;
  pushPreferences: PushPreferences;
};
