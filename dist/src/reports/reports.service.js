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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(reporterId, productId, reason) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                status: { not: 'DELETED' },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found or deleted');
        }
        const report = await this.prisma.report.create({
            data: {
                reporter_id: reporterId,
                product_id: productId,
                reason,
                status: client_1.ReportStatus.PENDING,
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
    async findAll(userRole) {
        if (userRole !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only administrators can access reports');
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
    async updateStatus(userRole, reportId, status) {
        if (userRole !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only administrators can manage reports');
        }
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map