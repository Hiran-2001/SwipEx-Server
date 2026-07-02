import { IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsString, IsUUID, Length } from 'class-validator';
import { ProductCondition } from '@prisma/client';

export class CreateRequirementDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(30, 1000)
  description: string;

  @IsNumberString()
  @IsNotEmpty()
  budget: string;

  @IsEnum(ProductCondition)
  @IsNotEmpty()
  preferred_condition: ProductCondition;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  expiry_date: string;
}
