# smoo-app

`smoo-app`은 Expo Router 기반 React Native 프론트엔드와 Spring Boot 백엔드를 함께 관리하는 모노레포입니다.

이번 버전은 mock 기반 화면 구성을 종료하고, 실제 API와 Supabase PostgreSQL을 기준으로 앱 기능을 연결한 develop 기준 최종 정리본입니다.

## 현재 기준

```text
Expo App
  -> Supabase Auth session
  -> Spring Boot API
  -> Supabase PostgreSQL
```

- 앱 첫 진입 화면은 로그인 화면입니다.
- 로그인 이후 탭 화면은 세션이 있을 때만 접근합니다.
- 프론트엔드는 Supabase Auth 세션과 access token을 보관하고, 업무 데이터는 Spring Boot API로 요청합니다.
- Spring Boot는 인증된 사용자 기준으로 홈, 메모, 체크리스트, 캘린더, 가계부, 설정 API를 처리합니다.
- Supabase PostgreSQL은 실제 서비스 데이터 저장소로 사용합니다.
- mock 데이터 파일은 제거되었고, 화면 기능은 API 연결을 기준으로 동작합니다.

## 구현된 기능

### 인증

- 로그인 화면을 앱 기본 진입점으로 구성
- 회원가입/로그인 API 연결
- 세션 저장 및 만료 세션 차단
- 보호 탭 접근 시 세션 확인 후 `/login`으로 리다이렉트

### 홈

- 홈 대시보드 API 연결
- 위젯 조회, 추가, 삭제, 정렬 API 연결
- 위젯 중복 추가 방지
- 캘린더, 할 일, 메모, 가계부 위젯 데이터 API 기반 표시

### 메모

- 메모 목록 조회 API 연결
- 메모 생성, 수정, 삭제 API 연결
- 메모 카테고리 조회 및 생성 API 연결
- 기존 mock 메모 데이터 제거

### 체크리스트

- 날짜별 할 일 조회 API 연결
- 할 일 생성, 수정, 삭제 API 연결
- 완료/미완료 상태 변경 API 연결
- 할 일 정렬 API 연결
- 카테고리 조회, 생성, 삭제 API 연결
- 기존 mock 체크리스트 데이터 제거

### 캘린더

- 일정 조회, 생성, 수정, 삭제 API 연결
- 종일 일정, 카테고리 이름, 카테고리 색상 필드 반영
- 기존 mock 캘린더 데이터 제거

### 가계부

- 월별 거래 조회 API 연결
- 날짜별 거래 조회 API 연결
- 잔액 요약 API 연결
- 거래 생성, 수정, 삭제 API 연결
- 카테고리 조회 및 생성 API 연결
- 결제수단 조회 API 연결
- 반복규칙 생성 API 연결
- 거래 목록 항목 선택 시 수정 모달 연결
- 기존 mock 가계부 데이터 제거

### 설정

- 프로필 조회 및 수정 API 연결
- 환경설정 조회 및 수정 API 연결
- 푸시 설정 조회 및 수정 API 연결
- 로그아웃 및 회원 탈퇴 요청 흐름 연결

## 백엔드 기준

- Java 17
- Spring Boot
- Gradle Wrapper
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Actuator

업무 API는 인증된 사용자만 접근할 수 있습니다. 인증 없이 홈, 메모, 체크리스트, 캘린더, 가계부, 설정, 프로필 API에 접근하면 차단됩니다.

허용되는 공개 API 범위:

- CORS preflight
- 인증 API
- 테스트 API
- Swagger 문서

## Supabase DB 기준

Supabase PostgreSQL을 실제 DB로 사용합니다.

반영된 주요 DB 기준:

- `schedules`
  - `is_all_day`
  - `category_name`
  - `category_color`
- `user_preferences`
  - 푸시 설정 컬럼 기본값 및 NOT NULL 기준
- FK 성능 인덱스
  - 가계부 거래 관련 FK
  - 메모 카테고리 FK
  - 할 일 카테고리 FK

프론트엔드는 업무 테이블을 Supabase에 직접 요청하지 않습니다. 업무 데이터는 Spring Boot API를 통해 접근합니다.

## Docker 기준

Docker는 백엔드 실행 환경을 기준으로 사용합니다.

```cmd
docker compose up --build
```

프론트엔드는 로컬에서 별도로 실행합니다.

```cmd
cd frontend
npm install
npm run web
```

백엔드 로컬 실행:

```cmd
cd backend
gradlew.bat bootRun
```

백엔드 로컬 설정은 아래 파일을 사용합니다.

```text
backend/src/main/resources/application-local.yaml
```

이 파일에는 실제 DB 접속 정보가 들어가므로 GitHub에 올리지 않습니다. 공유용 예시는 아래 파일을 기준으로 합니다.

```text
backend/src/main/resources/application-local.example.yaml
```

Supabase 원격 DB를 사용하는 개발 환경을 고려해 Hikari pool은 낮은 값으로 설정되어 있습니다.

## 검증 명령

프론트엔드:

```cmd
cd frontend
npm run lint
npx tsc --noEmit
```

백엔드:

```cmd
cd backend
gradlew.bat test
```

이번 기준에서 확인된 검증:

- `npm run lint`
- `npx tsc --noEmit`
- `gradlew.bat test`

## 남은 관리 항목

이번 버전은 develop 기준 기능 연결을 고정하기 위한 마지막 정리본입니다. 다만 아래 항목은 후속 이슈로 분리해 관리합니다.

- 로그인 기반 전체 화면 E2E 테스트
- 화면 내 한국어 문구 깨짐 정리
- 공통 loading/error/401 UX 정리
- 캘린더 카테고리 생성 API 고도화
- 가계부 반복규칙 기반 반복 거래 자동 생성 정책 수립

## 병합 기준

현재 develop 기준은 아래 정책을 따릅니다.

- mock 데이터로 기능을 되돌리지 않습니다.
- 프론트에서 업무 데이터를 Supabase에 직접 요청하지 않습니다.
- 신규 기능은 Spring Boot API와 Supabase DB 스키마 기준을 함께 맞춥니다.
- 인증 사용자 식별은 백엔드 보안 계층에서 처리합니다.
- 기존 화면 기능을 삭제하는 PR은 develop에 바로 병합하지 않습니다.

이 README는 현재 develop 브랜치의 API 기반 전환 완료 기준을 설명합니다.
