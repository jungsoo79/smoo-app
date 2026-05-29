import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, AppTypography } from '@/constants/appStyles';
import { signup, verifyEmail } from '@/features/auth/api';

type SignupStep = 'form' | 'codeSent';
type MessageTone = 'error' | 'success';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /[A-Za-z]/;
const DIGIT_PATTERN = /\d/;
const REQUIRED_CODE_LENGTH = 6;

const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.',
  EMAIL_RATE_LIMIT: '이메일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  WEAK_PASSWORD: '영문과 숫자를 포함해 8자 이상 입력해주세요.',
  SIGNUP_FAILED: '회원가입에 실패했습니다.',
};

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  OTP_INVALID: '인증번호가 올바르지 않습니다.',
  OTP_EXPIRED: '인증번호가 만료되었습니다. 회원가입을 다시 요청해주세요.',
  VERIFY_FAILED: '이메일 인증에 실패했습니다. 잠시 후 다시 시도해주세요.',
};

const webTextInputReset =
  Platform.OS === 'web'
    ? ({
        outlineStyle: 'none',
        outlineWidth: 0,
      } as unknown as TextStyle)
    : undefined;

function getErrorMessage(error: unknown, messages: Record<string, string>, fallback: string) {
  const errorCode = error instanceof Error ? error.message : fallback;
  return messages[errorCode] ?? messages[fallback] ?? fallback;
}

function normalizeVerificationCode(value: string) {
  return value.replace(/\D/g, '');
}

export default function SignupScreen() {
  const [step, setStep] = useState<SignupStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isCodeFocused, setCodeFocused] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);
  const [isCodeSubmitted, setCodeSubmitted] = useState(false);
  const [isSigningUp, setSigningUp] = useState(false);
  const [isVerifyingCode, setVerifyingCode] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [codeError, setCodeError] = useState('');

  const trimmedEmail = email.trim();
  const trimmedNickname = nickname.trim();
  const isCodeStep = step === 'codeSent';
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isPasswordStrong =
    password.length >= 8 && PASSWORD_PATTERN.test(password) && DIGIT_PATTERN.test(password);
  const isPasswordConfirmTouched = passwordConfirm.length > 0;
  const isPasswordMatched = isPasswordConfirmTouched && password === passwordConfirm;
  const isNicknameValid = trimmedNickname.length >= 2;
  const isCodeComplete = verificationCode.length === REQUIRED_CODE_LENGTH;
  const canSubmitSignup = isEmailValid && isPasswordStrong && isPasswordMatched && isNicknameValid;
  const canVerifyCode = isCodeStep && isCodeComplete && !isVerifyingCode;

  const emailMessage = useMemo(() => {
    if (!isFormSubmitted && trimmedEmail.length === 0) {
      return '';
    }

    if (trimmedEmail.length === 0) {
      return '이메일 주소를 입력해주세요.';
    }

    return isEmailValid ? '' : '올바른 이메일 형식이 아닙니다.';
  }, [isEmailValid, isFormSubmitted, trimmedEmail.length]);

  const passwordMessage = useMemo(() => {
    if (!isFormSubmitted && password.length === 0) {
      return '';
    }

    if (password.length === 0) {
      return '비밀번호를 입력해주세요.';
    }

    return isPasswordStrong ? '사용 가능한 비밀번호입니다.' : '영문과 숫자를 포함해 8자 이상 입력해주세요.';
  }, [isFormSubmitted, isPasswordStrong, password.length]);

  const confirmMessage = useMemo(() => {
    if (!isFormSubmitted && passwordConfirm.length === 0) {
      return '';
    }

    if (passwordConfirm.length === 0) {
      return '비밀번호를 한 번 더 입력해주세요.';
    }

    return isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.';
  }, [isFormSubmitted, isPasswordMatched, passwordConfirm.length]);

  const nicknameMessage = useMemo(() => {
    if (!isFormSubmitted && trimmedNickname.length === 0) {
      return '';
    }

    if (trimmedNickname.length === 0) {
      return '닉네임을 입력해주세요.';
    }

    return isNicknameValid ? '' : '닉네임은 2자 이상 입력해주세요.';
  }, [isFormSubmitted, isNicknameValid, trimmedNickname.length]);

  const codeMessage = useMemo(() => {
    if (codeError) {
      return codeError;
    }

    if (!isCodeSubmitted && verificationCode.length === 0) {
      return '';
    }

    if (verificationCode.length === 0) {
      return '인증번호를 입력해주세요.';
    }

    return isCodeComplete ? '' : '인증번호 6자리를 입력해주세요.';
  }, [codeError, isCodeComplete, isCodeSubmitted, verificationCode.length]);

  const resetCodeStep = () => {
    setStep('form');
    setVerificationCode('');
    setCodeSubmitted(false);
    setCodeError('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setSignupError('');
    resetCodeStep();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setSignupError('');
    resetCodeStep();
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    setSignupError('');
    resetCodeStep();
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setSignupError('');
    resetCodeStep();
  };

  const handleCodeChange = (value: string) => {
    setVerificationCode(normalizeVerificationCode(value));
    setCodeSubmitted(false);
    setCodeError('');
  };

  const handleSignup = async () => {
    setFormSubmitted(true);
    setSignupError('');
    setCodeError('');

    if (!canSubmitSignup) {
      return;
    }

    try {
      setSigningUp(true);
      await signup(trimmedEmail, password, trimmedNickname);
      setStep('codeSent');
      setVerificationCode('');
      setCodeSubmitted(false);
    } catch (error) {
      setSignupError(getErrorMessage(error, SIGNUP_ERROR_MESSAGES, 'SIGNUP_FAILED'));
    } finally {
      setSigningUp(false);
    }
  };

  const handleVerifyCode = async () => {
    setCodeSubmitted(true);
    setCodeError('');

    if (!canVerifyCode) {
      return;
    }

    try {
      setVerifyingCode(true);
      await verifyEmail(trimmedEmail, verificationCode);
      router.replace('/login');
    } catch (error) {
      setCodeError(getErrorMessage(error, VERIFY_ERROR_MESSAGES, 'VERIFY_FAILED'));
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboardView}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>계정 정보를 입력한 뒤 이메일 인증을 완료해주세요.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이메일 주소</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                editable={!isCodeStep}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
                placeholder="name@example.com"
                placeholderTextColor="#A3A3A3"
                style={[styles.input, emailMessage && styles.inputError, isCodeStep && styles.inputSuccess]}
                textContentType="emailAddress"
                value={email}
              />
              {emailMessage ? <Text style={styles.errorText}>{emailMessage}</Text> : null}
            </View>

            {!isCodeStep ? (
              <>
                <PasswordField
                  isVisible={isPasswordVisible}
                  label="비밀번호"
                  message={passwordMessage}
                  messageTone={isPasswordStrong ? 'success' : 'error'}
                  onChangeText={handlePasswordChange}
                  onToggle={() => setPasswordVisible((current) => !current)}
                  placeholder="영문+숫자 8자 이상"
                  value={password}
                />

                <PasswordField
                  isMatched={isPasswordMatched}
                  isVisible={isConfirmVisible}
                  label="비밀번호 확인"
                  message={confirmMessage}
                  messageTone={isPasswordMatched ? 'success' : 'error'}
                  onChangeText={handlePasswordConfirmChange}
                  onToggle={() => setConfirmVisible((current) => !current)}
                  placeholder="비밀번호 재입력"
                  showMatchState={isPasswordConfirmTouched || isFormSubmitted}
                  value={passwordConfirm}
                />

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>닉네임</Text>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={handleNicknameChange}
                    placeholder="예: smoo"
                    placeholderTextColor="#A3A3A3"
                    style={[styles.input, nicknameMessage && styles.inputError]}
                    value={nickname}
                  />
                  {nicknameMessage ? <Text style={styles.errorText}>{nicknameMessage}</Text> : null}
                </View>

                {signupError ? (
                  <View style={styles.formMessage}>
                    <MaterialIcons color="#BA1A1A" name="error-outline" size={18} />
                    <Text style={styles.formMessageText}>{signupError}</Text>
                  </View>
                ) : null}

                <Pressable
                  disabled={isSigningUp}
                  onPress={handleSignup}
                  style={[styles.primaryButton, (!canSubmitSignup || isSigningUp) && styles.primaryButtonDisabled]}>
                  <Text
                    style={[
                      styles.primaryButtonText,
                      (!canSubmitSignup || isSigningUp) && styles.primaryButtonTextDisabled,
                    ]}>
                    {isSigningUp ? '인증 메일 요청 중...' : '회원가입'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>인증번호</Text>
                  <View
                    style={[
                      styles.inputWithAddon,
                      isCodeFocused && styles.inputFocused,
                      codeMessage && styles.inputError,
                    ]}>
                    <TextInput
                      editable={!isVerifyingCode}
                      keyboardType="number-pad"
                      maxLength={REQUIRED_CODE_LENGTH}
                      onBlur={() => setCodeFocused(false)}
                      onChangeText={handleCodeChange}
                      onFocus={() => setCodeFocused(true)}
                      placeholder="6자리 입력"
                      placeholderTextColor="#A3A3A3"
                      style={[styles.addonInput, webTextInputReset]}
                      value={verificationCode}
                    />
                    <Pressable
                      disabled={!canVerifyCode}
                      onPress={handleVerifyCode}
                      style={styles.codeButton}>
                      <Text style={[styles.codeButtonText, !canVerifyCode && styles.disabledText]}>
                        {isVerifyingCode ? '확인중' : '확인'}
                      </Text>
                    </Pressable>
                  </View>
                  {codeMessage ? (
                    <Text style={styles.errorText}>{codeMessage}</Text>
                  ) : (
                    <Text style={styles.helperText}>메일로 받은 6자리 인증번호를 입력해주세요.</Text>
                  )}
                </View>

                <View style={styles.successBox}>
                  <MaterialIcons color="#15803D" name="mark-email-read" size={18} />
                  <Text style={styles.successBoxText}>
                    회원가입 요청이 완료되었습니다. 이메일 인증 후 로그인할 수 있습니다.
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.footerLinks}>
            <Text style={styles.footerText}>이미 계정이 있나요?</Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.loginText}>로그인</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({
  isMatched,
  isVisible,
  label,
  message,
  messageTone,
  onChangeText,
  onToggle,
  placeholder,
  showMatchState,
  value,
}: {
  isMatched?: boolean;
  isVisible: boolean;
  label: string;
  message: string;
  messageTone: MessageTone;
  onChangeText: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  showMatchState?: boolean;
  value: string;
}) {
  const [isFocused, setFocused] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordField}>
        <TextInput
          autoCapitalize="none"
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#A3A3A3"
          secureTextEntry={!isVisible}
          style={[
            styles.input,
            styles.passwordInput,
            isFocused && styles.inputFocused,
            showMatchState && (isMatched ? styles.inputSuccess : styles.inputError),
          ]}
          textContentType="password"
          value={value}
        />
        <Pressable
          accessibilityLabel={isVisible ? `${label} 숨기기` : `${label} 보기`}
          onPress={onToggle}
          style={styles.eyeButton}>
          <MaterialIcons color="#777777" name={isVisible ? 'visibility-off' : 'visibility'} size={22} />
        </Pressable>
      </View>
      {message ? (
        <Text style={messageTone === 'success' ? styles.successText : styles.errorText}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    minHeight: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    ...AppTypography.authBrandTitle,
    fontSize: 42,
    lineHeight: 48,
  },
  subtitle: {
    maxWidth: 280,
    ...AppTypography.bodySecondary,
    color: AppColors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    marginTop: 42,
    gap: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    ...AppTypography.caption,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  input: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 18,
    color: '#191C1D',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#BA1A1A',
    backgroundColor: '#FFF8F7',
  },
  inputSuccess: {
    borderColor: '#15803D',
    backgroundColor: '#F7FEF9',
  },
  inputFocused: {
    borderColor: '#191C1D',
  },
  inputWithAddon: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    overflow: 'hidden',
  },
  addonInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 18,
    paddingRight: 12,
    color: '#191C1D',
    fontSize: 16,
    outlineWidth: 0,
  },
  codeButton: {
    width: 72,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeButtonText: {
    color: '#2563EB',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  disabledText: {
    color: '#A3A3A3',
  },
  passwordField: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 54,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    width: 54,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  successText: {
    color: '#15803D',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  formMessage: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F7',
  },
  formMessageText: {
    flex: 1,
    color: '#BA1A1A',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  helperText: {
    color: '#525252',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  successBox: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7FEF9',
  },
  successBoxText: {
    flex: 1,
    color: '#15803D',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    height: 62,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D9DADB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
  },
  primaryButtonTextDisabled: {
    color: '#777777',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
  },
  footerText: {
    color: '#474747',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  loginText: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
});
