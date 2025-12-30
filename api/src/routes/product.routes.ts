import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);
router.post('/generate-description', productController.generateDescription);
router.post('/generate-ad', productController.generateAd);
router.put('/:id/shopify', productController.updateShopifyProduct);

export default router;
