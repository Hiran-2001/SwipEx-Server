import { AiService } from './ai.service';
import { ProductCondition } from '@prisma/client';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    estimatePrice(originalPrice: number, age: number, condition: ProductCondition): Promise<{
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
    }>;
    analyzeCondition(description: string, imagesCount?: number): Promise<{
        success: boolean;
        data: {
            estimatedCondition: import(".prisma/client").$Enums.ProductCondition;
            confidence: string;
            detectedIssues: string[];
            wearAndTearAnalysis: string;
        };
    }>;
}
