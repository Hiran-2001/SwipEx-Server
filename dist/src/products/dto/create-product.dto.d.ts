import { ProductCondition } from '@prisma/client';
export declare class CreateProductDto {
    title: string;
    description: string;
    category_id: string;
    selling_price: string;
    original_price?: string;
    condition: ProductCondition;
    location: string;
    age?: string;
}
