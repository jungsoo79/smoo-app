# smoo-app

`smoo-app`은 Expo Router 기반 React Native 프론트엔드와 Spring Boot 백엔드를 함께 관리하는 모노레포입니다.

## 백엔드 구성 계획

목표 구조는 아래와 같습니다.

```text
Expo 앱
  -> Supabase Auth
  -> Spring Boot API
  -> Supabase PostgreSQL
```

- Supabase는 이메일 로그인, Google 로그인, Kakao 로그인, 세션 발급을 담당합니다.
- Spring Boot는 앱 기능 API를 담당합니다.
- Supabase PostgreSQL은 실제 데이터 저장소로 사용합니다.
- 프론트는 로그인 후 Supabase access token을 Spring Boot API에 전달하는 방향으로 설계합니다.

## 역할 분리

프론트엔드가 Supabase에 직접 요청하는 범위:

```text
signUp
signIn
signOut
session/access token 조회
```

Spring Boot API가 담당할 범위:

```text
사용자 프로필
메모
체크리스트
가계부
캘린더
통계/집계
외부 API 연동
```

## Docker 개발 계획

- 개발 중 Docker는 Spring Boot 백엔드 실행에 사용합니다.
- Expo 프론트엔드는 Docker에 넣지 않고 로컬에서 실행합니다.
- 개발 DB는 로컬 Postgres를 새로 띄우지 않고, 이미 생성된 Supabase 원격 DB를 사용합니다.
- 루트의 `docker-compose.yml`은 백엔드 컨테이너 실행 진입점으로 유지합니다.

예상 실행 흐름:

```cmd
docker compose up --build
```

프론트엔드는 별도 터미널에서 실행합니다.

```cmd
cd frontend
npm run web
```

## 이후 구현 순서

1. Supabase Auth provider 설정을 먼저 완료합니다.
2. Supabase DB 테이블 설계를 확정합니다.
3. Spring Boot에서 Supabase JWT 검증 방식을 정합니다.
4. 첫 API는 `users/me`로 시작합니다.
5. 그 다음 `memos`, `checklist`, `ledger`, `calendar` 순서로 확장합니다.

## 현재 상태

아직 테이블과 실제 Spring Boot API 구현은 진행하지 않았습니다. 이 문서는 백엔드 방향을 맞추기 위한 계획 문서입니다.
