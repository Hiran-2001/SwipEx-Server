import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post('toggle')
  async toggleWishlist(
    @CurrentUser() user: any,
    @Body('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.toggleWishlist(user.id, productId);
  }

  @Get()
  async getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Get('status/:productId')
  async checkWishlistStatus(
    @CurrentUser() user: any,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.wishlistService.isWishlisted(user.id, productId);
  }
}
