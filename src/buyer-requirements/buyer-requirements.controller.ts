import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BuyerRequirementsService } from './buyer-requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('requirements')
export class BuyerRequirementsController {
  constructor(private requirementsService: BuyerRequirementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateRequirementDto) {
    return this.requirementsService.create(user.id, dto);
  }

  @Get()
  async findAll(
    @Query('category_id') category_id?: string,
    @Query('max_budget') max_budget?: string,
    @Query('location') location?: string,
  ) {
    return this.requirementsService.findAll({ category_id, max_budget, location });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requirementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.requirementsService.update(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.requirementsService.delete(user.id, id);
  }
}
