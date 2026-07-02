import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCondition } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    private cloudinaryService;
    private aiService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService, aiService: AiService);
    create(userId: string, dto: CreateProductDto, files: Express.Multer.File[]): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                id: string;
                created_at: Date;
                category_name: string;
            };
            images: {
                id: string;
                created_at: Date;
                image_url: string;
                product_id: string;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            selling_price: import("@prisma/client/runtime/library").Decimal;
            condition: import(".prisma/client").$Enums.ProductCondition;
            status: import(".prisma/client").$Enums.ProductStatus;
            location: string;
            ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
            ai_condition: string | null;
            created_at: Date;
            updated_at: Date;
            seller_id: string;
            category_id: string;
        };
    }>;
    findAll(query: {
        category_id?: string;
        condition?: ProductCondition;
        min_price?: string;
        max_price?: string;
        location?: string;
        search?: string;
        sort?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        success: boolean;
        data: ({
            seller: {
                id: string;
                full_name: string;
                email: string;
                avatar_url: string | null;
            };
            category: {
                id: string;
                created_at: Date;
                category_name: string;
            };
            images: {
                id: string;
                created_at: Date;
                image_url: string;
                product_id: string;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            selling_price: import("@prisma/client/runtime/library").Decimal;
            condition: import(".prisma/client").$Enums.ProductCondition;
            status: import(".prisma/client").$Enums.ProductStatus;
            location: string;
            ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
            ai_condition: string | null;
            created_at: Date;
            updated_at: Date;
            seller_id: string;
            category_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            seller: {
                id: string;
                location: string | null;
                full_name: string;
                email: string;
                phone: string;
                avatar_url: string | null;
            };
            category: {
                id: string;
                created_at: Date;
                category_name: string;
            };
            images: {
                id: string;
                created_at: Date;
                image_url: string;
                product_id: string;
            }[];
            ai_price_history: {
                id: string;
                created_at: Date;
                product_id: string;
                estimated_price: import("@prisma/client/runtime/library").Decimal;
                confidence: import("@prisma/client/runtime/library").Decimal;
            }[];
            ai_condition_reps: {
                id: string;
                product_id: string;
                analyzed_at: Date;
                confidence: import("@prisma/client/runtime/library").Decimal;
                estimated_condition: string;
                detected_damage: string;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            selling_price: import("@prisma/client/runtime/library").Decimal;
            condition: import(".prisma/client").$Enums.ProductCondition;
            status: import(".prisma/client").$Enums.ProductStatus;
            location: string;
            ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
            ai_condition: string | null;
            created_at: Date;
            updated_at: Date;
            seller_id: string;
            category_id: string;
        };
    }>;
    update(userId: string, id: string, data: any): Promise<{
        success: boolean;
        message: string;
        data: {
            category: {
                id: string;
                created_at: Date;
                category_name: string;
            };
            images: {
                id: string;
                created_at: Date;
                image_url: string;
                product_id: string;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            selling_price: import("@prisma/client/runtime/library").Decimal;
            condition: import(".prisma/client").$Enums.ProductCondition;
            status: import(".prisma/client").$Enums.ProductStatus;
            location: string;
            ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
            ai_condition: string | null;
            created_at: Date;
            updated_at: Date;
            seller_id: string;
            category_id: string;
        };
    }>;
    delete(userId: string, id: string, role: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private saveFileLocally;
}
