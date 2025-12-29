import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
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
import * as bcrypt from 'bcrypt';

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

  @Patch('password')
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe mis à jour' })
  @ApiResponse({ status: 400, description: 'Mot de passe actuel incorrect' })
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.usersService.findById(userId);

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    await this.usersService.updatePassword(userId, data.newPassword);

    return {
      success: true,
      message: 'Mot de passe mis à jour',
    };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Supprimer mon compte' })
  @ApiResponse({ status: 200, description: 'Compte supprimé' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.usersService.deleteAccount(userId);
    return {
      success: true,
      message: 'Compte supprimé avec succès',
    };
  }
}


