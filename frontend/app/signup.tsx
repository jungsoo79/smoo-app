import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.brandSection}>
        <Text style={styles.title}>회원가입</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>이메일 주소</Text>
            <View style={styles.emailRow}>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="curator@sanctuary.com"
                placeholderTextColor="#777777"
                style={[styles.input, styles.emailInput]}
              />
              <Pressable style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>인증하기</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>인증번호 6자리</Text>
            <View style={styles.inputWithAddon}>
              <TextInput
                keyboardType="number-pad"
                placeholder="123455"
                placeholderTextColor="#777777"
                style={styles.addonInput}
              />
              <Text style={styles.timerText}>3:00</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#777777"
              secureTextEntry
              style={styles.compactInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#777777"
              secureTextEntry
              style={[styles.compactInput, styles.errorInput]}
            />
            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput placeholder="hi1234" placeholderTextColor="#000000" style={styles.compactInput} />
          </View>
        </View>

        <Pressable style={styles.signupButton}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </Pressable>
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
    paddingTop: 92,
  },
  title: {
    color: '#000000',
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  form: {
    marginTop: 54,
    gap: 125,
  },
  fields: {
    gap: 16,
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
  emailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    height: 49,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    color: '#191C1D',
    fontSize: 16,
  },
  emailInput: {
    flex: 1,
  },
  verifyButton: {
    width: 90,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#000000',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  inputWithAddon: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  addonInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 16,
    paddingRight: 12,
    color: '#191C1D',
    fontSize: 16,
  },
  timerText: {
    width: 58,
    color: '#578CFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  compactInput: {
    height: 49,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    color: '#191C1D',
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#CE1E1E',
  },
  errorText: {
    color: '#CE1E1E',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
  },
  signupButton: {
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
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  copyright: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 32,
    color: 'rgba(119, 119, 119, 0.6)',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 3,
    textAlign: 'center',
  },
});
