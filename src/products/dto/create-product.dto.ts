import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ProductCondition } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(30, 1000)
  description: string;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @IsNumberString()
  @IsNotEmpty()
  selling_price: string;

  @IsNumberString()
  @IsOptional()
  original_price?: string;

  @IsEnum(ProductCondition)
  @IsNotEmpty()
  condition: ProductCondition;

  @IsString()
  @IsNotEmpty()
  location: string;
  
  @IsOptional()
  @IsNumberString()
  age?: string; // Product age in years, helpful for AI Price Estimation
}
