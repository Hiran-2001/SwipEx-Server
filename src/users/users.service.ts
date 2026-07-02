import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar_url: true,
        location: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  async updateProfile(userId: string, data: { full_name?: string; phone?: string; location?: string; avatar_url?: string }) {
    if (data.phone) {
      const existing = await this.prisma.user.findFirst({
        where: {
          phone: data.phone,
          id: { not: userId },
        },
      });
      if (existing) {
        throw new ConflictException('Phone number is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar_url: true,
        location: true,
        role: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }
}
