# Requirements (`REQUIREMENTS.md`)

## Core Features (Must-have)
- [ ] **Unified Authentication**: Distinct portals and permissions for Students, Drivers, and Admins.
- [ ] **Realtime Map**: Bus locations and status updates on a performant Mapbox-powered UI.
- [ ] **Fleet Status**: Drivers reporting "En Route", "Arrived", "Departed", "Broken Down".
- [ ] **Route Management**: Admins managing buses, stops, and schedules.
- [ ] **Seat Selection**: Automated student booking of specific seats on buses.
- [ ] **Profile Management**: User identity, university details, and notification preferences.

## Secondary Features (Should-have)
- [ ] **Complaints System**: Reporting issues with drivers, buses, or bookings.
- [ ] **Push Notifications**: Background status alerts for bus arrival or booking confirmation.
- [ ] **Schedule Board**: High-level daily plan for all routes and stops.
- [ ] **Historical Locations**: Tracking bus movement over time for analytics.

## Extended Features (Nice-to-have)
- [ ] **Trip Analytics**: Driver performance, route delay stats, and passenger load heatmaps.
- [ ] **Student Presence**: Proximity-based bus arrival estimation for students at specific stops.
- [ ] **UI Customization**: Dark mode, high-contrast options, and personalized route favorites.

## Technical Non-Functionals (Must-have)
- [ ] **Type Safety**: End-to-end Zod/tRPC/Prisma integration across the monorepo.
- [ ] **Hydration Density**: Low-latency page transitions with Next.js App Router and Turbopack.
- [ ] **Environmental Safety**: Strict validation of system secrets at runtime.
- [ ] **Automated Verification**: Vitest unit tests and Playwright E2E coverage for core flows.
- [ ] **Error Resilience**: Graceful degradation when Mapbox or Supabase are intermittent.
