# RoutePulse Project Context (`PROJECT.md`)

## What This is
**RoutePulse** is a mission-critical campus transit management system designed for the United International University (UIU) community. It orchestrates real-time bus tracking, automated seat booking, and fleet coordination between drivers, students, and administrators.

## Core Value
To eliminate the uncertainty of campus commuting by providing reliable, real-time visibility into the bus fleet and ensuring fair, automated seat allocation for students.

## Primary Audience
- **Students**: UIU commuters who need to find buses, check arrivals, and book seats.
- **Drivers**: Fleet operators who need to report status, follow routes, and manage passenger loads.
- **Admins**: University staff who manage users, monitor the fleet, and resolve complaints.

## Success Criteria (Current Milestone)
- **Backend Stability**: 100% type-safe tRPC API and solid Prisma data access patterns.
- **Map Reliability**: Seamless transition to Mapbox GL JS v3 with correct Next.js 16 (Turbopack) resolution.
- **Realtime Accuracy**: Consistent, low-latency GPS updates from drivers to students.
- **Booking Integrity**: Zero "ghost" bookings or over-allocated seats via atomic transactions.

---

## Requirements

### Validated
- ✓ [Auth] Driver/Student/Admin login via JWT.
- ✓ [Core UI] Next.js 16 + HeroUI (NextUI) dashboard layouts.
- ✓ [Monorepo] Turbo + NPM Workspaces config.
- ✓ [DB Schema] Prisma schema with Bus, Route, Student, and Booking models.

### Active (High Priority)
- [ ] [Mapbox v8] Finalize hydration and performance for `MapComponent`.
- [ ] [Tracking] Reliable state management for "En Route" vs. "Arrived" buses.
- [ ] [Booking] Robust seat selection flow with proximity validation.
- [ ] [Workers] Implementation of background email/notification processing (BullMQ).

### Out of Scope (Current)
- [Native App] Mobile-native applications (building Responsive Web first).
- [Offline Mode] System requires active internet connectivity for real-time tracking.
- [Payments] Subscription billing or fare collection.

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **tRPC v11** | End-to-end type safety between monorepo packages. | — Active |
| **Mapbox GL JS** | Superior performance and customization over Leaflet for transit maps. | — Active |
| **Prisma Repositories** | Decoupling logic for better testability and maintenance. | — Active |
| **Tailwind CSS v4** | Leverage the latest performance improvements and simpler config. | — Active |

---
*Last updated: 2026-03-25 after initialization*
