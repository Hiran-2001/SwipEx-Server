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
exports.BuyerRequirementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BuyerRequirementsService = class BuyerRequirementsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const budgetVal = Number(dto.budget);
        if (budgetVal <= 0 || budgetVal > 10000000) {
            throw new common_1.BadRequestException('Budget must be greater than zero and cannot exceed ₹1 Crore');
        }
        const expiryDate = new Date(dto.expiry_date);
        if (expiryDate <= new Date()) {
            throw new common_1.BadRequestException('Expiry date must be a future date');
        }
        const category = await this.prisma.category.findUnique({
            where: { id: dto.category_id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const requirement = await this.prisma.buyerRequirement.create({
            data: {
                buyer_id: userId,
                title: dto.title,
                description: dto.description,
                budget: budgetVal,
                preferred_condition: dto.preferred_condition,
                category_id: dto.category_id,
                location: dto.location,
                expiry_date: expiryDate,
                status: client_1.RequirementStatus.OPEN,
            },
            include: {
                category: true,
            },
        });
        return {
            success: true,
            message: 'Buyer requirement posted successfully',
            data: requirement,
        };
    }
    async findAll(query) {
        const now = new Date();
        await this.prisma.buyerRequirement.updateMany({
            where: {
                status: client_1.RequirementStatus.OPEN,
                expiry_date: { lt: now },
            },
            data: {
                status: client_1.RequirementStatus.EXPIRED,
            },
        });
        const where = {
            status: client_1.RequirementStatus.OPEN,
        };
        if (query.category_id) {
            where.category_id = query.category_id;
        }
        if (query.location) {
            where.location = { contains: query.location, mode: 'insensitive' };
        }
        if (query.max_budget) {
            where.budget = { lte: Number(query.max_budget) };
        }
        const requirements = await this.prisma.buyerRequirement.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                category: true,
                buyer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true,
                        phone: true,
                    },
                },
            },
        });
        return {
            success: true,
            data: requirements,
        };
    }
    async findOne(id) {
        const requirement = await this.prisma.buyerRequirement.findUnique({
            where: { id },
            include: {
                category: true,
                buyer: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                        avatar_url: true,
                    },
                },
            },
        });
        if (!requirement) {
            throw new common_1.NotFoundException('Requirement not found');
        }
        return {
            success: true,
            data: requirement,
        };
    }
    async update(userId, id, data) {
        const requirement = await this.prisma.buyerRequirement.findUnique({
            where: { id },
        });
        if (!requirement) {
            throw new common_1.NotFoundException('Requirement not found');
        }
        if (requirement.buyer_id !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to edit this requirement');
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description)
            updateData.description = data.description;
        if (data.budget)
            updateData.budget = Number(data.budget);
        if (data.preferred_condition)
            updateData.preferred_condition = data.preferred_condition;
        if (data.location)
            updateData.location = data.location;
        if (data.status)
            updateData.status = data.status;
        if (data.expiry_date) {
            const expiry = new Date(data.expiry_date);
            if (expiry <= new Date()) {
                throw new common_1.BadRequestException('Expiry date must be in the future');
            }
            updateData.expiry_date = expiry;
        }
        const updated = await this.prisma.buyerRequirement.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
            },
        });
        return {
            success: true,
            message: 'Requirement updated successfully',
            data: updated,
        };
    }
    async delete(userId, id) {
        const requirement = await this.prisma.buyerRequirement.findUnique({
            where: { id },
        });
        if (!requirement) {
            throw new common_1.NotFoundException('Requirement not found');
        }
        if (requirement.buyer_id !== userId) {
            throw new common_1.ForbiddenException('You are not allowed to delete this requirement');
        }
        await this.prisma.buyerRequirement.delete({
            where: { id },
        });
        return {
            success: true,
            message: 'Requirement deleted successfully',
        };
    }
};
exports.BuyerRequirementsService = BuyerRequirementsService;
exports.BuyerRequirementsService = BuyerRequirementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BuyerRequirementsService);
//# sourceMappingURL=buyer-requirements.service.js.map