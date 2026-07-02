import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private blacklistedTokens;
    private resetTokens;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                role: import(".prisma/client").$Enums.Role;
                location: string | null;
                avatarUrl: string | null;
                createdAt: Date;
            };
        };
    }>;
    refresh(refreshToken: string): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            email: string;
            otp: string;
        };
    }>;
    resetPassword(email: string, otp: string, passwordNew: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokens;
}
