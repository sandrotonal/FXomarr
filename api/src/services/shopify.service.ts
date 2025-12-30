import axios from 'axios';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { env } from '../config/env';

export class ShopifyService {

  // 1. Generate Auth URL
  getAuthUrl(shop: string) {
    const redirectUri = `${env.HOST}/api/auth/shopify/callback`;
    const nonce = crypto.randomBytes(16).toString('hex');
    const accessMode = 'offline'; // For permanent access token

    return `https://${shop}/admin/oauth/authorize?client_id=${env.SHOPIFY_API_KEY}&scope=${env.SHOPIFY_SCOPES}&redirect_uri=${redirectUri}&state=${nonce}&grant_options[]=${accessMode}`;
  }

  // 2. Validate HMAC
  validateHmac(query: any): boolean {
    const { hmac, ...params } = query;
    const orderedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const calculatedHmac = crypto
      .createHmac('sha256', env.SHOPIFY_API_SECRET)
      .update(orderedParams)
      .digest('hex');

    return hmac === calculatedHmac;
  }

  // 3. Exchange Code for Access Token
  async getAccessToken(shop: string, code: string) {
    try {
      const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: env.SHOPIFY_API_KEY,
        client_secret: env.SHOPIFY_API_SECRET,
        code,
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw new Error('Failed to get access token');
    }
  }

  // 4. Fetch Products
  async syncProducts(shopDomain: string, accessToken: string) {
    // MVP: Fetch first 50 products
    const url = `https://${shopDomain}/admin/api/2023-10/products.json?limit=50`;

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });

      const products = response.data.products;
      const shop = await prisma.shop.findUnique({ where: { shopDomain } });

      if (!shop) throw new Error('Shop not found');

      for (const p of products) {
        const prismaProduct = await prisma.product.upsert({
          where: { shopifyId: p.id.toString() },
          update: {
            title: p.title,
            description: p.body_html,
            vendor: p.vendor,
            productType: p.product_type,
            status: p.status,
            updatedAt: new Date(),
          },
          create: {
            shopifyId: p.id.toString(),
            title: p.title,
            description: p.body_html,
            vendor: p.vendor,
            productType: p.product_type,
            status: p.status,
            shopId: shop.id,
          },
        });

        // Handle variants
        for (const v of p.variants) {
            await prisma.variant.upsert({
                where: { shopifyId: v.id.toString() },
                update: {
                    title: v.title,
                    price: parseFloat(v.price),
                    inventory: v.inventory_quantity || 0,
                    sku: v.sku
                },
                create: {
                    shopifyId: v.id.toString(),
                    title: v.title,
                    price: parseFloat(v.price),
                    inventory: v.inventory_quantity || 0,
                    sku: v.sku,
                    productId: prismaProduct.id
                }
            });
        }
      }
      return products.length;
    } catch (error) {
      console.error('Error syncing products:', error);
      throw error;
    }
  }

  // 5. Update Product in Shopify
  async updateProductDescription(shopDomain: string, accessToken: string, productId: string, newDescription: string) {
    const url = `https://${shopDomain}/admin/api/2023-10/products/${productId}.json`;

    try {
      await axios.put(url, {
        product: {
          id: productId,
          body_html: newDescription
        }
      }, {
        headers: { 'X-Shopify-Access-Token': accessToken }
      });
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // 6. Register Webhooks (MVP)
  async registerWebhooks(shopDomain: string, accessToken: string) {
    const webhookUrl = `${env.HOST}/api/webhooks/shopify`;
    const topics = ['products/update', 'app/uninstalled'];

    for (const topic of topics) {
      try {
        await axios.post(`https://${shopDomain}/admin/api/2023-10/webhooks.json`, {
          webhook: {
            topic,
            address: webhookUrl,
            format: 'json'
          }
        }, {
          headers: { 'X-Shopify-Access-Token': accessToken }
        });
      } catch (e) {
        // Ignore if already exists or other non-critical error for now
        console.warn(`Failed to register webhook ${topic}:`, (e as any).response?.data || (e as any).message);
      }
    }
  }
}
