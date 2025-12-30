# Shopify AI SaaS MVP

A minimal, portfolio-quality implementation of a Shopify app using the T3-like stack (Next.js, Express, Prisma) to generate AI-powered product descriptions and ad copies.

## 🚀 Project Overview

This project is a Shopify SaaS MVP designed to help merchants automate their content creation. It connects to a Shopify store, syncs products, and uses OpenAI to generate enhanced product descriptions and ad copies.

### Features
- **Shopify OAuth**: Secure installation and authentication with Shopify stores.
- **Product Sync**: Automatic syncing of products and variants upon installation.
- **Webhooks**: Real-time updates for product changes and app uninstallation handling.
- **AI Generation**: Generate SEO-friendly product descriptions and ad copies using OpenAI.
- **Modern Dashboard**: A clean, minimalistic Next.js dashboard mimicking Shopify's Polaris design.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: Docker ready (implied)

## 📦 Directory Structure

```
/apps
  /web        # Next.js frontend application
/api          # Express backend API
/prisma       # Database schema and migrations
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL
- Shopify Partner Account

### 1. Clone the repository
```bash
git clone <repo-url>
cd shopify-ai-saas-mvp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`.

```bash
cp .env.example .env
```

Fill in the required variables:
- `SHOPIFY_API_KEY` & `SHOPIFY_API_SECRET`: From your Shopify Partner Dashboard.
- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `OPENAI_API_KEY`: Your OpenAI API key.

### 4. Database Setup
Push the Prisma schema to your database:

```bash
npm run db:push
```

### 5. Run Development Server
Start both frontend and backend concurrently:

```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## ⚠️ Known Limitations / TODOs

- **Billing**: The app currently does not handle Shopify Billing API.
- **Production Hardening**: Rate limiting, comprehensive error handling, and security headers need to be fine-tuned for production.
- **Advanced AI**: Currently uses basic prompting. RAG or fine-tuning could improve results.
- **Queueing**: Product sync is done inline/background without a persistent queue (like Redis/Bull), which is recommended for scale.

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---
*Built with ❤️ for the Shopify Ecosystem.*
