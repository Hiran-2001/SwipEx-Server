"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AiService = class AiService {
    estimatePrice(originalPrice, age, condition) {
        let depreciation = age * 15;
        if (depreciation > 80)
            depreciation = 80;
        let conditionAdjustment = 0;
        switch (condition) {
            case client_1.ProductCondition.NEW:
                conditionAdjustment = -5;
                break;
            case client_1.ProductCondition.LIKE_NEW:
                conditionAdjustment = 5;
                break;
            case client_1.ProductCondition.GOOD:
                conditionAdjustment = 15;
                break;
            case client_1.ProductCondition.FAIR:
                conditionAdjustment = 30;
                break;
            case client_1.ProductCondition.POOR:
                conditionAdjustment = 50;
                break;
        }
        const totalDepreciation = Math.min(90, Math.max(10, depreciation + conditionAdjustment));
        const estimatedPrice = Math.round(originalPrice * (100 - totalDepreciation) / 100);
        let confidence = 'High';
        if (age > 4) {
            confidence = 'Low';
        }
        else if (age > 2) {
            confidence = 'Medium';
        }
        const rangeMin = Math.round(estimatedPrice * 0.9);
        const rangeMax = Math.round(estimatedPrice * 1.1);
        const explanations = [
            `Base depreciation of ${depreciation}% calculated for a product age of ${age} year(s).`,
            `Adjusted by ${conditionAdjustment}% extra depreciation for ${condition.toLowerCase()} condition.`,
            `Overall estimated market value is ${100 - totalDepreciation}% of original price.`,
        ];
        return {
            success: true,
            data: {
                estimatedPrice,
                confidence,
                recommendedRange: {
                    min: rangeMin,
                    max: rangeMax,
                },
                explanations,
            },
        };
    }
    analyzeCondition(description, imagesCount) {
        const text = description.toLowerCase();
        const detectedIssues = [];
        let estimatedCondition = client_1.ProductCondition.GOOD;
        let confidence = 85;
        if (text.includes('crack') || text.includes('shattered') || text.includes('broken')) {
            estimatedCondition = client_1.ProductCondition.POOR;
            detectedIssues.push('Visible cracks / physical structural damage');
        }
        else if (text.includes('dent') || text.includes('damage') || text.includes('scuffed')) {
            estimatedCondition = client_1.ProductCondition.FAIR;
            detectedIssues.push('Moderate surface wear / dents / scuffs');
        }
        else if (text.includes('scratch') || text.includes('mark') || text.includes('used')) {
            estimatedCondition = client_1.ProductCondition.GOOD;
            detectedIssues.push('Minor surface scratches / cosmetic wear');
        }
        else if (text.includes('perfect') || text.includes('like new') || text.includes('mint')) {
            estimatedCondition = client_1.ProductCondition.LIKE_NEW;
            detectedIssues.push('No obvious scratches or defects');
        }
        else if (text.includes('new') || text.includes('box') || text.includes('sealed')) {
            estimatedCondition = client_1.ProductCondition.NEW;
            detectedIssues.push('Unopened / original packaging intact');
        }
        if (detectedIssues.length === 0) {
            detectedIssues.push('Normal wear and tear. No major issues detected.');
        }
        if (imagesCount === 0) {
            confidence = 40;
        }
        else if (imagesCount < 3) {
            confidence = 70;
        }
        else {
            confidence = Math.min(95, confidence + 10);
        }
        return {
            success: true,
            data: {
                estimatedCondition,
                confidence: `${confidence}%`,
                detectedIssues,
                wearAndTearAnalysis: `The item is estimated to be in ${estimatedCondition.toLowerCase()} condition with ${confidence}% confidence based on listing description keyword analysis and ${imagesCount} uploaded image assets.`,
            },
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map