# Integrations (`INTEGRATIONS.md`)

## Project Providers
RoutePulse leverages several best-in-class external services to handle infrastructure and specialized logic.

### [Supabase](https://supabase.com/)
- **PostgreSQL**: Primary database for all application data.
- **Auth (optional)**: Some migration scripts reference `auth` schemas, though the current app uses its own custom JWT system.
- **Realtime**: Used for GPS location tracking of buses and student proximity updates.

### [Mapbox](https://www.mapbox.com/)
- **Map Rendering**: Powering the `MapComponent` with high-density transit maps.
- **Geocoding**: Converting stops and bus coordinates into readable addresses.
- **Navigation**: Calculating route directions and estimated arrival times.

### [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
- **Storage**: S3-compatible bucket for storing student complaints, profile pictures, and driver documents.
- **Access**: Integrated via standard AWS SDK v3.

### [Mailgun](https://www.mailgun.com/)
- **Email Delivery**: Transactional emails for account registration, status notifications, and password resets.

### [Upstash Redis](https://upstash.com/)
- **Caching**: Storing high-frequency bus locations and session data.
- **Rate Limiting**: Protecting tRPC auth endpoints from brute force and DOS.
- **Jobs**: Potentially powering `BullMQ` for asynchronous tasks (e.g. email processing).

### [Sentry](https://sentry.io/)
- **Monitoring**: Error tracking and profiling across both the server and web applications.
