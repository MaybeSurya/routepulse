# Testing Strategy (`TESTING.md`)

## Testing Frameworks
RoutePulse uses a comprehensive testing suite for both unit and end-to-end (E2E) verification.

### [Vitest](https://vitest.dev/)
- **Unit & Integration Testing**: Fast, concurrent test runner for both `web` and `api` logic.
- **Coverage**: Configured via `@vitest/coverage-v8`.
- **Target Areas**: Services, Repositories, Reducer logic, and Utils.

### [Playwright](https://playwright.dev/)
- **E2E Testing**: High-fidelity browser testing for the `web` application and its integration with the `server`.
- **Devices**: Configured for Desktop Chrome, Firefox, and Mobile Safari.
- **Integration**: Verifies login flows, map rendering, and bus tracking updates.

## Testing Locations
- **Apps**: `apps/web/src/__tests__` and `apps/web/e2e/`.
- **API**: `packages/api/src/__tests__`.
- **DB**: `packages/db/src/__tests__` for migration safety and seed verification.

## Conventions
- **Naming**: `*.test.ts` or `*.spec.ts`.
- **Mocking**: Use `vitest.mock` for external services (Email, S3).
- **Snapshot Testing**: Used selectively for stable UI components.
