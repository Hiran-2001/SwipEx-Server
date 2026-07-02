import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, body: {
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
