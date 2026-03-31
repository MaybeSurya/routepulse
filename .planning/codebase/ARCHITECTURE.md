# Architecture (`ARCHITECTURE.md`)

## System Overview
RoutePulse is built as a **Type-Safe Monorepo**, ensuring that backend changes are immediately reflected in the frontend's types via tRPC.

## Layered Architecture
The logic is decoupled into 3 primary layers within `packages/api`:

1.  **Transport/API Layer** (`src/routers/`)
    *   **tRPC Routers**: Define the API surface area and input validation using Zod.
    *   **Context**: Auth and requests are handled here (`src/context.ts`).
2.  **Business Logic Layer** (`src/services/`)
    *   **Services**: Orchestrate operations, handle complex logic, and interact with external providers (Email, Storage).
3.  **Data Access Layer** (`src/repositories/`)
    *   **Repositories**: Encapsulate Prisma queries to keep services clean and make data access patterns reusable.

## Data Flow
- **Request**: `apps/web` (Client) → `apps/server` (Express/tRPC)
- **Validation**: Zod schema validation on input.
- **Logic**: Router calls Service → Service calls Repository.
- **Persistence**: Repository interacts with Prisma Client (`packages/db`).
- **Response**: Typed JSON payload returned to the client.

## Monorepo Strategy
- **Shared Config**: `@route-pulse/config` ensures uniform linting and formatting.
- **Environmental Safety**: `@route-pulse/env` validates all required secrets at startup.
- **Decoupled DB**: `@route-pulse/db` encapsulates the Prisma schema, allowing it to be used by both the server and the web app (for metadata tracking).
