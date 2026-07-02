import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
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
    getMe(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
