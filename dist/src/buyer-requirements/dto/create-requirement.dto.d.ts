import { ProductCondition } from '@prisma/client';
export declare class CreateRequirementDto {
    title: string;
    description: string;
    budget: string;
    preferred_condition: ProductCondition;
    category_id: string;
    location: string;
    expiry_date: string;
}
