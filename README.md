# smoo-app

`smoo-app` is a monorepo with an Expo frontend and a Spring Boot backend.

## Structure

```text
smoo-app/
  frontend/   Expo app
  backend/    Spring Boot app
```

## Required Versions

- Node.js: `20.x`
- Java: `17`
- Docker Desktop: latest stable

## Frontend

Run from [frontend](C:\Users\park2\GitHub\smoo-app\frontend):

```cmd
npx expo start
```

## Backend

Run from [backend](C:\Users\park2\GitHub\smoo-app\backend):

```cmd
gradlew.bat bootRun
```

Health check:

- [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Backend Configuration

- [application.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application.yaml): shared settings committed to Git
- [application-local.example.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application-local.example.yaml): copy template for local setup
- [application-local.yaml](C:\Users\park2\GitHub\smoo-app\backend\src\main\resources\application-local.yaml): local-only settings, do not commit
- [backend/.env.example](C:\Users\park2\GitHub\smoo-app\backend\.env.example): example values for team onboarding

Supabase is used as the external PostgreSQL database. Do not commit real database passwords or service keys.

Create your local backend config by copying the example file:

```cmd
copy backend\src\main\resources\application-local.example.yaml backend\src\main\resources\application-local.yaml
```

## Docker

Run from the repository root [smoo-app](C:\Users\park2\GitHub\smoo-app):

```cmd
docker compose up --build
```

This starts the backend container on port `8080`.

## Notes

- Open IntelliJ from the repository root when working across frontend and backend.
- Run Gradle commands from [backend](C:\Users\park2\GitHub\smoo-app\backend).
- Keep `service_role` keys on the backend side only.
