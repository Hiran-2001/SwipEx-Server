import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            created_at: Date;
            full_name: string;
            email: string;
            phone: string;
            location: string | null;
            avatar_url: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    updateProfile(userId: string, data: {
        full_name?: string;
        phone?: string;
        location?: string;
        avatar_url?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            full_name: string;
            email: string;
            phone: string;
            location: string | null;
            avatar_url: string | null;
            role: import(".prisma/client").$Enums.Role;
            updated_at: Date;
        };
    }>;
}
