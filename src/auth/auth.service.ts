import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>();
  // Mock store for OTPs / reset requests (email -> OTP/ResetToken)
  private resetTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log(dto, "helel")
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        location: dto.location || null,
        role: 'USER',
      },
    });

    return {
      success: true,
      message: 'Registration successful',
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
        },
      },
    };
  }

  async refresh(refreshToken: string) {
    if (this.blacklistedTokens.has(refreshToken)) {
      throw new UnauthorizedException('Refresh token has been blacklisted');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'secondspin-super-secret-refresh-key-12345',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      this.blacklistedTokens.add(refreshToken);
    }
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      // Return success anyway to avoid user enumeration, but don't do anything
      return {
        success: true,
        message: 'If the email exists, a password reset OTP has been sent.',
      };
    }

    // Generate a simple 6 digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    this.resetTokens.set(email, { token: otp, expiresAt });

    console.log(`[PASSWORD RESET OTP FOR ${email}]: ${otp}`);

    return {
      success: true,
      message: 'Password reset OTP has been sent.',
      data: {
        email, // Expose for easy testing/mock flow in frontend
        otp,
      },
    };
  }

  async resetPassword(email: string, otp: string, passwordNew: string) {
    const record = this.resetTokens.get(email);
    if (!record) {
      throw new UnauthorizedException('Invalid OTP or email');
    }

    if (record.token !== otp || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    this.resetTokens.delete(email);

    return {
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secondspin-super-secret-key-12345',
      expiresIn: (process.env.JWT_EXPIRATION || '24h') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'secondspin-super-secret-refresh-key-12345',
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
