# Shopify AI SaaS MVP

A minimal, single-store Shopify SaaS application leveraging AI for product descriptions and ad copy generation. Built with a modern full-stack architecture.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Node.js (Express), TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Shopify API:** @shopify/shopify-api (Node.js adapter)
- **AI:** OpenAI GPT-4 (Planned)

## 📂 Project Structure

```
/apps
  /web        → Next.js frontend (dashboard)
/api          → Backend (Express / API & Auth)
/prisma       → Prisma schema & Database management
```

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/shopify-ai-saas.git
   cd shopify-ai-saas
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd api
   npm install

   # Frontend
   cd ../apps/web
   npm install
   ```

3. **Environment Configuration:**
   Copy `.env.example` to `.env` in the root (or respective folders if preferred, currently managed globally for dev simplicity).
   ```bash
   cp .env.example .env
   ```

4. **Database Setup:**
   Ensure you have a PostgreSQL instance running.
   ```bash
   npx prisma generate
   # npx prisma migrate dev --name init (Run inside prisma/ or link schema)
   ```

5. **Run the Application:**

   *Backend (Port 8080):*
   ```bash
   cd api
   npm run dev
   ```

   *Frontend (Port 3000):*
   ```bash
   cd apps/web
   npm run dev
   ```

## 🔑 Environment Variables (.env)

See `.env.example` for the full list. Key variables include:
- `SHOPIFY_API_KEY`: Your Shopify Partner App API Key
- `SHOPIFY_API_SECRET`: Your Shopify Partner App Secret
- `SHOPIFY_SCOPES`: Scopes required (e.g., `read_products,write_products`)
- `DATABASE_URL`: PostgreSQL connection string

## ✅ Features (MVP)

- [x] **Shopify OAuth:** Secure HMAC-verified installation flow.
- [x] **Webhooks:** Automated handling (incl. `app/uninstalled`) with HMAC signature verification.
- [x] **Dashboard:** Minimalist Next.js UI foundation.
- [x] **Database:** Prisma schema for Stores and Sessions.

## 🚧 Known Issues / TODO

- **Billing:** Not yet implemented.
- **Production Deployment:** Docker/Vercel configuration pending.
- **Advanced AI Logic:** Placeholder for GPT-4 integration.
- **Session Storage:** Currently using Memory/Prisma (needs finalization for production).


KENDİNDEN KAÇMA KENDİNLE BARIŞIK OL