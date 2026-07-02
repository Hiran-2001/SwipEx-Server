import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private wishlistService;
    constructor(wishlistService: WishlistService);
    toggleWishlist(user: any, productId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            wishlisted: boolean;
        };
    }>;
    getWishlist(user: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    checkWishlistStatus(user: any, productId: string): Promise<{
        success: boolean;
        data: {
            wishlisted: boolean;
        };
    }>;
}
