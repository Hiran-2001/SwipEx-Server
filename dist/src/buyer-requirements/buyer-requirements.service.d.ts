import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
export declare class BuyerRequirementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateRequirementDto): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                id: string;
                category_name: string;
                created_at: Date;
            };
        } & {
            id: string;
            created_at: Date;
            location: string;
            description: string;
            title: string;
            category_id: string;
            status: import(".prisma/client").$Enums.RequirementStatus;
            budget: import("@prisma/client/runtime/library").Decimal;
            preferred_condition: import(".prisma/client").$Enums.ProductCondition;
            expiry_date: Date;
            buyer_id: string;
        };
    }>;
    findAll(query: {
        category_id?: string;
        max_budget?: string;
        location?: string;
    }): Promise<{
        success: boolean;
        data: ({
            category: {
                id: string;
                category_name: string;
                created_at: Date;
            };
            buyer: {
                id: string;
                full_name: string;
                email: string;
                phone: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            location: string;
            description: string;
            title: string;
            category_id: string;
            status: import(".prisma/client").$Enums.RequirementStatus;
            budget: import("@prisma/client/runtime/library").Decimal;
            preferred_condition: import(".prisma/client").$Enums.ProductCondition;
            expiry_date: Date;
            buyer_id: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            category: {
                id: string;
                category_name: string;
                created_at: Date;
            };
            buyer: {
                id: string;
                full_name: string;
                email: string;
                phone: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            location: string;
            description: string;
            title: string;
            category_id: string;
            status: import(".prisma/client").$Enums.RequirementStatus;
            budget: import("@prisma/client/runtime/library").Decimal;
            preferred_condition: import(".prisma/client").$Enums.ProductCondition;
            expiry_date: Date;
            buyer_id: string;
        };
    }>;
    update(userId: string, id: string, data: any): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                id: string;
                category_name: string;
                created_at: Date;
            };
        } & {
            id: string;
            created_at: Date;
            location: string;
            description: string;
            title: string;
            category_id: string;
            status: import(".prisma/client").$Enums.RequirementStatus;
            budget: import("@prisma/client/runtime/library").Decimal;
            preferred_condition: import(".prisma/client").$Enums.ProductCondition;
            expiry_date: Date;
            buyer_id: string;
        };
    }>;
    delete(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
