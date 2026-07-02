import { Injectable } from '@nestjs/common';
import { ProductCondition } from '@prisma/client';

@Injectable()
export class AiService {

  private getDepreciationRate(categoryName: string): number {
    const name = categoryName.toLowerCase();
    
    if (name.includes('car') || name.includes('vehicle') || name.includes('bike')) {
      // Vehicles drop fast initially, but flatten out over time (approx 10-12% compound)
      return 0.12; 
    }
    if (name.includes('phone') || name.includes('electronics') || name.includes('laptop')) {
      // Tech items depreciate much faster
      return 0.25; 
    }
    if (name.includes('furniture') || name.includes('home')) {
      return 0.15;
    }
    
    // Default fallback rate (15%)
    return 0.15; 
  }

  estimatePrice(originalPrice: number, age: number, condition: ProductCondition, categoryName = 'default') {
    const annualRate = this.getDepreciationRate(categoryName);

    // 1. COMPOUND DEPRECIATION MATH: Remaining Value = Original * (1 - rate)^age
    // This naturally prevents an asset from dropping to zero, flattening beautifully over time.
    let remainingValuePercentage = Math.pow(1 - annualRate, age);

    // 2. Condition adjustments applied directly to the remaining value scale
    let conditionMultiplier = 1.0; 
    switch (condition) {
      case ProductCondition.NEW:
        conditionMultiplier = 1.05; // 5% bonus for sealed items
        break;
      case ProductCondition.LIKE_NEW:
        conditionMultiplier = 0.95; // 5% drop
        break;
      case ProductCondition.GOOD:
        conditionMultiplier = 0.85; // 15% drop
        break;
      case ProductCondition.FAIR:
        conditionMultiplier = 0.70; // 30% drop
        break;
      case ProductCondition.POOR:
        conditionMultiplier = 0.45; // 55% drop
        break;
    }

    // Apply multiplier and set a floor price (e.g., an asset is rarely worth less than 12% of its original cost)
    let finalFactor = remainingValuePercentage * conditionMultiplier;
    finalFactor = Math.max(0.12, Math.min(1.0, finalFactor));

    const estimatedPrice = Math.round(originalPrice * finalFactor);
    const totalDepreciationLoss = Math.round((1 - finalFactor) * 100);

    // 3. Dynamic confidence metrics
    let confidence = 'High';
    if (age > 8) {
      confidence = 'Low'; // Long periods are highly volatile
    } else if (age > 3) {
      confidence = 'Medium';
    }

    // Recommended Range
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
