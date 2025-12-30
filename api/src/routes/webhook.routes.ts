import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

// Note: Ensure body-parser is configured to keep raw body for HMAC if implementing strict security
router.post('/shopify', webhookController.handleWebhook);

export default router;
