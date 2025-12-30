import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AiService } from '../services/ai.service';
import { ShopifyService } from '../services/shopify.service';

const aiService = new AiService();
const shopifyService = new ShopifyService();

export const getProducts = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  // Get user's shop
  const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true }
  });

  if (!user?.shop) return res.status(404).json({ error: "Shop not connected" });

  const products = await prisma.product.findMany({
    where: { shopId: user.shop.id },
    include: { variants: true },
    orderBy: { updatedAt: 'desc' }
  });

  res.json(products);
};

export const getProductDetail = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true, generations: true }
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
}

export const generateDescription = async (req: Request, res: Response) => {
    const { productId, tone, language, targetAudience } = req.body;

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    try {
        // Calculate average or first variant price for context
        const price = product.variants.length > 0 ? product.variants[0].price : null;

        const result = await aiService.generateProductDescription(
            product.title,
            price,
            product.productType || 'General',
            [targetAudience || 'General Audience'], // Simplified features
            tone || 'Sales-oriented',
            language || 'en'
        );

        // Save generation
        await prisma.aiGeneration.create({
            data: {
                productId,
                type: 'DESCRIPTION',
                content: JSON.stringify(result),
                metadata: { tone, language }
            }
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "AI Generation failed" });
    }
};

export const generateAd = async (req: Request, res: Response) => {
    const { productId, platform, language } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    try {
        const result = await aiService.generateAdCopy(
            product.title,
            product.description || '',
            platform || 'facebook',
            language || 'en'
        );

        await prisma.aiGeneration.create({
            data: {
                productId,
                type: 'AD_COPY',
                content: JSON.stringify(result),
                metadata: { platform, language }
            }
        });

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "AI Generation failed" });
    }
};

export const updateShopifyProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { description } = req.body;
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { shop: true }});
    const product = await prisma.product.findUnique({ where: { id } });

    if (!user?.shop || !product) return res.status(404).json({ error: "Not found" });

    try {
        await shopifyService.updateProductDescription(
            user.shop.shopDomain,
            user.shop.accessToken,
            product.shopifyId,
            description
        );

        // Update local DB
        await prisma.product.update({
            where: { id },
            data: { description }
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to update Shopify" });
    }
}
