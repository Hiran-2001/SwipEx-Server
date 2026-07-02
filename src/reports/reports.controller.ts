import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReportStatus, Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  async createReport(
    @CurrentUser() user: any,
    @Body('productId', ParseUUIDPipe) productId: string,
    @Body('reason') reason: string, 
  ) {
    return this.reportsService.createReport(user.id, productId, reason);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.reportsService.findAll(user.role as Role);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.reportsService.updateStatus(user.role as Role, id, status);
  }
}
