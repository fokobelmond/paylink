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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle page' })
  @ApiResponse({ status: 201, description: 'Page créée' })
  @ApiResponse({ status: 403, description: 'Limite de pages atteinte' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePageDto) {
    const page = await this.pagesService.create(userId, dto);
    return {
      success: true,
      data: page,
      message: 'Page créée avec succès',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister les pages de l'utilisateur" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.pagesService.findAllByUser(userId, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Get('check-slug/:slug')
  @ApiOperation({ summary: 'Vérifier la disponibilité d\'un slug' })
  @ApiParam({ name: 'slug', description: 'Slug à vérifier' })
  async checkSlug(@Param('slug') slug: string) {
    const result = await this.pagesService.checkSlugAvailability(slug);
    return {
      success: true,
      data: result,
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtenir une page par slug (public)' })
  @ApiParam({ name: 'slug', description: 'Slug de la page' })
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.pagesService.findBySlug(slug);
    return {
      success: true,
      data: page,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir une page par ID' })
  @ApiParam({ name: 'id', description: 'ID de la page' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const page = await this.pagesService.findById(id, userId);
    return {
      success: true,
      data: page,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une page' })
  @ApiParam({ name: 'id', description: 'ID de la page' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePageDto,
  ) {
    const page = await this.pagesService.update(id, userId, dto);
    return {
      success: true,
      data: page,
      message: 'Page mise à jour',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une page' })
  @ApiParam({ name: 'id', description: 'ID de la page' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.pagesService.delete(id, userId);
    return {
      success: true,
      message: 'Page supprimée',
    };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publier une page' })
  @ApiParam({ name: 'id', description: 'ID de la page' })
  async publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const page = await this.pagesService.publish(id, userId);
    return {
      success: true,
      data: page,
      message: 'Page publiée',
    };
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dépublier une page' })
  @ApiParam({ name: 'id', description: 'ID de la page' })
  async unpublish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const page = await this.pagesService.unpublish(id, userId);
    return {
      success: true,
      data: page,
      message: 'Page mise en pause',
    };
  }
}

