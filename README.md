# Shopify AI SaaS Architecture & Deployment

This project is a scalable SaaS application designed for Shopify merchants to generate AI-powered product descriptions and ad copies.

## 1. Project Structure

- **Backend**: Node.js (Express) with TypeScript.
  - **Architecture**: Layered (Controller -> Service -> Data Access).
  - **Database**: PostgreSQL with Prisma ORM.
  - **Auth**: JWT & Shopify OAuth.

- **Frontend**: Next.js (App Router) with Tailwind CSS.

## 2. API Endpoints

### Auth
- `GET /api/auth/shopify?shop=example.myshopify.com`: Initiates OAuth.
- `GET /api/auth/shopify/callback`: Callback for OAuth.

### Products
- `GET /api/products`: List all products.
- `GET /api/products/:id`: Get product details.
- `PUT /api/products/:id/shopify`: Update product description on Shopify.
- `POST /api/products/generate-description`: Generate AI description.
  - Body: `{ productId, tone, language, targetAudience }`
- `POST /api/products/generate-ad`: Generate Ad Copy.
  - Body: `{ productId, platform, language }`

## 3. OpenAI Prompts (System Design)

### Product Description
**Role**: Expert Copywriter.
**Input**: Product Name, Category, Features, Tone, Language.
**Output**: JSON `{ description (HTML), bullet_points, seo_title, meta_description }`.

### Ad Copy
**Role**: Performance Marketer.
**Input**: Product Name, Description, Platform (FB/Google), Language.
**Output**: JSON `{ primary_text, headline, cta_options }`.

## 4. Deployment Plan (MVP)

### Database (PostgreSQL)
- Use a managed Postgres service (e.g., Supabase, Railway, AWS RDS).
- Run `npx prisma db push` to sync schema.

### Backend
- **Environment Variables**:
  - `DATABASE_URL`: Connection string.
  - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`: From Shopify Partner Dashboard.
  - `OPENAI_API_KEY`: OpenAI Key.
  - `JWT_SECRET`: Random string.
  - `HOST`: Backend URL (e.g., `https://api.myapp.com`).
  - `FRONTEND_URL`: Frontend URL.
- **Deploy**: Railway / Render / DigitalOcean App Platform.

### Frontend
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://api.myapp.com`.
- **Deploy**: Vercel (Recommended for Next.js).

## 5. Webhooks Setup
- **Endpoint**: `POST /api/webhooks/shopify`
- **Topic**: `products/update`
- **Security**: Validates `X-Shopify-Hmac-Sha256` header (Basic check implemented, enable strict verification in production).
- **Behavior**: Updates local product title, description, and variants (price, inventory) when changed in Shopify.

## 6. Next Steps for Production
1.  **Queue System**: Use BullMQ/Redis for AI generation tasks if they take >10s.
2.  **Billing**: Integrate Shopify Billing API for subscription (SaaS requirement).
3.  **Frontend Testing**: Add E2E tests with Playwright.
