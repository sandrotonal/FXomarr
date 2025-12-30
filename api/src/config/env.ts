import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || '',
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET || '',
  SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_inventory',
  HOST: process.env.HOST || 'http://localhost:4000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};
