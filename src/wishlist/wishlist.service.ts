import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggleWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: { not: 'DELETED' },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId,
          },
        },
      });

      return {
        success: true,
        message: 'Product removed from wishlist',
        data: { wishlisted: false },
      };
    } else {
      await this.prisma.wishlist.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
      });

      return {
        success: true,
        message: 'Product added to wishlist',
        data: { wishlisted: true },
      };
    }
  }

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: {
              select: {
                id: true,
                full_name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      data: items.map((item : any) => item.product),
    };
  }

  async isWishlisted(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    return {
      success: true,
      data: { wishlisted: !!existing },
    };
  }
}
