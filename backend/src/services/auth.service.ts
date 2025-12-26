import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { env } from '../config/env';

export class AuthService {

  async loginOrRegister(email: string, password?: string) {
    // MVP: If password provided, traditional login.
    // Ideally for Shopify App, we use the OAuth flow to create users seamlessly.
    // But requirement says "Email + Password" AND "Shopify OAuth".

    // For standalone SaaS mode:
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        if (!password) throw new Error("Password required for registration");
        const hash = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: { email, password: hash }
        });
    } else {
        if (password) {
            const valid = await bcrypt.compare(password, user.password || '');
            if (!valid) throw new Error("Invalid credentials");
        }
    }

    return this.generateToken(user.id, user.email);
  }

  async handleShopifyLogin(shopDomain: string, accessToken: string) {
    // Upsert Shop
    let shop = await prisma.shop.findUnique({ where: { shopDomain } });
    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          shopDomain,
          accessToken,
        }
      });
    } else {
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: { accessToken, isActive: true }
      });
    }

    // Upsert User (Assume 1 user per shop for MVP, use shop email or generic)
    // In real app, we might fetch shop email from Shopify
    const shopEmail = `admin@${shopDomain}`;
    let user = await prisma.user.findFirst({ where: { shopId: shop.id } });

    if (!user) {
      // Check if email exists
      const existingUser = await prisma.user.findUnique({ where: { email: shopEmail }});
      if (existingUser) {
        // Link
        user = await prisma.user.update({
             where: { id: existingUser.id },
             data: { shopId: shop.id }
        });
      } else {
         user = await prisma.user.create({
            data: {
                email: shopEmail,
                shopId: shop.id
            }
         });
      }
    }

    return this.generateToken(user.id, user.email);
  }

  private generateToken(userId: string, email: string) {
    return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
