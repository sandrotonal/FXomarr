import { Request, Response, NextFunction } from 'express';
import { ShopifyService } from '../services/shopify.service';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

const shopifyService = new ShopifyService();
const authService = new AuthService();

export const install = async (req: Request, res: Response) => {
  const shop = req.query.shop as string;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }
  const authUrl = shopifyService.getAuthUrl(shop);
  res.redirect(authUrl);
};

export const callback = async (req: Request, res: Response) => {
  const { shop, code, hmac } = req.query as any;

  if (!shop || !code || !hmac) {
    return res.status(400).send('Missing parameters');
  }

  // Validate
  const isValid = shopifyService.validateHmac(req.query);
  if (!isValid) {
    return res.status(400).send('Invalid HMAC');
  }

  try {
    const accessToken = await shopifyService.getAccessToken(shop, code);

    // Create/Update User & Shop
    const token = await authService.handleShopifyLogin(shop, accessToken);

    // Register webhooks
    await shopifyService.registerWebhooks(shop, accessToken);

    // Initial sync (in background)
    shopifyService.syncProducts(shop, accessToken).catch(err => console.error("Sync error", err));

    // Redirect to frontend with token
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during authentication');
  }
};
