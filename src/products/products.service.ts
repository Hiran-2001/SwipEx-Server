import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCondition, ProductStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateProductDto, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one product image is required');
    }
    if (files.length > 8) {
      throw new BadRequestException('A maximum of 8 images are allowed');
    }

    const sellingPrice = Number(dto.selling_price);
    const originalPrice = dto.original_price ? Number(dto.original_price) : null;
    const age = dto.age ? Number(dto.age) : 1;

    if (sellingPrice <= 0 || sellingPrice > 10000000) {
      throw new BadRequestException('Selling price must be greater than zero and cannot exceed ₹1 Crore');
    }
    if (originalPrice !== null && originalPrice <= 0) {
      throw new BadRequestException('Original price must be greater than zero');
    }

    // Check category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Upload files
    let imageUrls: string[] = [];
    for (const file of files) {
      // const url = await this.cloudinaryService.uploadImage(file);
      // imageUrls.push(url);
      imageUrls = files.map((file) => this.saveFileLocally(file));
    }

    // Run AI price estimation 
    let aiEstimatedPrice = null;
    let aiEstimateConfidence = 'Low';
    if (originalPrice) {
      const priceEstimate = this.aiService.estimatePrice(originalPrice, age, dto.condition);
      if (priceEstimate.success) {
        aiEstimatedPrice = priceEstimate.data.estimatedPrice;
        aiEstimateConfidence = priceEstimate.data.confidence;
      }
    } else {
      // Fallback estimate based on selling price
      const priceEstimate = this.aiService.estimatePrice(sellingPrice * 1.5, age, dto.condition);
      if (priceEstimate.success) {
        aiEstimatedPrice = priceEstimate.data.estimatedPrice;
        aiEstimateConfidence = priceEstimate.data.confidence;
      }
    }

    // Run AI condition analyzer
    const conditionEstimate = this.aiService.analyzeCondition(dto.description, files.length);
    const aiEstimatedCondition = conditionEstimate.data.estimatedCondition;

    // Create the product listing
    const product = await this.prisma.product.create({
      data: {
        seller_id: userId,
        category_id: dto.category_id,
        title: dto.title,
        description: dto.description,
        selling_price: sellingPrice,
        original_price: originalPrice,
        condition: dto.condition,
        status: ProductStatus.AVAILABLE,
        location: dto.location,
        ai_estimated_price: aiEstimatedPrice,
        ai_condition: aiEstimatedCondition,
        images: {
          create: imageUrls.map((url) => ({ image_url: url })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Record AI estimation histories
    if (aiEstimatedPrice) {
      let confValue = 90.00;
      if (aiEstimateConfidence === 'Medium') confValue = 75.00;
      if (aiEstimateConfidence === 'Low') confValue = 50.00;

      await this.prisma.aiPriceHistory.create({
        data: {
          product_id: product.id,
          estimated_price: aiEstimatedPrice,
          confidence: confValue,
        },
      });
    }

    let conditionConfidenceValue = 85.00;
    if (conditionEstimate.data.confidence.endsWith('%')) {
      conditionConfidenceValue = parseFloat(conditionEstimate.data.confidence);
    }

    await this.prisma.aiConditionReport.create({
      data: {
        product_id: product.id,
        estimated_condition: aiEstimatedCondition,
        confidence: conditionConfidenceValue,
        detected_damage: conditionEstimate.data.detectedIssues.join(', '),
      },
    });

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async findAll(query: {
    category_id?: string;
    condition?: ProductCondition;
    min_price?: string;
    max_price?: string;
    location?: string;
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 12);
    const skip = (page - 1) * limit;

    const where: any = {
      status: { not: ProductStatus.DELETED }, // Default excludes deleted items
    };

    // If listing products for buyer browsing, default is AVAILABLE
    if (!where.status) {
      where.status = ProductStatus.AVAILABLE;
    }

    if (query.category_id) {
      where.category_id = query.category_id;
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.min_price || query.max_price) {
      where.selling_price = {};
      if (query.min_price) {
        where.selling_price.gte = Number(query.min_price);
      }
      if (query.max_price) {
        where.selling_price.lte = Number(query.max_price);
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Sort order mapping
    let orderBy: any = { created_at: 'desc' }; // default newest
    if (query.sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (query.sort === 'price_asc') {
      orderBy = { selling_price: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { selling_price: 'desc' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: true,
          category: true,
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: { not: ProductStatus.DELETED },
      },
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            location: true,
          },
        },
        ai_price_history: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
        ai_condition_reps: {
          orderBy: { analyzed_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or deleted');
    }

    return {
      success: true,
      data: product,
    };
  }

  async update(userId: string, id: string, data: any) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.seller_id !== userId) {
      throw new ForbiddenException('You are not allowed to update this listing');
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.selling_price) updateData.selling_price = Number(data.selling_price);
    if (data.original_price) updateData.original_price = Number(data.original_price);
    if (data.condition) updateData.condition = data.condition;
    if (data.location) updateData.location = data.location;
    if (data.status) updateData.status = data.status;

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: true,
      },
    });

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async delete(userId: string, id: string, role: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.seller_id !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to delete this listing');
    }

    await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  private saveFileLocally(file: Express.Multer.File): string {
  const fileName = `${file.originalname}`;
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'products');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  return `http://localhost:3000/uploads/products/${fileName}`;
}
}
