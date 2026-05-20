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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signup } from '@/features/auth/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setCodeSent] = useState(false);
  const [isCodeVerified, setCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [isSigningUp, setSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');

  const trimmedEmail = email.trim();
  const trimmedNickname = nickname.trim();
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isPasswordStrong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const isPasswordConfirmTouched = passwordConfirm.length > 0;
  const isPasswordMatched = isPasswordConfirmTouched && password === passwordConfirm;
  const isNicknameValid = trimmedNickname.length >= 2;
  const canSubmit = isEmailValid && isCodeVerified && isPasswordStrong && isPasswordMatched && isNicknameValid;

  const emailMessage = useMemo(() => {
    if (!isSubmitted && trimmedEmail.length === 0) {
      return '';
    }

    if (trimmedEmail.length === 0) {
      return '이메일 주소를 입력해주세요.';
    }

    return isEmailValid ? '' : '올바른 이메일 형식이 아닙니다.';
  }, [isEmailValid, isSubmitted, trimmedEmail.length]);

  const codeMessage = useMemo(() => {
    if (isCodeVerified) {
      return '이메일 형식 확인이 완료되었습니다.';
    }

    if (!isCodeSent) {
      return '';
    }

    if (verificationCode.length === 0) {
      return '인증번호를 입력해주세요.';
    }

    if (verificationCode.length < 6) {
      return '인증번호 6자리를 입력해주세요.';
    }

    return '';
  }, [isCodeSent, isCodeVerified, verificationCode.length]);

  const passwordMessage = useMemo(() => {
    if (!isSubmitted && password.length === 0) {
      return '';
    }

    if (password.length === 0) {
      return '비밀번호를 입력해주세요.';
    }

    return isPasswordStrong ? '사용 가능한 비밀번호입니다.' : '영문과 숫자를 포함해 8자 이상 입력해주세요.';
  }, [isPasswordStrong, isSubmitted, password.length]);

  const confirmMessage = useMemo(() => {
    if (!isSubmitted && passwordConfirm.length === 0) {
      return '';
    }

    if (passwordConfirm.length === 0) {
      return '비밀번호를 한 번 더 입력해주세요.';
    }

    return isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.';
  }, [isPasswordMatched, isSubmitted, passwordConfirm.length]);

  const nicknameMessage = useMemo(() => {
    if (!isSubmitted && trimmedNickname.length === 0) {
      return '';
    }

    if (trimmedNickname.length === 0) {
      return '닉네임을 입력해주세요.';
    }

    return isNicknameValid ? '' : '닉네임은 2자 이상 입력해주세요.';
  }, [isNicknameValid, isSubmitted, trimmedNickname.length]);

  const handleSendCode = () => {
    setSubmitted(true);
    setSignupError('');

    if (!isEmailValid) {
      setCodeSent(false);
      setCodeVerified(false);
      return;
    }

    setCodeSent(true);
    setCodeVerified(true);
    setVerificationCode('');
  };

  const handleVerifyCode = () => {
    if (!isCodeSent) {
      return;
    }

    setCodeVerified(true);
  };

  const handleSignup = async () => {
    setSubmitted(true);
    setSignupError('');

    if (!canSubmit) {
      return;
    }

    try {
      setSigningUp(true);
      await signup(trimmedEmail, password);
      router.replace('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SIGNUP_FAILED';

      if (message === 'EMAIL_ALREADY_EXISTS') {
        setSignupError('이미 가입된 이메일입니다.');
      } else if (message === 'WEAK_PASSWORD') {
        setSignupError('비밀번호가 너무 약합니다.');
      } else if (message === 'EMAIL_RATE_LIMIT') {
        setSignupError('이메일 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setSignupError('회원가입에 실패했습니다.');
      }
    } finally {
      setSigningUp(false);
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
            <Text style={styles.subtitle}>이메일 인증 후 Zerly 계정을 만들 수 있습니다.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이메일 주소</Text>
              <View style={styles.emailRow}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setCodeSent(false);
                    setCodeVerified(false);
                    setVerificationCode('');
                    setSignupError('');
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#A3A3A3"
                  style={[styles.input, styles.emailInput, emailMessage && styles.inputError]}
                  textContentType="emailAddress"
                  value={email}
                />
                <Pressable
                  onPress={handleSendCode}
                  style={[styles.verifyButton, !isEmailValid && styles.secondaryButton]}>
                  <Text style={[styles.verifyButtonText, !isEmailValid && styles.secondaryButtonText]}>
                    인증
                  </Text>
                </Pressable>
              </View>
              {emailMessage ? <Text style={styles.errorText}>{emailMessage}</Text> : null}
              {isCodeVerified ? (
                <Text style={styles.helperText}>회원가입 요청 시 이메일 인증 메일이 발송될 수 있습니다.</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>인증번호</Text>
              <View
                style={[
                  styles.inputWithAddon,
                  isCodeVerified && styles.inputSuccess,
                  codeMessage && !isCodeVerified && verificationCode.length >= 6 && styles.inputError,
                ]}>
                <TextInput
                  editable={isCodeSent && !isCodeVerified}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={(value) => {
                    setVerificationCode(value);
                    setCodeVerified(false);
                  }}
                  placeholder="6자리 입력"
                  placeholderTextColor="#A3A3A3"
                  style={styles.addonInput}
                  value={verificationCode}
                />
                <Pressable disabled={!isCodeSent || isCodeVerified} onPress={handleVerifyCode} style={styles.codeButton}>
                  <Text style={[styles.codeButtonText, (!isCodeSent || isCodeVerified) && styles.disabledText]}>
                    확인
                  </Text>
                </Pressable>
              </View>
              {codeMessage ? (
                <Text style={isCodeVerified ? styles.successText : styles.errorText}>{codeMessage}</Text>
              ) : null}
            </View>

            <PasswordField
              isVisible={isPasswordVisible}
              label="비밀번호"
              message={passwordMessage}
              messageTone={isPasswordStrong ? 'success' : 'error'}
              onChangeText={setPassword}
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
              onChangeText={setPasswordConfirm}
              onToggle={() => setConfirmVisible((current) => !current)}
              placeholder="비밀번호 재입력"
              showMatchState={isPasswordConfirmTouched || isSubmitted}
              value={passwordConfirm}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => {
                  setNickname(value);
                  setSignupError('');
                }}
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
              style={[styles.primaryButton, (!canSubmit || isSigningUp) && styles.primaryButtonDisabled]}>
              <Text style={[styles.primaryButtonText, (!canSubmit || isSigningUp) && styles.primaryButtonTextDisabled]}>
                {isSigningUp ? '회원가입 중...' : '회원가입'}
              </Text>
            </Pressable>
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
  messageTone: 'error' | 'success';
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
    color: '#000000',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
  },
  subtitle: {
    maxWidth: 280,
    color: 'rgba(71, 71, 71, 0.68)',
    fontSize: 15,
    lineHeight: 22,
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
    color: '#474747',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    gap: 10,
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
  emailInput: {
    flex: 1,
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
  verifyButton: {
    width: 76,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#000000',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E7E8E9',
  },
  secondaryButtonText: {
    color: '#777777',
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
  },
  codeButton: {
    width: 58,
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
