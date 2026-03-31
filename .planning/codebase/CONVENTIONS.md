# Coding Conventions (`CONVENTIONS.md`)

## General Patterns
- **TypeScript First**: Strict typing and explicit interfaces. All public APIs (tRPC) must have Zod schema validation.
- **Monorepo Workspaces**: Use internal package names (e.g. `@route-pulse/api`) instead of relative paths across workspaces.
- **Atomic Commits**: GSD workflow requires clean, descriptive commit messages and focused code changes.

## Backend (API & Business Logic)
- **Layered Responsibility**: Routers handle requests, Services handle logic, Repositories handle data.
- **Repository Pattern**: Business logic should never call Prisma directly; it should always go through a Repository method.
- **Error Handling**: Use standard tRPC error codes (`INTERNAL_SERVER_ERROR`, `UNAUTHORIZED`, `BAD_REQUEST`).
- **Context Injection**: Use the `Context` object for auth state and request metadata.

## Frontend (React & Next.js)
- **Component Anatomy**: Server Components by default; `"use client"` explicit markers for interactivity.
- **Styling**: Tailwind CSS classes integrated with HeroUI's `classNames` and slots for complex overrides.
- **State Management**: Use Zustand for global UI state; TanStack Query (via tRPC) for data fetching and mutations.
- **Immutability**: Prefer functional updates and avoid direct state mutations.

## Environment & Secrets
- **Zod Validation**: All environment variables must be defined and validated in `packages/env` before the apps can start.
- **SSR Safety**: Use `NEXT_PUBLIC_` prefixes only for values that must be accessible on the client.
