# Project State (`STATE.md`)

## Current Milestone: 0.1.0-alpha
**Status**: [INITIALIZING]
**Goal**: Baseline stabilization and monorepo structure.

## Active Phase: 1 (Foundation & Stabilization)
*Phase Objective: Standardizing types, resolving Mapbox v8 migration, and verifying auth.*

- [x] **Project Scoping**: Define value and audience (`PROJECT.md`).
- [x] **Requirements Extraction**: Draft essential and secondary features (`REQUIREMENTS.md`).
- [x] **Phased Roadmap**: Outline execution steps into a 4-phase sequence (`ROADMAP.md`).
- [ ] **Codebase Map Verification**: Commit initial mapping to `.planning/codebase/`.
- [ ] **Stabilization Work**: Resolve Mapbox resolution and tRPC type guards.

## Completed Items
- ✓ [Codebase Mapping] Generated tech stack, architecture, structure, and convention maps.
- ✓ [Planning Init] Created `.planning/` directory and root documents.

## Working Files
- `apps/web/next.config.ts` (Mapbox transpilation)
- `apps/web/src/components/MapComponent.tsx` (Mapbox GL JS v8)
- `packages/api/src/routers/auth.ts` (tRPC protected procedures)
- `packages/db/schema.prisma` (Shared data models)

## Open Risks
- [Mapbox v8 Migration] Complexity with Next.js 16 (Turbopack) resolution could lead to build failures in CI.
- [Realtime Load] Supabase/Upstash connection pooling could become a bottleneck under high-frequency bus location updates.
- [Test Gaps] E2E coverage for seat booking is currently low.
