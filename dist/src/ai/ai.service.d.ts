import { ProductCondition } from '@prisma/client';
export declare class AiService {
    estimatePrice(originalPrice: number, age: number, condition: ProductCondition): {
        success: boolean;
        data: {
            estimatedPrice: number;
            confidence: string;
            recommendedRange: {
                min: number;
                max: number;
            };
            explanations: string[];
        };
    };
    analyzeCondition(description: string, imagesCount: number): {
        success: boolean;
        data: {
            estimatedCondition: import(".prisma/client").$Enums.ProductCondition;
            confidence: string;
            detectedIssues: string[];
            wearAndTearAnalysis: string;
        };
    };
}
