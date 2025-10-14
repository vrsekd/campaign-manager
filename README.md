# Campaign manager app

This app is used to create marketing campaigns that based on specified rules render banner with various discounts and info for customers in checkout via checkout UI extensions.

## Architecture

```
                 +----------------+
                 |    Admin App   |
                 +----------------+
                          |
                          | 1. Create/update/read campaigns
                          v
                +----------------------+
                |   Node.js Backend    |
                +----------------------+
                          |
                          | 3. Fetch campaign data
                          v
            +-------------------------------+
            | Checkout UI Extension (Store) |
            +-------------------------------+
                          |
                          v
                [Displays campaign banners
                   and discounts to user]


           (2-way arrows mean requests & responses, numbered arrows
           show main flow:
              1. Admin App ↔ Backend for campaign management
              2. Backend stores/retrieves data
              3. Checkout Extension fetches active campaigns from Backend)
```

## Quick start (Dev)

### Prerequisites

- [ngrok](https://ngrok.com/) - Used to create a secure tunnel for Shopify to access your local development server. You will need your ngrok tunnel URL when setting up the app.
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/installation)
- [Shopify dev store with Plus plan](https://partners.shopify.com/) - Dev store with Plus features is not enough, Plus sandbox store needed
- [NodeJS v24+](https://nodejs.org/en/download)

### Commands to setup

#### Install dependencies for backend and Shopify app:

```
cd backend && npm install && cd ../ && npm install && cd ../extensions/campaign-banner-extension && npm install && cd ../../
```

#### Disable store password on your Plus Sandbox store (Shopify Limitation). See Shopify guide: https://help.shopify.com/en/manual/online-store/preferences/remove-password-protection

#### Setup the database

```bash
cd backend
npm run prisma:generate && npm run prisma:migrate
```

#### Choose your Shopify env

Pull Shopify app environment config (from repo root, add reset flag only if you already have some apps connected):

```

shopify app dev --reset
shopify app env pull

```

Kill the terminal after first app dev command finishes

This will start the app, allow it to configure as needed, then pull down the env configuration locally.

#### Copy the secret from `.env.${app-name}` file for your env in root to `.env` in backend repository. Copy `.env.example to .env` if there is no `.env` in backend folder yet.

```bash
cp backend/.env.example backend/.env
```

#### Start proxy

```bash
npm run backend:proxy
```

(runs the backend proxy script from `root/scripts`)

#### Start backend in backend folder

```bash
cd backend
npm run dev
```

#### Start shopify app from repo root

```bash
npm run dev
```

## Product demo

![Product Demo](./product-demo.gif)
