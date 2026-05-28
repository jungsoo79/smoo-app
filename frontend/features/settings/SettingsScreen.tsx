import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppTopBar } from '@/components/app-chrome';
import {
  changePassword,
  getSettingsBootstrap,
  logout,
  updateMyProfile,
  updatePushPreferences,
  withdrawAccount,
} from '@/features/settings/api';
import type { AuthProvider, PushPreferences, UserProfile } from '@/features/settings/types';
import { ApiError } from '@/lib/api-client';

type AccountActionKey = 'profile' | 'password' | 'withdrawal';
type ModalKey = AccountActionKey | 'nickname' | 'logout' | null;
type PushToggleKey = 'schedulePush' | 'todoPush' | 'servicePush';
type ToggleKey = 'systemTheme' | keyof PushPreferences;
type SavingTarget = 'nickname' | 'password' | 'withdrawal' | 'logout' | 'push' | null;

type SettingAction = {
  key: AccountActionKey;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  tone?: 'default' | 'danger';
};

type ToggleSetting = {
  key: ToggleKey;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  description?: string;
};

const ACCOUNT_ACTIONS: SettingAction[] = [
  { key: 'profile', icon: 'person-outline', label: '프로필 정보 조회' },
  { key: 'password', icon: 'lock-outline', label: '비밀번호 변경' },
  { key: 'withdrawal', icon: 'remove-circle-outline', label: '회원 탈퇴', tone: 'danger' },
];

const THEME_SETTINGS: ToggleSetting[] = [
  {
    key: 'systemTheme',
    icon: 'brightness-auto',
    label: '시스템 설정 따라가기',
    description: '시스템 설정에 따라 자동 적용됩니다.',
  },
];

const PUSH_SETTINGS: ToggleSetting[] = [
  { key: 'allPush', icon: 'notifications-none', label: '전체 알림' },
  { key: 'schedulePush', icon: 'event-note', label: '일정 알림' },
  { key: 'todoPush', icon: 'check-circle-outline', label: '할 일 알림' },
  { key: 'servicePush', icon: 'campaign', label: '서비스 알림' },
];

const PUSH_KEYS: PushToggleKey[] = ['schedulePush', 'todoPush', 'servicePush'];

const EMPTY_PROFILE: UserProfile = {
  id: '',
  nickname: null,
  email: null,
  joinedAt: null,
  provider: 'email',
};

const FALLBACK_PROFILE = {
  nickname: '닉네임 미설정',
  email: '이메일 정보 없음',
  joinedAt: '가입일 정보 없음',
};

const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  email: '이메일',
  google: 'Google',
  kakao: 'Kakao',
};

const AUTH_REQUIRED_MESSAGE = '로그인이 필요한 화면입니다. 로그인 후 다시 확인해주세요.';

function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

function toPushPreferences(toggles: Record<ToggleKey, boolean>): PushPreferences {
  return {
    allPush: toggles.allPush,
    schedulePush: toggles.schedulePush,
    todoPush: toggles.todoPush,
    servicePush: toggles.servicePush,
  };
}

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const slideX = useRef(new Animated.Value(-width)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const previousPushSettings = useRef<Record<PushToggleKey, boolean>>({
    schedulePush: true,
    todoPush: true,
    servicePush: false,
  });

  const [modal, setModal] = useState<ModalKey>(null);
  const [isLoading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState('');
  const [savingTarget, setSavingTarget] = useState<SavingTarget>(null);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    systemTheme: true,
    allPush: true,
    schedulePush: true,
    todoPush: true,
    servicePush: false,
  });

  const closeModal = () => {
    setModal(null);
    setNicknameError('');
    setPasswordError('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const openModal = (nextModal: ModalKey) => {
    if (nextModal === 'password' && profile.provider !== 'email') {
      return;
    }

    if (nextModal === 'nickname') {
      setNicknameDraft(profile.nickname ?? '');
    }

    setModal(nextModal);
  };

  const persistPushPreferences = async (next: PushPreferences, previous: Record<ToggleKey, boolean>) => {
    setScreenError('');
    setSavingTarget('push');

    try {
      await updatePushPreferences(next);
    } catch (error) {
      setToggles(previous);
      setScreenError(isAuthError(error) ? AUTH_REQUIRED_MESSAGE : '알림 설정을 저장하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setSavingTarget(null);
    }
  };

  const updateToggle = (key: ToggleKey, value: boolean) => {
    if (key === 'systemTheme') {
      return;
    }

    let nextPushPreferences: PushPreferences | null = null;
    let previousToggles: Record<ToggleKey, boolean> | null = null;

    setToggles((current) => {
      previousToggles = current;

      if (key === 'allPush') {
        if (!value) {
          previousPushSettings.current = {
            schedulePush: current.schedulePush,
            todoPush: current.todoPush,
            servicePush: current.servicePush,
          };

          const next = {
            ...current,
            allPush: false,
            schedulePush: false,
            todoPush: false,
            servicePush: false,
          };
          nextPushPreferences = toPushPreferences(next);
          return next;
        }

        const next = {
          ...current,
          allPush: true,
          ...previousPushSettings.current,
        };
        nextPushPreferences = toPushPreferences(next);
        return next;
      }

      if (!current.allPush) {
        return current;
      }

      const next = { ...current, [key]: value };
      previousPushSettings.current = {
        schedulePush: next.schedulePush,
        todoPush: next.todoPush,
        servicePush: next.servicePush,
      };
      next.allPush = PUSH_KEYS.some((pushKey) => next[pushKey]);
      nextPushPreferences = toPushPreferences(next);
      return next;
    });

    if (nextPushPreferences && previousToggles) {
      void persistPushPreferences(nextPushPreferences, previousToggles);
    }
  };

  const saveNickname = () => {
    const trimmed = nicknameDraft.trim();

    if (trimmed.length < 2) {
      setNicknameError('닉네임은 2자 이상 입력해주세요.');
      return;
    }

    if (trimmed.length > 20) {
      setNicknameError('닉네임은 20자 이하로 입력해주세요.');
      return;
    }

    if (profile.nickname && trimmed === profile.nickname) {
      setNicknameError('기존 닉네임과 동일합니다.');
      return;
    }

    setSavingTarget('nickname');
    updateMyProfile({ nickname: trimmed })
      .then((updatedProfile) => {
        setProfile(updatedProfile);
        closeModal();
      })
      .catch((error) => {
        setNicknameError(isAuthError(error) ? AUTH_REQUIRED_MESSAGE : '닉네임 변경에 실패했습니다. 다시 시도해주세요.');
      })
      .finally(() => {
        setSavingTarget(null);
      });
  };

  const savePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('입력 정보를 확인해주세요.');
      return;
    }

    if (/\s/.test(newPassword) || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordError('비밀번호 형식을 확인해주세요.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('현재 비밀번호와 다른 값을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setSavingTarget('password');
    changePassword({ currentPassword, newPassword, confirmPassword })
      .then(closeModal)
      .catch((error) => {
        setPasswordError(
          isAuthError(error) ? AUTH_REQUIRED_MESSAGE : '비밀번호 변경에 실패했습니다. 입력 정보를 확인해주세요.',
        );
      })
      .finally(() => {
        setSavingTarget(null);
      });
  };

  const confirmLogout = () => {
    setSavingTarget('logout');
    logout().finally(() => {
      setSavingTarget(null);
      closeModal();
      router.replace('/login');
    });
  };

  const confirmWithdrawal = () => {
    setSavingTarget('withdrawal');
    withdrawAccount()
      .then(() => {
        closeModal();
        router.replace('/login');
      })
      .catch((error) => {
        setScreenError(isAuthError(error) ? AUTH_REQUIRED_MESSAGE : '회원 탈퇴 요청을 처리하지 못했습니다.');
        closeModal();
      })
      .finally(() => {
        setSavingTarget(null);
      });
  };

  useEffect(() => {
    slideX.setValue(-width);
    fadeIn.setValue(0);

    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideX, width]);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setScreenError('');

    getSettingsBootstrap()
      .then(({ preferences, profile: nextProfile, pushPreferences }) => {
        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
        setToggles({
          systemTheme: preferences.theme === 'system',
          ...pushPreferences,
        });
        previousPushSettings.current = {
          schedulePush: pushPreferences.schedulePush,
          todoPush: pushPreferences.todoPush,
          servicePush: pushPreferences.servicePush,
        };
      })
      .catch((error) => {
        if (isMounted) {
          setScreenError(isAuthError(error) ? AUTH_REQUIRED_MESSAGE : '설정 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayNickname = profile.nickname || FALLBACK_PROFILE.nickname;
  const displayEmail = profile.email || FALLBACK_PROFILE.email;
  const displayJoinedAt = profile.joinedAt || FALLBACK_PROFILE.joinedAt;
  const displayProvider = AUTH_PROVIDER_LABELS[profile.provider];
  const accountActions = ACCOUNT_ACTIONS.filter(
    (item) => profile.provider === 'email' || item.key !== 'password',
  );

  return (
    <Animated.View style={[styles.screen, { opacity: fadeIn, transform: [{ translateX: slideX }] }]}>
      <AppTopBar
        title="설정"
        backgroundColor="rgba(255, 255, 255, 0.62)"
        leftAccessibilityLabel="뒤로가기"
        leftIcon="chevron-left"
        onLeftPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace('/(tabs)');
        }}
      />

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {screenError ? (
          <View style={styles.screenMessage}>
            <MaterialIcons name="error-outline" size={18} color="#BA1A1A" />
            <Text style={styles.screenMessageText}>{screenError}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>설정 정보를 불러오는 중</Text>
            <Text style={styles.loadingDescription}>잠시만 기다려주세요.</Text>
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>내 계정</Text>
            <Text style={[styles.summaryName, !profile.nickname && styles.placeholderText]}>{displayNickname}</Text>
            <Text style={[styles.summaryEmail, !profile.email && styles.placeholderText]}>{displayEmail}</Text>
            <Text style={styles.summaryProvider}>{displayProvider} 계정으로 로그인됨</Text>
          </View>
          <TouchableOpacity activeOpacity={0.72} onPress={() => openModal('nickname')} style={styles.editButton}>
            <Text style={styles.editButtonText}>편집</Text>
          </TouchableOpacity>
        </View>

        <SettingsGroup title="내 정보 관리">
          {accountActions.map((item, index) => (
            <ActionRow
              key={item.key}
              item={item}
              isLast={index === accountActions.length - 1}
              onPress={() => openModal(item.key)}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="테마 설정">
          {THEME_SETTINGS.map((item, index) => (
            <ToggleRow
              key={item.key}
              disabled
              item={item}
              value={toggles[item.key]}
              onValueChange={(value) => updateToggle(item.key, value)}
              isLast={index === THEME_SETTINGS.length - 1}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="푸시 알람 설정">
          {PUSH_SETTINGS.map((item, index) => (
            <ToggleRow
              key={item.key}
              disabled={item.key !== 'allPush' && !toggles.allPush}
              item={item}
              value={toggles[item.key]}
              onValueChange={(value) => updateToggle(item.key, value)}
              isLast={index === PUSH_SETTINGS.length - 1}
              isSaving={savingTarget === 'push'}
            />
          ))}
        </SettingsGroup>

        <TouchableOpacity activeOpacity={0.74} onPress={() => openModal('logout')} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#191C1D" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      <SettingsModal visible={modal === 'profile'} title="프로필 정보" onClose={closeModal}>
        <InfoRow label="닉네임" value={displayNickname} isPlaceholder={!profile.nickname} />
        <InfoRow label="이메일" value={displayEmail} isPlaceholder={!profile.email} />
        <InfoRow label="가입일" value={displayJoinedAt} isPlaceholder={!profile.joinedAt} />
        <InfoRow label="로그인 방식" value={displayProvider} />
      </SettingsModal>

      <SettingsModal
        visible={modal === 'nickname'}
        title="닉네임 변경"
        onClose={closeModal}
        primaryLabel="저장"
        primaryLoadingLabel="저장 중..."
        primaryDisabled={savingTarget === 'nickname'}
        onPrimaryPress={saveNickname}>
        <TextInput
          autoComplete="nickname"
          maxLength={20}
          nativeID="settings-nickname"
          onChangeText={setNicknameDraft}
          placeholder="새 닉네임"
          placeholderTextColor="rgba(71, 71, 71, 0.42)"
          style={styles.input}
          textContentType="nickname"
          value={nicknameDraft}
        />
        <Text style={styles.helperText}>2자 이상 20자 이하로 입력해주세요.</Text>
        {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
      </SettingsModal>

      <SettingsModal
        visible={modal === 'password'}
        title="비밀번호 변경"
        onClose={closeModal}
        primaryLabel="변경"
        primaryLoadingLabel="변경 중..."
        primaryDisabled={savingTarget === 'password'}
        onPrimaryPress={savePassword}>
        <TextInput
          autoComplete="current-password"
          nativeID="settings-current-password"
          onChangeText={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
          placeholder="현재 비밀번호"
          placeholderTextColor="rgba(71, 71, 71, 0.42)"
          secureTextEntry
          style={styles.input}
          textContentType="password"
          value={passwordForm.currentPassword}
        />
        <TextInput
          autoComplete="new-password"
          nativeID="settings-new-password"
          onChangeText={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
          placeholder="새 비밀번호"
          placeholderTextColor="rgba(71, 71, 71, 0.42)"
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={passwordForm.newPassword}
        />
        <TextInput
          autoComplete="new-password"
          nativeID="settings-confirm-password"
          onChangeText={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
          placeholder="새 비밀번호 확인"
          placeholderTextColor="rgba(71, 71, 71, 0.42)"
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={passwordForm.confirmPassword}
        />
        <Text style={styles.helperText}>영문과 숫자를 포함해 8자 이상 입력해주세요.</Text>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </SettingsModal>

      <SettingsModal
        danger
        visible={modal === 'withdrawal'}
        title="회원 탈퇴"
        onClose={closeModal}
        primaryLabel="탈퇴"
        primaryLoadingLabel="처리 중..."
        primaryDisabled={savingTarget === 'withdrawal'}
        onPrimaryPress={confirmWithdrawal}>
        <Text style={styles.modalBodyText}>
          회원 탈퇴 시 계정 정보와 서비스 이용 데이터가 삭제됩니다.{'\n'}
          삭제된 데이터는 복구할 수 없습니다.{'\n'}
          정말 탈퇴하시겠습니까?
        </Text>
      </SettingsModal>

      <SettingsModal
        visible={modal === 'logout'}
        title="로그아웃"
        onClose={closeModal}
        primaryLabel="로그아웃"
        primaryLoadingLabel="처리 중..."
        primaryDisabled={savingTarget === 'logout'}
        onPrimaryPress={confirmLogout}>
        <Text style={styles.modalBodyText}>로그아웃하시겠습니까?</Text>
      </SettingsModal>
    </Animated.View>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

function ActionRow({
  item,
  isLast,
  onPress,
}: {
  item: SettingAction;
  isLast: boolean;
  onPress: () => void;
}) {
  const isDanger = item.tone === 'danger';

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, isDanger && styles.dangerIconBox]}>
          <MaterialIcons name={item.icon} size={20} color={isDanger ? '#DC2626' : '#191C1D'} />
        </View>
        <Text style={[styles.rowLabel, isDanger && styles.dangerText]}>{item.label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#B8BEC2" />
    </TouchableOpacity>
  );
}

function ToggleRow({
  item,
  value,
  onValueChange,
  isLast,
  disabled,
  isSaving,
}: {
  item: ToggleSetting;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast: boolean;
  disabled?: boolean;
  isSaving?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder, disabled && styles.disabledRow]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons name={item.icon} size={20} color="#191C1D" />
        </View>
        <View style={styles.labelStack}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          {item.description ? <Text style={styles.rowDescription}>{item.description}</Text> : null}
        </View>
      </View>
      <Switch
        accessibilityLabel={item.label}
        disabled={disabled || isSaving}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#D7DBDE', true: '#191C1D' }}
        value={value}
      />
    </View>
  );
}

function InfoRow({ isPlaceholder, label, value }: { isPlaceholder?: boolean; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isPlaceholder && styles.placeholderText]}>{value}</Text>
    </View>
  );
}

function SettingsModal({
  children,
  danger,
  onClose,
  onPrimaryPress,
  primaryDisabled,
  primaryLabel,
  primaryLoadingLabel,
  title,
  visible,
}: {
  children: React.ReactNode;
  danger?: boolean;
  onClose: () => void;
  onPrimaryPress?: () => void;
  primaryDisabled?: boolean;
  primaryLabel?: string;
  primaryLoadingLabel?: string;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalContent}>{children}</View>
          <View style={styles.modalActions}>
            <TouchableOpacity activeOpacity={0.74} onPress={onClose} style={styles.modalSecondaryButton}>
              <Text style={styles.modalSecondaryText}>취소</Text>
            </TouchableOpacity>
            {primaryLabel ? (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={primaryDisabled}
                onPress={onPrimaryPress}
                style={[
                  styles.modalPrimaryButton,
                  danger && styles.modalDangerButton,
                  primaryDisabled && styles.modalPrimaryButtonDisabled,
                ]}>
                <Text style={styles.modalPrimaryText}>
                  {primaryDisabled ? (primaryLoadingLabel ?? primaryLabel) : primaryLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 32,
  },
  summary: {
    minHeight: 116,
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  summaryText: {
    minWidth: 0,
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(71, 71, 71, 0.62)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  summaryName: {
    marginTop: 6,
    color: '#000000',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  summaryEmail: {
    marginTop: 4,
    color: 'rgba(71, 71, 71, 0.72)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  summaryProvider: {
    marginTop: 4,
    color: 'rgba(71, 71, 71, 0.58)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  placeholderText: {
    color: 'rgba(71, 71, 71, 0.48)',
  },
  editButton: {
    height: 40,
    minWidth: 68,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191C1D',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  screenMessage: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F7',
  },
  screenMessageText: {
    flex: 1,
    color: '#BA1A1A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  loadingCard: {
    minHeight: 92,
    borderRadius: 28,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
  },
  loadingTitle: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
  },
  loadingDescription: {
    marginTop: 4,
    color: 'rgba(71, 71, 71, 0.64)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  group: {
    gap: 16,
  },
  groupTitle: {
    paddingHorizontal: 8,
    color: 'rgba(71, 71, 71, 0.72)',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  groupCard: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 6,
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(25, 28, 29, 0.08)',
  },
  disabledRow: {
    opacity: 0.48,
  },
  rowLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F3',
  },
  dangerIconBox: {
    backgroundColor: '#FEE2E2',
  },
  labelStack: {
    minWidth: 0,
    flex: 1,
  },
  rowLabel: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  rowDescription: {
    marginTop: 2,
    color: 'rgba(71, 71, 71, 0.6)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  dangerText: {
    color: '#DC2626',
  },
  logoutButton: {
    minHeight: 60,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 6,
  },
  logoutText: {
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
  },
  modalContent: {
    marginTop: 20,
    gap: 12,
  },
  modalActions: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalSecondaryButton: {
    height: 44,
    minWidth: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#F1F3F4',
  },
  modalPrimaryButton: {
    height: 44,
    minWidth: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#191C1D',
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.58,
  },
  modalDangerButton: {
    backgroundColor: '#DC2626',
  },
  modalSecondaryText: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  modalBodyText: {
    color: '#191C1D',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: '#191C1D',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    backgroundColor: '#F4F6F7',
  },
  helperText: {
    color: 'rgba(71, 71, 71, 0.64)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  infoRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoLabel: {
    color: 'rgba(71, 71, 71, 0.66)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  infoValue: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
