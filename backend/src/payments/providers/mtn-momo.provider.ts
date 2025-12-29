import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Documentation officielle MTN MoMo API:
 * https://momodeveloper.mtn.com
 * 
 * Pour obtenir les credentials:
 * 1. Créer un compte sur https://momodeveloper.mtn.com
 * 2. Souscrire à l'API "Collection" pour le Cameroun
 * 3. Créer un API User et obtenir les credentials
 */

export interface MtnMomoConfig {
  apiUser: string;
  apiKey: string;
  subscriptionKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  callbackHost: string;
}

export interface MtnMomoPaymentRequest {
  amount: number;
  currency: string;
  externalId: string;
  payerPartyId: string;  // Numéro MSISDN (ex: 237xxxxxxxxx)
  payerMessage: string;
  payeeNote: string;
}

export interface MtnMomoPaymentResponse {
  success: boolean;
  referenceId?: string;
  status?: string;
  message?: string;
  errorCode?: string;
}

export interface MtnMomoTransactionStatus {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  externalId: string;
  amount: number;
  currency: string;
  payerPartyId: string;
  reason?: string;
}

@Injectable()
export class MtnMomoProvider {
  private readonly logger = new Logger(MtnMomoProvider.name);
  private config: MtnMomoConfig;
  private baseUrl: string;
  private accessToken = '';
  private tokenExpiry = 0;

  constructor(private configService: ConfigService) {
    this.config = {
      apiUser: this.configService.get('MTN_MOMO_API_USER') || '',
      apiKey: this.configService.get('MTN_MOMO_API_KEY') || '',
      subscriptionKey: this.configService.get('MTN_MOMO_SUBSCRIPTION_KEY') || '',
      webhookSecret: this.configService.get('MTN_MOMO_WEBHOOK_SECRET') || '',
      environment: (this.configService.get('MTN_MOMO_ENV') as 'sandbox' | 'production') || 'sandbox',
      callbackHost: this.configService.get('BACKEND_URL') || 'http://localhost:4000',
    };

    // URLs selon l'environnement
    this.baseUrl = this.config.environment === 'production'
      ? 'https://proxy.momoapi.mtn.com/collection/v1_0'
      : 'https://sandbox.momodeveloper.mtn.com/collection/v1_0';
  }

  /**
   * Vérifie si le provider est configuré
   */
  isConfigured(): boolean {
    return !!(this.config.apiUser && this.config.apiKey && this.config.subscriptionKey);
  }

  /**
   * Obtient un token d'accès
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken !== '' && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.config.apiUser}:${this.config.apiKey}`).toString('base64');
    const tokenUrl = this.config.environment === 'production'
      ? 'https://proxy.momoapi.mtn.com/collection/token/'
      : 'https://sandbox.momodeveloper.mtn.com/collection/token/';

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MTN Token error: ${error}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      this.logger.error('Erreur obtention token MTN MoMo:', error);
      throw error;
    }
  }

  /**
   * Initie une demande de paiement (Request to Pay)
   */
  async initiatePayment(request: MtnMomoPaymentRequest): Promise<MtnMomoPaymentResponse> {
    if (!this.isConfigured()) {
      this.logger.warn('MTN MoMo non configuré - Mode simulation');
      return this.simulatePayment(request);
    }

    try {
      const token = await this.getAccessToken();
      const referenceId = crypto.randomUUID();

      const response = await fetch(`${this.baseUrl}/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.config.environment,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          'Content-Type': 'application/json',
          'X-Callback-Url': `${this.config.callbackHost}/api/payments/webhook/mtn_momo`,
        },
        body: JSON.stringify({
          amount: request.amount.toString(),
          currency: request.currency || 'XAF',
          externalId: request.externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: request.payerPartyId,
          },
          payerMessage: request.payerMessage,
          payeeNote: request.payeeNote,
        }),
      });

      // MTN retourne 202 Accepted pour une requête réussie
      if (response.status === 202) {
        return {
          success: true,
          referenceId,
          status: 'PENDING',
          message: 'Demande de paiement envoyée. Vérifiez votre téléphone.',
        };
      }

      const errorText = await response.text();
      this.logger.error('Erreur MTN MoMo:', errorText);
      return {
        success: false,
        message: 'Erreur lors de la demande de paiement',
        errorCode: response.status.toString(),
      };
    } catch (error) {
      this.logger.error('Erreur MTN MoMo:', error);
      return {
        success: false,
        message: error.message || 'Erreur technique',
      };
    }
  }

  /**
   * Vérifie le statut d'une transaction
   */
  async checkTransactionStatus(referenceId: string): Promise<MtnMomoTransactionStatus | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/requesttopay/${referenceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.config.environment,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        status: data.status,
        externalId: data.externalId,
        amount: parseFloat(data.amount),
        currency: data.currency,
        payerPartyId: data.payer?.partyId,
        reason: data.reason,
      };
    } catch (error) {
      this.logger.error('Erreur vérification statut MTN:', error);
      return null;
    }
  }

  /**
   * Vérifie la signature d'un webhook
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) {
      this.logger.warn('Webhook secret MTN non configuré');
      return this.config.environment !== 'production';
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Mode simulation pour les tests
   */
  private async simulatePayment(request: MtnMomoPaymentRequest): Promise<MtnMomoPaymentResponse> {
    this.logger.log(`[SIMULATION] Paiement MTN MoMo: ${request.amount} ${request.currency}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      referenceId: `MTN_SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      message: 'Paiement simulé (MTN MoMo non configuré)',
    };
  }
}

