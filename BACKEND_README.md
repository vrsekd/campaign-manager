# Campaign Manager - Fastify Backend

## 🎉 What's Been Created

A complete Fastify backend with CRUD operations for campaign management has been set up:

### ✅ Completed Setup

1. **Prisma Database Schema**
   - Added `Campaign` model with fields: id, name, description, status, startDate, endDate, budget, createdAt, updatedAt
   - Created and applied database migration
   - SQLite database ready to use

2. **Fastify Backend Server**
   - Full REST API with CRUD endpoints
   - Request validation using Zod
   - CORS enabled for frontend integration
   - Proper error handling and logging
   - Graceful shutdown handling

3. **API Endpoints** (all under `/api` prefix)
   - `GET /api/campaigns` - List all campaigns
   - `GET /api/campaigns/:id` - Get single campaign
   - `POST /api/campaigns` - Create new campaign
   - `PUT /api/campaigns/:id` - Update campaign
   - `DELETE /api/campaigns/:id` - Delete campaign
   - `GET /health` - Health check

4. **Frontend Integration**
   - TypeScript API client (`app/services/campaign.client.ts`)
   - Shared types (`backend/types/campaign.ts`)
   - Usage examples and documentation

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

The backend has its own independent SQLite database at `backend/prisma/dev.sqlite`:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 3. Start the Backend Server

```bash
npm run dev
```

Or from the project root:

```bash
npm run backend:dev
```

The server will start on **http://localhost:3001**

### 4. Test the API

Health check:

```bash
curl http://localhost:3001/health
```

Create a campaign:

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale",
    "banner": "Hot summer deals - up to 70% off!",
    "status": "draft"
  }'
```

Get all campaigns:

```bash
curl http://localhost:3001/api/campaigns
```

## 📁 Project Structure

```
/
├── backend/                         # 🎯 Separate backend application
│   ├── server.ts                    # Main Fastify server
│   ├── routes/
│   │   ├── campaigns.ts             # Campaign CRUD routes
│   │   └── health.ts                # Health check route
│   ├── types/
│   │   └── campaign.ts              # Shared TypeScript types
│   ├── prisma/                      # Backend's own Prisma setup
│   │   ├── schema.prisma            # Campaign model schema
│   │   ├── migrations/              # Database migrations
│   │   └── dev.sqlite               # SQLite database file
│   ├── package.json                 # Backend dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── .env                         # Environment variables
│   ├── .gitignore                   # Git ignore rules
│   ├── README.md                    # API documentation
│   ├── SETUP.md                     # Setup instructions
│   └── FRONTEND_INTEGRATION.md      # Frontend integration guide
│
├── app/
│   └── services/
│       └── campaign.client.ts       # Frontend API client
│
├── prisma/                          # Main app's Prisma (for Shopify sessions)
│   ├── schema.prisma                # Session model
│   └── dev.sqlite                   # Main app database
│
└── package.json                     # Root package with backend scripts
```

## 📝 Campaign Schema

```typescript
{
  id: string;              // UUID, auto-generated
  name: string;            // Required
  banner?: string;         // Optional banner text/URL
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: Date;        // ISO datetime string
  endDate?: Date;          // ISO datetime string
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}
```

## 🔧 Available Scripts

From the project root:

```bash
npm run backend:dev      # Start backend in development mode
npm run backend:build    # Build backend for production
npm run backend:start    # Start backend in production mode
npm run backend:install  # Install backend dependencies
```

## 🌐 Frontend Integration

### Using the API Client

```typescript
import { campaignApi } from "~/services/campaign.client";

// Get all campaigns
const campaigns = await campaignApi.getAllCampaigns();

// Get single campaign
const campaign = await campaignApi.getCampaign(id);

// Create campaign
const newCampaign = await campaignApi.createCampaign({
  name: "New Campaign",
  banner: "Amazing deals ahead!",
  status: "draft",
});

// Update campaign
const updated = await campaignApi.updateCampaign(id, {
  status: "active",
});

// Delete campaign
await campaignApi.deleteCampaign(id);
```

See `backend/FRONTEND_INTEGRATION.md` for complete examples including React components.

## 🔒 Environment Variables

Create `.env` in the backend directory (optional):

```env
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
```

## 🧪 Testing the API

### Example API Calls

**Create Campaign:**

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Black Friday Sale",
    "description": "Annual November campaign",
    "status": "draft",
    "budget": 25000,
    "startDate": "2025-11-25T00:00:00Z",
    "endDate": "2025-11-29T23:59:59Z"
  }'
```

**Get All Campaigns:**

```bash
curl http://localhost:3001/api/campaigns
```

**Update Campaign:**

```bash
curl -X PUT http://localhost:3001/api/campaigns/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Delete Campaign:**

```bash
curl -X DELETE http://localhost:3001/api/campaigns/{id}
```

## 🎯 Features

- **Type Safety**: Full TypeScript support with shared types
- **Validation**: Zod schemas for request validation
- **Error Handling**: Proper HTTP status codes and error messages
- **Logging**: Pino logger via Fastify for debugging
- **CORS**: Enabled for cross-origin requests
- **Hot Reload**: Development mode with `tsx watch`
- **Production Ready**: TypeScript compilation for production builds

## 📚 Documentation

- **API Reference**: See `backend/README.md`
- **Setup Guide**: See `backend/SETUP.md`
- **Frontend Integration**: See `backend/FRONTEND_INTEGRATION.md`

## 🐛 Troubleshooting

### Backend won't start

- Check if port 3001 is available
- Ensure dependencies are installed: `npm run backend:install`

### Database errors

- Ensure Prisma is generated: `cd backend && npm run prisma:generate`
- Check database file exists: `backend/prisma/dev.sqlite`
- Recreate database: `cd backend && npm run prisma:migrate`

### CORS errors

- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `backend/server.ts`

## 🚀 Next Steps

1. Start the backend: `npm run backend:dev`
2. Start the frontend: `npm run dev`
3. Use the API client in your React components
4. Build your campaign management UI!

---

**Tech Stack:**

- **Backend**: Fastify 4.x
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod
- **Language**: TypeScript
- **Dev Tools**: tsx (hot reload)
