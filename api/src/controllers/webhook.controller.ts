import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { env } from '../config/env';

export const handleWebhook = async (req: Request, res: Response) => {
  const hmac = req.header('X-Shopify-Hmac-Sha256');
  const topic = req.header('X-Shopify-Topic');
  const shopDomain = req.header('X-Shopify-Shop-Domain');

  if (!hmac || !topic || !shopDomain) {
    return res.status(401).send('Missing headers');
  }

  // Verify HMAC
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
     return res.status(500).send('Could not verify webhook: Missing raw body');
  }

  const generatedHash = crypto
      .createHmac('sha256', env.SHOPIFY_API_SECRET)
      .update(rawBody)
      .digest('base64');

  if (generatedHash !== hmac) {
    console.error('Webhook HMAC validation failed');
    return res.status(401).send('Invalid HMAC');
  }

  try {
    // Log webhook
    await prisma.webhookLog.create({
      data: {
        shopDomain: shopDomain as string,
        topic: topic as string,
        payload: req.body
      }
    });

    if (topic === 'products/update') {
       const p = req.body;
       const shop = await prisma.shop.findUnique({ where: { shopDomain: shopDomain as string } });

       if (shop) {
           const prismaProduct = await prisma.product.upsert({
               where: { shopifyId: p.id.toString() },
               update: {
                   title: p.title,
                   description: p.body_html,
                   updatedAt: new Date()
               },
               create: {
                   shopifyId: p.id.toString(),
                   title: p.title,
                   shopId: shop.id
               }
           });

           // Update variants
            for (const v of p.variants) {
                await prisma.variant.upsert({
                    where: { shopifyId: v.id.toString() },
                    update: {
                        title: v.title,
                        price: parseFloat(v.price),
                        inventory: v.inventory_quantity || 0,
                    },
                    create: {
                        shopifyId: v.id.toString(),
                        title: v.title,
                        price: parseFloat(v.price),
                        inventory: v.inventory_quantity || 0,
                        productId: prismaProduct.id
                    }
                });
            }
       }
    } else if (topic === 'app/uninstalled') {
       await prisma.shop.update({
         where: { shopDomain: shopDomain as string },
         data: { isActive: false, accessToken: '' }
       });
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
};
