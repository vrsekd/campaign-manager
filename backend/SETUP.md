# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm run backend:install
```

Or directly from the backend directory:

```bash
cd backend
npm install
```

### 2. Setup Database

Generate Prisma client and create the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Or use the combined setup command:

```bash
npm run db:setup
```

### 3. Run the Backend Server

Development mode with hot reload:

```bash
# From project root
npm run backend:dev

# Or from backend directory
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

## Verify Installation

Check if the server is running:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-11T19:00:00.000Z"
}
```

## Testing the API

### Create a Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "description": "My first campaign",
    "status": "draft",
    "budget": 5000
  }'
```

### List All Campaigns

```bash
curl http://localhost:3001/api/campaigns
```

### Get Single Campaign

```bash
curl http://localhost:3001/api/campaigns/{campaign-id}
```

### Update Campaign

```bash
curl -X PUT http://localhost:3001/api/campaigns/{campaign-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Delete Campaign

```bash
curl -X DELETE http://localhost:3001/api/campaigns/{campaign-id}
```

## Environment Configuration

Create a `.env` file in the backend directory (optional):

```env
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
```

## Production Build

Build TypeScript to JavaScript:

```bash
# From project root
npm run backend:build

# Or from backend directory
cd backend
npm run build
```

Start production server:

```bash
# From project root
npm run backend:start

# Or from backend directory
cd backend
npm start
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, either:

1. Stop the process using that port
2. Change the port in `.env` file

### Prisma Client Not Generated

```bash
cd backend
npm run prisma:generate
```

### Database Issues

The backend's SQLite database is located at `backend/prisma/dev.sqlite`. If you need to reset:

```bash
cd backend
npx prisma migrate reset
```

To view your database with Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

## Project Structure

```
backend/
├── server.ts              # Main Fastify server
├── routes/
│   └── campaigns.ts       # Campaign CRUD endpoints
├── package.json           # Backend dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # API documentation
```
