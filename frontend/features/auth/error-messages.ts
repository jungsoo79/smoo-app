const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_CONFIRMED: '이메일 인증 후 로그인해주세요.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다.',
};

const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  WEAK_PASSWORD: '비밀번호 정책을 확인해주세요.',
  EMAIL_RATE_LIMIT: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  SIGNUP_FAILED: '회원가입에 실패했습니다.',
};

const PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
  WEAK_PASSWORD: '비밀번호 정책을 확인해주세요.',
  PASSWORD_CONFIRM_MISMATCH: '새 비밀번호가 서로 일치하지 않습니다.',
  PASSWORD_UPDATE_FAILED: '비밀번호 변경에 실패했습니다.',
};

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  OTP_EXPIRED: '인증번호가 만료되었습니다. 회원가입을 다시 요청해주세요.',
  OTP_INVALID: '인증번호가 올바르지 않습니다.',
  VERIFY_FAILED: '이메일 인증에 실패했습니다. 잠시 후 다시 시도해주세요.',
};

export function getLoginErrorMessage(code: string) {
  return LOGIN_ERROR_MESSAGES[code] ?? LOGIN_ERROR_MESSAGES.LOGIN_FAILED;
}

export function getSignupErrorMessage(code: string) {
  return SIGNUP_ERROR_MESSAGES[code] ?? SIGNUP_ERROR_MESSAGES.SIGNUP_FAILED;
}

export function getPasswordErrorMessage(code: string) {
  return PASSWORD_ERROR_MESSAGES[code] ?? PASSWORD_ERROR_MESSAGES.PASSWORD_UPDATE_FAILED;
}

export function getVerifyErrorMessage(code: string) {
  return VERIFY_ERROR_MESSAGES[code] ?? VERIFY_ERROR_MESSAGES.VERIFY_FAILED;
}
