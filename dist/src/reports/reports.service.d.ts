import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus, Role } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReport(reporterId: string, productId: string, reason: string): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                id: string;
                created_at: Date;
                location: string;
                updated_at: Date;
                condition: import(".prisma/client").$Enums.ProductCondition;
                description: string;
                title: string;
                category_id: string;
                selling_price: import("@prisma/client/runtime/library").Decimal;
                original_price: import("@prisma/client/runtime/library").Decimal | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
                ai_condition: string | null;
                seller_id: string;
            };
            reporter: {
                id: string;
                full_name: string;
                email: string;
            };
        } & {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.ReportStatus;
            product_id: string;
            reason: string;
            reporter_id: string;
        };
    }>;
    findAll(userRole: Role): Promise<{
        success: boolean;
        data: ({
            product: {
                seller: {
                    id: string;
                    full_name: string;
                    email: string;
                };
                images: {
                    id: string;
                    created_at: Date;
                    image_url: string;
                    product_id: string;
                }[];
            } & {
                id: string;
                created_at: Date;
                location: string;
                updated_at: Date;
                condition: import(".prisma/client").$Enums.ProductCondition;
                description: string;
                title: string;
                category_id: string;
                selling_price: import("@prisma/client/runtime/library").Decimal;
                original_price: import("@prisma/client/runtime/library").Decimal | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
                ai_condition: string | null;
                seller_id: string;
            };
            reporter: {
                id: string;
                full_name: string;
                email: string;
            };
        } & {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.ReportStatus;
            product_id: string;
            reason: string;
            reporter_id: string;
        })[];
    }>;
    updateStatus(userRole: Role, reportId: string, status: ReportStatus): Promise<{
        success: boolean;
        message: string;
        data: {
            product: {
                id: string;
                created_at: Date;
                location: string;
                updated_at: Date;
                condition: import(".prisma/client").$Enums.ProductCondition;
                description: string;
                title: string;
                category_id: string;
                selling_price: import("@prisma/client/runtime/library").Decimal;
                original_price: import("@prisma/client/runtime/library").Decimal | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                ai_estimated_price: import("@prisma/client/runtime/library").Decimal | null;
                ai_condition: string | null;
                seller_id: string;
            };
        } & {
            id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.ReportStatus;
            product_id: string;
            reason: string;
            reporter_id: string;
        };
    }>;
}
