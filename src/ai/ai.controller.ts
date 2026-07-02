import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ProductCondition } from '@prisma/client';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('price-estimator')
  async estimatePrice(
    @Body('originalPrice') originalPrice: number,
    @Body('age') age: number,
    @Body('condition') condition: ProductCondition,
  ) {
    return this.aiService.estimatePrice(Number(originalPrice), Number(age), condition);
  }

  @Post('condition-analyzer')
  async analyzeCondition(
    @Body('description') description: string,
    @Body('imagesCount') imagesCount?: number,
  ) {
    return this.aiService.analyzeCondition(description, Number(imagesCount || 0));
  }
}
