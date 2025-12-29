import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import cors from 'cors';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: (process.env.SHOPIFY_SCOPES || '').split(','),
  hostName: process.env.SHOPIFY_APP_URL ? process.env.SHOPIFY_APP_URL.replace(/https:\/\//, '') : '',
  apiVersion: ApiVersion.April24,
  isEmbeddedApp: true,
});

app.use(cors());

// Raw body parser for webhooks is essential for HMAC verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// 1. Shopify OAuth: Login / Install
app.get('/api/auth', async (req: Request, res: Response) => {
  try {
    const shop = req.query.shop as string;
    if (!shop) {
      res.status(400).send('Missing shop parameter');
      return;
    }

    await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(shop, true)!,
      callbackPath: '/api/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (e: any) {
    console.error(`---> Error at /api/auth: ${e.message}`);
    res.status(500).send(e.message);
  }
});

// 2. Shopify OAuth: Callback
app.get('/api/auth/callback', async (req: Request, res: Response) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;
    console.log('Session created:', session);

    // Register webhooks here if needed
    // const response = await shopify.webhooks.register({
    //   session,
    // });

    // Redirect to frontend app
    const host = req.query.host as string;
    const redirectUrl = `${process.env.FRONTEND_URL}/?shop=${session.shop}&host=${host}`;

    res.redirect(redirectUrl);
  } catch (e: any) {
    console.error(`---> Error at /api/auth/callback: ${e.message}`);
    res.status(500).send(e.message);
  }
});

// 3. Webhook Handling (HMAC Verification)
const verifyWebhook = async (req: Request, res: Response, next: any) => {
  try {
    const hmac = req.header('X-Shopify-Hmac-Sha256');
    const topic = req.header('X-Shopify-Topic');
    const shop = req.header('X-Shopify-Shop-Domain');

    if (!hmac || !topic || !shop) {
      res.status(401).send('Missing webhook headers');
      return;
    }

    // Verify HMAC
    // Note: req.rawBody is populated by express.json({ verify: ... })
    const generatedHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET || '')
      .update((req as any).rawBody)
      .digest('base64');

    if (generatedHash !== hmac) {
      console.log('Webhook verification failed');
      res.status(401).send('Forbidden');
      return;
    }

    next();
  } catch (error) {
    console.error('Webhook verification error', error);
    res.status(401).send('Forbidden');
  }
};

app.post('/api/webhooks', verifyWebhook, async (req: Request, res: Response) => {
  const topic = req.header('X-Shopify-Topic');
  console.log(`Received webhook: ${topic}`);

  if (topic === 'app/uninstalled') {
     console.log('App uninstalled, cleaning up data...');
     // TODO: Clean up store data in database
  }

  res.status(200).send('Webhook received');
});

app.get('/', (req: Request, res: Response) => {
  res.send('Shopify AI SaaS API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
