import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { RequirementStatus } from '@prisma/client';

@Injectable()
export class BuyerRequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRequirementDto) {
    const budgetVal = Number(dto.budget);
    if (budgetVal <= 0 || budgetVal > 10000000) {
      throw new BadRequestException('Budget must be greater than zero and cannot exceed ₹1 Crore');
    }

    const expiryDate = new Date(dto.expiry_date);
    if (expiryDate <= new Date()) {
      throw new BadRequestException('Expiry date must be a future date');
    }

    // Check category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
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
        status: RequirementStatus.OPEN,
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

  async findAll(query: { category_id?: string; max_budget?: string; location?: string }) {
    const now = new Date();

    // Automatically archive expired requirements
    await this.prisma.buyerRequirement.updateMany({
      where: {
        status: RequirementStatus.OPEN,
        expiry_date: { lt: now },
      },
      data: {
        status: RequirementStatus.EXPIRED,
      },
    });

    const where: any = {
      status: RequirementStatus.OPEN,
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

  async findOne(id: string) {
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
      throw new NotFoundException('Requirement not found');
    }

    return {
      success: true,
      data: requirement,
    };
  }

  async update(userId: string, id: string, data: any) {
    const requirement = await this.prisma.buyerRequirement.findUnique({
      where: { id },
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (requirement.buyer_id !== userId) {
      throw new ForbiddenException('You are not allowed to edit this requirement');
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.budget) updateData.budget = Number(data.budget);
    if (data.preferred_condition) updateData.preferred_condition = data.preferred_condition;
    if (data.location) updateData.location = data.location;
    if (data.status) updateData.status = data.status;
    if (data.expiry_date) {
      const expiry = new Date(data.expiry_date);
      if (expiry <= new Date()) {
        throw new BadRequestException('Expiry date must be in the future');
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

  async delete(userId: string, id: string) {
    const requirement = await this.prisma.buyerRequirement.findUnique({
      where: { id },
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (requirement.buyer_id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this requirement');
    }

    await this.prisma.buyerRequirement.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Requirement deleted successfully',
    };
  }
}
