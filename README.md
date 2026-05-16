# smoo-app

`smoo-app`은 Expo 프론트엔드와 Spring Boot 백엔드를 함께 관리하는 모노레포 프로젝트입니다.

## 프로젝트 구조

```text
smoo-app/
  frontend/   Expo 앱
  backend/    Spring Boot 앱
```

## 필수 버전

- Node.js: `20.x`
- Java: `17`
- Docker Desktop: 최신 안정 버전

## 프론트엔드

[frontend](C:\Users\park2\GitHub\smoo-app\frontend) 경로에서 실행합니다.

```cmd
npx expo start
```

## 백엔드

[backend](C:\Users\park2\GitHub\smoo-app\backend) 경로에서 실행합니다.

```cmd
gradlew.bat bootRun
```

헬스 체크:

- [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## 백엔드 설정 파일

- [application.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application.yaml): Git에 커밋하는 공통 설정 파일
- [application-local.example.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application-local.example.yaml): 로컬 설정 파일 예시 템플릿
- [application-local.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application-local.yaml): 개인 로컬 전용 설정 파일, 커밋 금지
- [backend/.env.example](C:\Users\park2\GitHub\smoo-app\backend\.env.example): 팀원 온보딩용 예시 환경 변수 파일

Supabase를 외부 PostgreSQL 데이터베이스로 사용합니다. 실제 DB 비밀번호나 서비스 키는 Git에 커밋하면 안 됩니다.

예시 파일을 복사해서 로컬 백엔드 설정 파일을 생성합니다.

```cmd
copy backend\src\main\resources\application-local.example.yaml backend\src\main\resources\application-local.yaml
```

## Docker

저장소 루트 [smoo-app](C:\Users\park2\GitHub\smoo-app) 경로에서 실행합니다.

```cmd
docker compose up --build
```

위 명령은 백엔드 컨테이너를 `8080` 포트에서 실행합니다.

## 참고 사항

- 프론트엔드와 백엔드를 함께 작업할 때는 IntelliJ를 저장소 루트에서 여는 것을 권장합니다.
- Gradle 명령은 [backend](C:\Users\park2\GitHub\smoo-app\backend) 경로에서 실행합니다.
- `service_role` 키는 백엔드에서만 사용해야 합니다.
