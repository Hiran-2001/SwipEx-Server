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
    getDepreciationRate(categoryName) {
        const name = categoryName.toLowerCase();
        if (name.includes('car') || name.includes('vehicle') || name.includes('bike')) {
            return 0.12;
        }
        if (name.includes('phone') || name.includes('electronics') || name.includes('laptop')) {
            return 0.25;
        }
        if (name.includes('furniture') || name.includes('home')) {
            return 0.15;
        }
        return 0.15;
    }
    estimatePrice(originalPrice, age, condition, categoryName = 'default') {
        const annualRate = this.getDepreciationRate(categoryName);
        let remainingValuePercentage = Math.pow(1 - annualRate, age);
        let conditionMultiplier = 1.0;
        switch (condition) {
            case client_1.ProductCondition.NEW:
                conditionMultiplier = 1.05;
                break;
            case client_1.ProductCondition.LIKE_NEW:
                conditionMultiplier = 0.95;
                break;
            case client_1.ProductCondition.GOOD:
                conditionMultiplier = 0.85;
                break;
            case client_1.ProductCondition.FAIR:
                conditionMultiplier = 0.70;
                break;
            case client_1.ProductCondition.POOR:
                conditionMultiplier = 0.45;
                break;
        }
        let finalFactor = remainingValuePercentage * conditionMultiplier;
        finalFactor = Math.max(0.12, Math.min(1.0, finalFactor));
        const estimatedPrice = Math.round(originalPrice * finalFactor);
        const totalDepreciationLoss = Math.round((1 - finalFactor) * 100);
        let confidence = 'High';
        if (age > 8) {
            confidence = 'Low';
        }
        else if (age > 3) {
            confidence = 'Medium';
        }
        const rangeMin = Math.round(estimatedPrice * 0.9);
        const rangeMax = Math.round(estimatedPrice * 1.1);
        const explanations = [
            `Applied compound depreciation at an annual rate of ${(annualRate * 100).toFixed(0)}% for ${age} year(s).`,
            `Adjusted value based on item condition evaluated as ${condition.toLowerCase()}.`,
            `Overall remaining market value estimated at ${(finalFactor * 100).toFixed(0)}% of original cost.`,
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