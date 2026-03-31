# Tech Stack (`STACK.md`)

## Core Technologies
- **Languages**: TypeScript (v5.0+)
- **Monorepo Management**: [Turbo](https://turbo.build/) with NPM Workspaces
- **Runtime**: Node.js (LTS), Bun (for optimized server compilation)

## Frontend (`apps/web`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: React 19
- **UI Framework**: [HeroUI](https://heroui.com/) (formerly NextUI)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Framer Motion, Lucide React
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Data Fetching**: [tRPC v11 Client](https://trpc.io/), [TanStack Query v5](https://tanstack.com/query/v5)

## Backend (`apps/server`)
- **Framework**: [Express v5](https://expressjs.com/)
- **API Protocol**: [tRPC v11](https://trpc.io/)
- **Security**: [Helmet](https://helmetjs.github.io/), Express Rate Limit
- **Build Tools**: [tsdown](https://github.com/egoist/tsdown), [tsx](https://tsx.is/)

## Data & Infrastructure
- **Database (ORM)**: [Prisma v7](https://www.prisma.io/)
- **Primary Database**: [PostgreSQL](https://www.postgresql.org/) (hosted via [Supabase](https://supabase.com/))
- **Caching & Queues**: [Upstash Redis](https://upstash.com/), [BullMQ](https://docs.bullmq.io/)
- **Cloud Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (via AWS SDK v3)
- **Email**: [Mailgun](https://www.mailgun.com/)
- **Monitoring**: [Sentry](https://sentry.io/)

## Quality & Tooling
- **Validation**: [Zod v4](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)
- **Linting/Formatting**: ESLint, Prettier (shared via `@route-pulse/config`)
