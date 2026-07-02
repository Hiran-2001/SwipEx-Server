import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus, Role } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, productId: string, reason: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: { not: 'DELETED' },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or deleted');
    }

    const report = await this.prisma.report.create({
      data: {
        reporter_id: reporterId,
        product_id: productId,
        reason,
        status: ReportStatus.PENDING,
      },
      include: {
        product: true,
        reporter: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Product reported successfully',
      data: report,
    };
  }

  async findAll(userRole: Role) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can access reports');
    }

    const reports = await this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        product: {
          include: {
            images: { take: 1 },
            seller: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      data: reports,
    };
  }

  async updateStatus(userRole: Role, reportId: string, status: ReportStatus) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can manage reports');
    }

    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        product: true,
      },
    });

    return {
      success: true,
      message: `Report status updated to ${status}`,
      data: updatedReport,
    };
  }
}
