# Codebase Structure (`STRUCTURE.md`)

## Root Configuration
- `package.json`: Monorepo workspaces and orchestration.
- `turbo.json`: Build pipeline and cache configuration.
- `tsconfig.json`: Base TypeScript configuration.
- `.planning/`: GSD workflow documentation and state.

## Applications (`apps/`)

### [web](d:\Codes\route-pulse\apps\web)
- **Framework**: Next.js 16 (App Router)
- `src/app/`: File-based routing (pages, layouts, and sub-components).
- `src/components/`: Shared UI components (integrates HeroUI).
- `src/hooks/`: Custom React hooks for data fetching and realtime.
- `src/store/`: Frontend state management (Zustand).
- `src/utils/`: Helper functions and tRPC client setup.

### [server](d:\Codes\route-pulse\apps\server)
- **Framework**: Express API
- `src/index.ts`: Application entry point and middleware configuration.
- `.env`: Backend-specific environment variables.

## Shared Packages (`packages/`)

### [api](d:\Codes\route-pulse\packages\api)
- `src/context.ts`: Shared tRPC context and auth.
- `src/routers/`: tRPC router definitions (modularized).
- `src/repositories/`: Data access layer for decoupling business logic from Prisma.
- `src/services/`: Core business logic and external integrations.

### [db](d:\Codes\route-pulse\packages\db)
- `schema.prisma`: Unified database schema.
- `migrations/`: Database versioning scripts.
- `scripts/`: Data seeding and utility scripts.

### [env](d:\Codes\route-pulse\packages\env)
- `src/server.ts`: Server-side environment variable validation (Zod).
- `src/client.ts`: Client-side environment variable validation for Next.js.

### [config](d:\Codes\route-pulse\packages\config)
- Shared ESLint, Prettier, and TypeScript configurations for consistency.
