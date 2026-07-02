"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.blacklistedTokens = new Set();
        this.resetTokens = new Map();
    }
    async register(dto) {
        console.log(dto, "helel");
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists');
        }
        const existingPhone = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existingPhone) {
            throw new common_1.ConflictException('Phone number already exists');
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
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
    async refresh(refreshToken) {
        if (this.blacklistedTokens.has(refreshToken)) {
            throw new common_1.UnauthorizedException('Refresh token has been blacklisted');
        }
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'secondspin-super-secret-refresh-key-12345',
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
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
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async logout(refreshToken) {
        if (refreshToken) {
            this.blacklistedTokens.add(refreshToken);
        }
        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                success: true,
                message: 'If the email exists, a password reset OTP has been sent.',
            };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        this.resetTokens.set(email, { token: otp, expiresAt });
        console.log(`[PASSWORD RESET OTP FOR ${email}]: ${otp}`);
        return {
            success: true,
            message: 'Password reset OTP has been sent.',
            data: {
                email,
                otp,
            },
        };
    }
    async resetPassword(email, otp, passwordNew) {
        const record = this.resetTokens.get(email);
        if (!record) {
            throw new common_1.UnauthorizedException('Invalid OTP or email');
        }
        if (record.token !== otp || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
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
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'secondspin-super-secret-key-12345',
            expiresIn: (process.env.JWT_EXPIRATION || '24h'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'secondspin-super-secret-refresh-key-12345',
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map