import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentProvider, TransactionStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

interface PaymentProviderResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Initier un paiement Mobile Money
   * Cette méthode est IDEMPOTENTE grâce à l'idempotencyKey
   */
  async initiatePayment(dto: InitiatePaymentDto) {
    // Générer une clé d'idempotence basée sur les paramètres
    const idempotencyKey = this.generateIdempotencyKey(dto);

    // Vérifier si une transaction existe déjà avec cette clé
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existingTransaction) {
      // Si la transaction existe, retourner le résultat existant
      this.logger.log(
        `Transaction existante trouvée: ${existingTransaction.reference}`,
      );

      return {
        transaction: existingTransaction,
        isNew: false,
      };
    }

    // Vérifier que la page existe et est publiée
    const page = await this.prisma.page.findUnique({
      where: { id: dto.pageId },
      include: {
        user: {
          include: { subscription: true },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    if (page.status !== 'PUBLISHED') {
      throw new BadRequestException('Cette page n\'est pas disponible');
    }

    // Vérifier le service si fourni
    let service = null;
    if (dto.serviceId) {
      service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });

      if (!service || service.pageId !== dto.pageId || !service.isActive) {
        throw new NotFoundException('Service non trouvé');
      }
    }

    // Valider le montant
    const amount = dto.amount || service?.price;
    if (!amount || amount < 100) {
      throw new BadRequestException('Montant invalide (minimum 100 FCFA)');
    }

    // Générer une référence unique lisible
    const reference = `PL-${nanoid(8).toUpperCase()}`;

    // Créer la transaction en base
    const transaction = await this.prisma.transaction.create({
      data: {
        reference,
        pageId: dto.pageId,
        serviceId: dto.serviceId,
        amount,
        currency: 'XAF',
        payerPhone: this.normalizePhone(dto.payerPhone),
        payerName: dto.payerName,
        payerEmail: dto.payerEmail,
        provider: dto.provider,
        status: 'PENDING',
        idempotencyKey,
      },
    });

    // Logger l'événement
    await this.logTransactionEvent(
      transaction.id,
      'PAYMENT_INITIATED',
      `Paiement initié via ${dto.provider}`,
      { amount, payerPhone: dto.payerPhone },
    );

    // Appeler l'API du provider (simulé ici)
    try {
      const providerResponse = await this.callPaymentProvider(
        dto.provider,
        transaction,
      );

      // Mettre à jour la transaction avec la réponse du provider
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          providerReference: providerResponse.transactionId,
          providerResponse: providerResponse as any,
        },
      });

      await this.logTransactionEvent(
        transaction.id,
        'PROVIDER_CALLED',
        'Appel API provider réussi',
        providerResponse,
      );

      return {
        transaction: await this.prisma.transaction.findUnique({
          where: { id: transaction.id },
        }),
        paymentUrl: providerResponse.paymentUrl,
        isNew: true,
      };
    } catch (error) {
      // En cas d'erreur, marquer comme FAILED
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          providerResponse: { error: error.message },
        },
      });

      await this.logTransactionEvent(
        transaction.id,
        'PROVIDER_ERROR',
        error.message,
        { error: error.message },
      );

      throw new BadRequestException(
        'Erreur lors de l\'initiation du paiement. Veuillez réessayer.',
      );
    }
  }

  /**
   * Traiter un webhook de paiement (avec vérification de signature)
   */
  async handleWebhook(
    provider: string,
    payload: any,
    signature: string | undefined,
  ) {
    // Enregistrer le webhook reçu
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        provider,
        eventType: payload.event || payload.type || 'unknown',
        payload,
        signature,
        isValid: false,
      },
    });

    try {
      // Vérifier la signature
      const isValid = this.verifyWebhookSignature(provider, payload, signature);

      if (!isValid) {
        this.logger.warn(`Webhook invalide reçu de ${provider}`);
        return { success: false, message: 'Invalid signature' };
      }

      // Mettre à jour le webhook comme valide
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { isValid: true },
      });

      // Extraire la référence de transaction
      const reference = this.extractReferenceFromWebhook(provider, payload);
      if (!reference) {
        this.logger.warn('Référence de transaction non trouvée dans le webhook');
        return { success: false, message: 'Reference not found' };
      }

      // Trouver la transaction
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          OR: [
            { reference },
            { providerReference: reference },
          ],
        },
        include: {
          page: {
            include: { user: true },
          },
        },
      });

      if (!transaction) {
        this.logger.warn(`Transaction non trouvée: ${reference}`);
        return { success: false, message: 'Transaction not found' };
      }

      // Traiter selon le statut
      const newStatus = this.mapWebhookStatus(provider, payload);

      if (newStatus === 'SUCCESS' && transaction.status !== 'SUCCESS') {
        // Paiement réussi
        await this.handlePaymentSuccess(transaction, payload);
      } else if (newStatus === 'FAILED' && transaction.status !== 'FAILED') {
        // Paiement échoué
        await this.handlePaymentFailure(transaction, payload);
      }

      // Marquer le webhook comme traité
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur traitement webhook: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(reference: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return {
      status: transaction.status,
      transaction,
    };
  }

  /**
   * Gérer un paiement réussi
   */
  private async handlePaymentSuccess(transaction: any, webhookPayload: any) {
    // Mettre à jour la transaction
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        providerResponse: webhookPayload,
      },
    });

    await this.logTransactionEvent(
      transaction.id,
      'PAYMENT_SUCCESS',
      'Paiement confirmé',
      webhookPayload,
    );

    // Envoyer les notifications
    await this.sendPaymentNotifications(transaction, 'success');
  }

  /**
   * Gérer un paiement échoué
   */
  private async handlePaymentFailure(transaction: any, webhookPayload: any) {
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'FAILED',
        providerResponse: webhookPayload,
      },
    });

    await this.logTransactionEvent(
      transaction.id,
      'PAYMENT_FAILED',
      'Paiement échoué',
      webhookPayload,
    );
  }

  /**
   * Envoyer les notifications après paiement
   */
  private async sendPaymentNotifications(
    transaction: any,
    type: 'success' | 'failure',
  ) {
    try {
      // SMS au payeur
      if (type === 'success') {
        await this.notifications.sendSms(
          transaction.payerPhone,
          `PayLink: Votre paiement de ${transaction.amount} FCFA a été reçu. Ref: ${transaction.reference}`,
        );

        // SMS au vendeur
        await this.notifications.sendSms(
          transaction.page.user.phone,
          `PayLink: Vous avez reçu un paiement de ${transaction.amount} FCFA de ${transaction.payerName || transaction.payerPhone}. Ref: ${transaction.reference}`,
        );

        // Marquer comme envoyé
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: { smsSent: true },
        });
      }
    } catch (error) {
      this.logger.error(`Erreur envoi notifications: ${error.message}`);
    }
  }

  /**
   * Générer une clé d'idempotence
   */
  private generateIdempotencyKey(dto: InitiatePaymentDto): string {
    const data = `${dto.pageId}-${dto.serviceId || 'none'}-${dto.payerPhone}-${dto.amount}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Appeler l'API du provider de paiement (simulé)
   */
  private async callPaymentProvider(
    provider: PaymentProvider,
    transaction: any,
  ): Promise<PaymentProviderResponse> {
    // Simulation - En production, appeler les vraies APIs
    // Orange Money API ou MTN MoMo API

    this.logger.log(`Appel ${provider} pour ${transaction.reference}`);

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simuler une réponse réussie
    return {
      success: true,
      transactionId: `${provider}-${nanoid(12)}`,
      message: 'Payment initiated',
    };

    // En production:
    // if (provider === 'ORANGE_MONEY') {
    //   return this.callOrangeMoneyApi(transaction);
    // } else {
    //   return this.callMtnMomoApi(transaction);
    // }
  }

  /**
   * Vérifier la signature du webhook
   */
  private verifyWebhookSignature(
    provider: string,
    payload: any,
    signature: string | undefined,
  ): boolean {
    if (!signature) {
      return false;
    }

    const secret =
      provider === 'orange_money'
        ? this.configService.get('ORANGE_MONEY_WEBHOOK_SECRET')
        : this.configService.get('MTN_MOMO_WEBHOOK_SECRET');

    if (!secret) {
      // En dev, accepter sans vérification
      return process.env.NODE_ENV !== 'production';
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Extraire la référence du webhook
   */
  private extractReferenceFromWebhook(provider: string, payload: any): string | null {
    // Adapter selon le format de chaque provider
    return (
      payload.reference ||
      payload.transactionId ||
      payload.externalId ||
      payload.data?.reference ||
      null
    );
  }

  /**
   * Mapper le statut du webhook vers notre enum
   */
  private mapWebhookStatus(provider: string, payload: any): TransactionStatus {
    const status = payload.status || payload.state || '';

    const successStatuses = ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID'];
    const failedStatuses = ['FAILED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

    if (successStatuses.includes(status.toUpperCase())) {
      return 'SUCCESS';
    }

    if (failedStatuses.includes(status.toUpperCase())) {
      return 'FAILED';
    }

    return 'PROCESSING';
  }

  /**
   * Logger un événement de transaction
   */
  private async logTransactionEvent(
    transactionId: string,
    event: string,
    message: string,
    metadata?: any,
  ) {
    await this.prisma.transactionLog.create({
      data: {
        transactionId,
        event,
        message,
        metadata,
      },
    });
  }

  /**
   * Normaliser un numéro de téléphone
   */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '').replace('+', '');

    if (cleaned.startsWith('237')) {
      return cleaned;
    }

    return `237${cleaned}`;
  }
}

