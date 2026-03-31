# Technical Concerns (`CONCERNS.md`)

## Build & Dependencies
- **Mapbox v8 Migration**: The transition to `react-map-gl` v8 with Next.js 16 (Turbopack) requires explicit subpath imports (`react-map-gl/mapbox`) and `transpilePackages` in `next.config.ts`.
- **Dependency Hoisting**: Monorepo hoisting occasionally leads to "Module not found" errors in `apps/web`. The Current strategy uses `transpilePackages` for shared modules.

## Infrastructure
- **Realtime Throughput**: High-frequency bus coordinate updates via Supabase/Upstash must be handled with care to avoid connection pooling issues or rate limits.
- **Worker Implementations**: `apps/server/src/lib/workers.ts` currently contains TODOs for full email and notification logic, suggesting asynchronous processing is still in early stages.

## Security
- **JWT Lifespan**: Current access tokens are used for session management. A robust refresh token flow is implemented but should be audited for edge case connectivity issues.
- **Environment Safety**: While `@route-pulse/env` validates variables, some development secrets are manually managed in `.env` files; transition to a central secret manager may be required for production scaling.

## Reliability
- **Booking State Machine**: Seat booking status (`pending` -> `confirmed` -> `released`) involves multiple database writes. Transaction integrity must be strictly enforced.
- **E2E Stability**: Playwright tests for map interaction can be flaky due to external Mapbox tile loading; consider using static tile mocks for CI.
