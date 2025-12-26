import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionStatus } from '@prisma/client';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "Lister les transactions de l'utilisateur" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TransactionStatus,
  ) {
    const result = await this.transactionsService.findAllByUser(
      userId,
      page,
      limit,
      status,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de transactions' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  async getStats(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'day' | 'week' | 'month',
  ) {
    const stats = await this.transactionsService.getStats(userId, period);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Exporter les transactions en CSV' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async export(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.transactionsService.exportTransactions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${Date.now()}.csv`,
    );
    res!.send(csv);
  }

  @Get('ref/:reference')
  @ApiOperation({ summary: 'Obtenir une transaction par référence' })
  @ApiParam({ name: 'reference', description: 'Référence de la transaction' })
  async findByReference(
    @Param('reference') reference: string,
    @CurrentUser('id') userId: string,
  ) {
    const transaction = await this.transactionsService.findByReference(
      reference,
      userId,
    );
    return {
      success: true,
      data: transaction,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une transaction par ID' })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const transaction = await this.transactionsService.findById(id, userId);
    return {
      success: true,
      data: transaction,
    };
  }
}


