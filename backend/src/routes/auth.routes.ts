import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.get('/shopify', authController.install);
router.get('/shopify/callback', authController.callback);

export default router;
