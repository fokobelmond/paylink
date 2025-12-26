import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtenir le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        subscription: user.subscription,
        createdAt: user.createdAt,
      },
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { firstName?: string; lastName?: string },
  ) {
    const user = await this.usersService.updateProfile(userId, data);
    return {
      success: true,
      data: user,
      message: 'Profil mis à jour',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques utilisateur' })
  @ApiResponse({ status: 200, description: 'Statistiques' })
  async getStats(@CurrentUser('id') userId: string) {
    const stats = await this.usersService.getUserStats(userId);
    return {
      success: true,
      data: stats,
    };
  }
}


