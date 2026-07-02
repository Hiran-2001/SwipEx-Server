import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    toggleWishlist(userId: string, productId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            wishlisted: boolean;
        };
    }>;
    getWishlist(userId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    isWishlisted(userId: string, productId: string): Promise<{
        success: boolean;
        data: {
            wishlisted: boolean;
        };
    }>;
}
