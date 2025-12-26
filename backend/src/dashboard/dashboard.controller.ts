import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques du dashboard' })
  @ApiResponse({ status: 200, description: 'Statistiques du dashboard' })
  async getStats(@CurrentUser('id') userId: string) {
    const stats = await this.dashboardService.getStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('top-pages')
  @ApiOperation({ summary: 'Obtenir les pages les plus performantes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopPages(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    const pages = await this.dashboardService.getTopPages(userId, limit);
    return {
      success: true,
      data: pages,
    };
  }
}


