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

const TEST_ID = 'test';
const TEST_PASSWORD = 'test';

export default function LoginScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordFocused, setPasswordFocused] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState('');

  const trimmedLoginId = loginId.trim();
  const isLoginIdFilled = trimmedLoginId.length > 0;
  const isPasswordFilled = password.length > 0;

  const loginIdError = useMemo(() => {
    if (!isSubmitted && trimmedLoginId.length === 0) {
      return '';
    }

    if (trimmedLoginId.length === 0) {
      return '아이디를 입력해주세요.';
    }

    return '';
  }, [isSubmitted, trimmedLoginId.length]);

  const passwordError = useMemo(() => {
    if (!isSubmitted && password.length === 0) {
      return '';
    }

    return isPasswordFilled ? '' : '비밀번호를 입력해주세요.';
  }, [isPasswordFilled, isSubmitted, password.length]);

  const handleLogin = () => {
    setSubmitted(true);
    setLoginError('');

    if (!isLoginIdFilled || !isPasswordFilled) {
      return;
    }

    if (trimmedLoginId !== TEST_ID || password !== TEST_PASSWORD) {
      setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }

    router.replace('/(tabs)');
  };

  const handleSocialLogin = () => {
    router.replace('/(tabs)');
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
            <Text style={styles.brand}>Zerly</Text>
            <Text style={styles.subtitle}>계정으로 로그인하고 오늘의 기록을 이어가세요.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="username"
                onChangeText={(value) => {
                  setLoginId(value);
                  setLoginError('');
                }}
                placeholder="test"
                placeholderTextColor="#A3A3A3"
                style={[styles.input, loginIdError && styles.inputError]}
                textContentType="username"
                value={loginId}
              />
              {loginIdError ? <Text style={styles.errorText}>{loginIdError}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordField}>
                <TextInput
                  autoCapitalize="none"
                  onBlur={() => setPasswordFocused(false)}
                  onChangeText={(value) => {
                    setPassword(value);
                    setLoginError('');
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!isPasswordVisible}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isPasswordFocused && styles.inputFocused,
                    passwordError && styles.inputError,
                  ]}
                  textContentType="password"
                  value={password}
                />
                <Pressable
                  accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onPress={() => setPasswordVisible((current) => !current)}
                  style={styles.eyeButton}>
                  <MaterialIcons
                    color="#777777"
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={22}
                  />
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {loginError ? (
              <View style={styles.formMessage}>
                <MaterialIcons color="#BA1A1A" name="error-outline" size={18} />
                <Text style={styles.formMessageText}>{loginError}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>로그인</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는 다음으로 계속</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Pressable onPress={handleSocialLogin} style={styles.socialButton}>
                <MaterialIcons color="#191C1D" name="public" size={18} />
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable onPress={handleSocialLogin} style={[styles.socialButton, styles.kakaoButton]}>
                <Text style={styles.kakaoIcon}>K</Text>
                <Text style={styles.kakaoText}>Kakao</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footerLinks}>
            <Pressable>
              <Text style={styles.findText}>아이디/비밀번호 찾기</Text>
            </Pressable>
            <Text style={styles.footerDivider}>|</Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text style={styles.signupText}>회원가입</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.copyright}>© 2026 Smoo Archive System</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingTop: 72,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    gap: 14,
  },
  brand: {
    color: '#000000',
    fontSize: 48,
    lineHeight: 52,
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
    marginTop: 64,
    gap: 24,
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
  input: {
    height: 58,
    borderRadius: 29,
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
  inputFocused: {
    borderColor: '#191C1D',
  },
  passwordField: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 58,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    width: 58,
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
  primaryButton: {
    height: 62,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(198, 198, 198, 0.45)',
  },
  dividerText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  kakaoButton: {
    borderColor: '#FEE500',
    backgroundColor: '#FEE500',
  },
  kakaoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    color: '#FEE500',
    backgroundColor: '#191600',
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  kakaoText: {
    color: '#191600',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  socialText: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 34,
  },
  findText: {
    color: '#474747',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerDivider: {
    color: 'rgba(198, 198, 198, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  signupText: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  copyright: {
    marginTop: 'auto',
    paddingTop: 48,
    color: 'rgba(119, 119, 119, 0.6)',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
