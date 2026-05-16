import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type Href, Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const googleIconUri = 'https://www.figma.com/api/mcp/asset/1b4f3807-6abe-421a-a4ee-013d6f0893b6';

export default function LoginScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.brandSection}>
        <Text style={styles.brand}>Zerly</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>이메일 주소</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="curator@sanctuary.com"
              placeholderTextColor="#A3A3A3"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#777777"
                secureTextEntry
                style={styles.passwordInput}
              />
              <Pressable accessibilityLabel="비밀번호 표시 전환" style={styles.eyeButton}>
                <MaterialIcons color="#777777" name="visibility" size={22} />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.loginButton}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는 다음으로 계속</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Image source={{ uri: googleIconUri }} style={styles.googleIcon} />
            <Text style={styles.socialText}>구글</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <MaterialIcons color="#191C1D" name="apple" size={18} />
            <Text style={styles.socialText}>애플</Text>
          </Pressable>
        </View>

        <View style={styles.footerLinks}>
          <Pressable>
            <Text style={styles.findText}>아이디/비밀번호 찾기</Text>
          </Pressable>
          <Text style={styles.footerDivider}>|</Text>
          <Link href={'/signup' as Href} asChild>
            <Pressable>
              <Text style={styles.signupText}>회원가입</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Text style={styles.copyright}>© 2026 스무 아카이브 시스템</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: 113,
  },
  brand: {
    color: '#000000',
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  form: {
    marginTop: 76,
    gap: 32,
  },
  fields: {
    gap: 24,
  },
  fieldGroup: {
    gap: 12,
  },
  label: {
    color: '#474747',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 2.4,
  },
  input: {
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    color: '#191C1D',
    fontSize: 16,
  },
  passwordInputWrap: {
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 16,
    paddingRight: 8,
    color: '#191C1D',
    fontSize: 16,
  },
  eyeButton: {
    width: 58,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(198, 198, 198, 0.2)',
  },
  dividerText: {
    color: '#777777',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  socialText: {
    color: '#191C1D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  findText: {
    color: '#474747',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  footerDivider: {
    color: 'rgba(198, 198, 198, 0.4)',
    fontSize: 16,
    lineHeight: 24,
  },
  signupText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  copyright: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 81,
    color: 'rgba(119, 119, 119, 0.6)',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
  },
});
