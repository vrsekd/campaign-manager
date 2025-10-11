# Campaign Manager Backend

Fastify backend server providing REST API endpoints for campaign management.

## Features

- ✅ CRUD operations for campaigns
- ✅ SQLite database with Prisma ORM
- ✅ TypeScript support
- ✅ Request validation with Zod
- ✅ CORS enabled
- ✅ Logging with Pino (via Fastify)
- ✅ Graceful shutdown handling

## Installation

From the backend directory:

```bash
npm install
```

## Database Setup

The backend has its own SQLite database and Prisma setup, completely independent from the main app. The database will be created at `backend/prisma/dev.sqlite`.

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Or use the setup script:

```bash
npm run db:setup
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

## Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Campaigns

- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get a single campaign by ID
- `POST /api/campaigns` - Create a new campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Delete a campaign

### Campaign Schema

```typescript
{
  id: string;          // UUID
  name: string;        // Required
  banner?: string;     // Optional banner text/URL
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Example API Calls

### Create Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale 2025",
    "banner": "Hot summer deals - up to 70% off!",
    "status": "draft"
  }'
```

### Get All Campaigns

```bash
curl http://localhost:3001/api/campaigns
```

### Update Campaign

```bash
curl -X PUT http://localhost:3001/api/campaigns/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "startDate": "2025-07-01T00:00:00Z"
  }'
```

### Delete Campaign

```bash
curl -X DELETE http://localhost:3001/api/campaigns/{id}
```

## Environment Variables

Create a `.env` file in the backend directory:

```
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
```
