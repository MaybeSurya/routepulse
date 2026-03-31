# Project Roadmap (`ROADMAP.md`)

## Phase 1: Foundation & Stabilization
*Goal: Ensure baseline stability across the monorepo and API.*

- [ ] **Type Systems**: Finalize Zod validation for all tRPC inputs and Prisma outputs.
- [ ] **Mapbox Migration**: Complete `MapComponent` migration to Mapbox GL JS v8 with Turbopack.
- [ ] **Auth Consolidation**: Standardize JWT tokens and guards across Driver, Student, and Admin.
- [ ] **Infrastructure Check**: Confirm Supabase, Upstash, and R2 connectivity and pooling.

## Phase 2: Fleet Management (Driver App)
*Goal: Accurate, realtime reporting of the bus fleet.*

- [ ] **Driver Portal**: Finalize the "Home" view for reporting status and route tracking.
- [ ] **Bus States**: Consistent state machine for "En Route", "Arrived", and "Broken Down".
- [ ] **Realtime Sync**: Low-latency coordinate updates via Supabase/Upstash.
- [ ] **Trip Logs**: Automatic recording of bus movements for audit.

## Phase 3: Student Experience (Passenger App)
*Goal: Simplified access to finding and booking buses.*

- [ ] **Booking Flow**: Dynamic seat selection with proximity checks and instant confirmation.
- [ ] **Live Map**: Student-facing view with bus locations, ETA, and stop markers.
- [ ] **Profile Customization**: Notifications for bus arrival and booking status.
- [ ] **E2E Coverage**: Playwright tests for the complete "Find -> Book -> Arrive" flow.

## Phase 4: Admin & Resilience
*Goal: Managing the system at scale with high reliability.*

- [ ] **Admin Portal**: User management, fleet oversight, and route configuration tools.
- [ ] **Complaints Handling**: Workflow for reviewing and resolving student reports.
- [ ] **Background Workers**: Deploy BullMQ for email (Mailgun) and notification triggers.
- [ ] **Performance Audit**: Optimize Next.js hydration and cold starts.
