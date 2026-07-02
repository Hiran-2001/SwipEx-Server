import { Injectable } from '@nestjs/common';
import { ProductCondition } from '@prisma/client';

@Injectable()
export class AiService {
  estimatePrice(originalPrice: number, age: number, condition: ProductCondition) {
    // Base depreciation: 15% per year
    let depreciation = age * 15;
    if (depreciation > 80) depreciation = 80; // Caps base depreciation at 80%

    // Condition adjustments
    let conditionAdjustment = 0;
    switch (condition) {
      case ProductCondition.NEW:
        conditionAdjustment = -5; // 5% premium/value retention
        break;
      case ProductCondition.LIKE_NEW:
        conditionAdjustment = 5; // 5% extra depreciation
        break;
      case ProductCondition.GOOD:
        conditionAdjustment = 15; // 15% extra depreciation
        break;
      case ProductCondition.FAIR:
        conditionAdjustment = 30; // 30% extra depreciation
        break;
      case ProductCondition.POOR:
        conditionAdjustment = 50; // 50% extra depreciation
        break;
    }

    const totalDepreciation = Math.min(90, Math.max(10, depreciation + conditionAdjustment));
    const estimatedPrice = Math.round(originalPrice * (100 - totalDepreciation) / 100);
    
    // Confidence score based on age
    let confidence = 'High';
    if (age > 4) {
      confidence = 'Low';
    } else if (age > 2) {
      confidence = 'Medium';
    }

    // Recommended Range
    const rangeMin = Math.round(estimatedPrice * 0.9);
    const rangeMax = Math.round(estimatedPrice * 1.1);

    // Explainable output lines
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

  analyzeCondition(description: string, imagesCount: number) {
    const text = description.toLowerCase();
    const detectedIssues: string[] = [];
    let estimatedCondition: ProductCondition = ProductCondition.GOOD;
    let confidence = 85;

    // Check keywords for issues
    if (text.includes('crack') || text.includes('shattered') || text.includes('broken')) {
      estimatedCondition = ProductCondition.POOR;
      detectedIssues.push('Visible cracks / physical structural damage');
    } else if (text.includes('dent') || text.includes('damage') || text.includes('scuffed')) {
      estimatedCondition = ProductCondition.FAIR;
      detectedIssues.push('Moderate surface wear / dents / scuffs');
    } else if (text.includes('scratch') || text.includes('mark') || text.includes('used')) {
      estimatedCondition = ProductCondition.GOOD;
      detectedIssues.push('Minor surface scratches / cosmetic wear');
    } else if (text.includes('perfect') || text.includes('like new') || text.includes('mint')) {
      estimatedCondition = ProductCondition.LIKE_NEW;
      detectedIssues.push('No obvious scratches or defects');
    } else if (text.includes('new') || text.includes('box') || text.includes('sealed')) {
      estimatedCondition = ProductCondition.NEW;
      detectedIssues.push('Unopened / original packaging intact');
    }

    if (detectedIssues.length === 0) {
      detectedIssues.push('Normal wear and tear. No major issues detected.');
    }

    // Adjust confidence based on images uploaded
    if (imagesCount === 0) {
      confidence = 40; // No image confirmation
    } else if (imagesCount < 3) {
      confidence = 70; // Low image count
    } else {
      confidence = Math.min(95, confidence + 10); // Standard high confidence
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
}
