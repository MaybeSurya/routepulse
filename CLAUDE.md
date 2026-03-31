# route-pulse

This file provides context about the project for AI assistants.

## Project Overview

- **Ecosystem**: Typescript

## Tech Stack

- **Runtime**: node
- **Package Manager**: npm

### Frontend

- Framework: next
- CSS: tailwind
- UI Library: nextui
- State: zustand

### Backend

- Framework: express
- API: trpc
- Validation: zod

### Database

- Database: postgres
- ORM: prisma

### Additional Features

- Testing: vitest-playwright
- Email: mailgun
- Job Queue: bullmq
- Caching: upstash-redis
- Logging: winston
- Observability: sentry

## Project Structure

```
route-pulse/
├── apps/
│   ├── web/         # Frontend application
│   └── server/      # Backend API
├── packages/
│   ├── api/         # API layer
│   └── db/          # Database schema
```

## Common Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open database UI

## Maintenance

Keep CLAUDE.md updated when:

- Adding/removing dependencies
- Changing project structure
- Adding new features or services
- Modifying build/dev workflows

AI assistants should suggest updates to this file when they notice relevant changes.
