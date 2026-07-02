"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
let ProductsService = class ProductsService {
    constructor(prisma, cloudinaryService, aiService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.aiService = aiService;
    }
    async create(userId, dto, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one product image is required');
        }
        if (files.length > 8) {
            throw new common_1.BadRequestException('A maximum of 8 images are allowed');
        }
        const sellingPrice = Number(dto.selling_price);
        const originalPrice = dto.original_price ? Number(dto.original_price) : null;
        const age = dto.age ? Number(dto.age) : 1;
        if (sellingPrice <= 0 || sellingPrice > 10000000) {
            throw new common_1.BadRequestException('Selling price must be greater than zero and cannot exceed ₹1 Crore');
        }
        if (originalPrice !== null && originalPrice <= 0) {
            throw new common_1.BadRequestException('Original price must be greater than zero');
        }
        const category = await this.prisma.category.findUnique({
            where: { id: dto.category_id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        let imageUrls = [];
        for (const file of files) {
            imageUrls = files.map((file) => this.saveFileLocally(file));
        }
        let aiEstimatedPrice = null;
        let aiEstimateConfidence = 'Low';
        if (originalPrice) {
            const priceEstimate = this.aiService.estimatePrice(originalPrice, age, dto.condition, dto.category_name);
            if (priceEstimate.success) {
                aiEstimatedPrice = priceEstimate.data.estimatedPrice;
                aiEstimateConfidence = priceEstimate.data.confidence;
            }
        }
        else {
            const priceEstimate = this.aiService.estimatePrice(sellingPrice * 1.5, age, dto.condition);
            if (priceEstimate.success) {
                aiEstimatedPrice = priceEstimate.data.estimatedPrice;
                aiEstimateConfidence = priceEstimate.data.confidence;
            }
        }
        const conditionEstimate = this.aiService.analyzeCondition(dto.description, files.length);
        const aiEstimatedCondition = conditionEstimate.data.estimatedCondition;
        const product = await this.prisma.product.create({
            data: {
                seller_id: userId,
                category_id: dto.category_id,
                title: dto.title,
                description: dto.description,
                selling_price: sellingPrice,
                original_price: originalPrice,
                condition: dto.condition,
                status: client_1.ProductStatus.AVAILABLE,
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
        if (aiEstimatedPrice) {
            let confValue = 90.00;
            if (aiEstimateConfidence === 'Medium')
                confValue = 75.00;
            if (aiEstimateConfidence === 'Low')
                confValue = 50.00;
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
    async findAll(query) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 12);
        const skip = (page - 1) * limit;
        const where = {
            status: { not: client_1.ProductStatus.DELETED },
        };
        if (!where.status) {
            where.status = client_1.ProductStatus.AVAILABLE;
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
        let orderBy = { created_at: 'desc' };
        if (query.sort === 'oldest') {
            orderBy = { created_at: 'asc' };
        }
        else if (query.sort === 'price_asc') {
            orderBy = { selling_price: 'asc' };
        }
        else if (query.sort === 'price_desc') {
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
    async findOne(id) {
        const product = await this.prisma.product.findFirst({
            where: {
                id,
                status: { not: client_1.ProductStatus.DELETED },
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
            throw new common_1.NotFoundException('Product not found or deleted');
        }
        return {
            success: true,
            data: product,
        };
    }
    async update(userId, id, data) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.seller_id !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to update this listing');
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description)
            updateData.description = data.description;
        if (data.selling_price)
            updateData.selling_price = Number(data.selling_price);
        if (data.original_price)
            updateData.original_price = Number(data.original_price);
        if (data.condition)
            updateData.condition = data.condition;
        if (data.location)
            updateData.location = data.location;
        if (data.status)
            updateData.status = data.status;
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
    async delete(userId, id, role) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.seller_id !== userId && role !== 'ADMIN') {
            throw new common_1.ForbiddenException('You are not allowed to delete this listing');
        }
        await this.prisma.product.update({
            where: { id },
            data: { status: client_1.ProductStatus.DELETED },
        });
        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }
    saveFileLocally(file) {
        const fileName = `${file.originalname}`;
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        return `http://localhost:3000/uploads/products/${fileName}`;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService,
        ai_service_1.AiService])
], ProductsService);
//# sourceMappingURL=products.service.js.map