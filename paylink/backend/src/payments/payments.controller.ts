import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initier un paiement Mobile Money (public)' })
  @ApiResponse({ status: 201, description: 'Paiement initié' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Page ou service non trouvé' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    const result = await this.paymentsService.initiatePayment(dto);
    return {
      success: true,
      data: {
        transaction: result.transaction,
        paymentUrl: result.paymentUrl,
      },
      message: result.isNew
        ? 'Paiement initié. Validez sur votre téléphone.'
        : 'Paiement déjà en cours.',
    };
  }

  @Get('status/:reference')
  @ApiOperation({ summary: 'Vérifier le statut d\'un paiement (public)' })
  @ApiParam({ name: 'reference', description: 'Référence de la transaction' })
  @ApiResponse({ status: 200, description: 'Statut du paiement' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  async checkStatus(@Param('reference') reference: string) {
    const result = await this.paymentsService.checkPaymentStatus(reference);
    return {
      success: true,
      data: result,
    };
  }

  @Post('webhook/orange-money')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Orange Money' })
  @ApiHeader({ name: 'x-signature', description: 'Signature du webhook' })
  async handleOrangeMoneyWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    const result = await this.paymentsService.handleWebhook(
      'orange_money',
      payload,
      signature,
    );
    return result;
  }

  @Post('webhook/mtn-momo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook MTN MoMo' })
  @ApiHeader({ name: 'x-signature', description: 'Signature du webhook' })
  async handleMtnMomoWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    const result = await this.paymentsService.handleWebhook(
      'mtn_momo',
      payload,
      signature,
    );
    return result;
  }
}

