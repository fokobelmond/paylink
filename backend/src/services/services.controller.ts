import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('services')
@Controller('pages/:pageId/services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un service pour une page' })
  @ApiParam({ name: 'pageId', description: 'ID de la page' })
  @ApiResponse({ status: 201, description: 'Service créé' })
  async create(
    @Param('pageId') pageId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateServiceDto,
  ) {
    const service = await this.servicesService.create(pageId, userId, dto);
    return {
      success: true,
      data: service,
      message: 'Service créé',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lister les services d\'une page' })
  @ApiParam({ name: 'pageId', description: 'ID de la page' })
  async findAll(@Param('pageId') pageId: string) {
    const services = await this.servicesService.findAllByPage(pageId);
    return {
      success: true,
      data: services,
    };
  }

  @Patch(':serviceId')
  @ApiOperation({ summary: 'Mettre à jour un service' })
  @ApiParam({ name: 'pageId', description: 'ID de la page' })
  @ApiParam({ name: 'serviceId', description: 'ID du service' })
  async update(
    @Param('pageId') pageId: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const service = await this.servicesService.update(
      pageId,
      serviceId,
      userId,
      dto,
    );
    return {
      success: true,
      data: service,
      message: 'Service mis à jour',
    };
  }

  @Delete(':serviceId')
  @ApiOperation({ summary: 'Supprimer un service' })
  @ApiParam({ name: 'pageId', description: 'ID de la page' })
  @ApiParam({ name: 'serviceId', description: 'ID du service' })
  async remove(
    @Param('pageId') pageId: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.servicesService.delete(pageId, serviceId, userId);
    return {
      success: true,
      message: 'Service supprimé',
    };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Réordonner les services' })
  @ApiParam({ name: 'pageId', description: 'ID de la page' })
  async reorder(
    @Param('pageId') pageId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { serviceIds: string[] },
  ) {
    const services = await this.servicesService.reorder(
      pageId,
      userId,
      body.serviceIds,
    );
    return {
      success: true,
      data: services,
      message: 'Ordre mis à jour',
    };
  }
}


