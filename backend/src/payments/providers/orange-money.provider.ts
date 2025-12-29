import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Documentation officielle Orange Money API:
 * https://developer.orange.com/apis/om-webpay-cm/overview
 * 
 * Pour obtenir les credentials:
 * 1. Créer un compte sur https://developer.orange.com
 * 2. Souscrire à l'API "Orange Money Webpay" pour le Cameroun
 * 3. Obtenir le Merchant Key et les API credentials
 */

export interface OrangeMoneyConfig {
  merchantKey: string;
  apiUser: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export interface OrangeMoneyPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
  customerMsisdn: string;  // Numéro de téléphone du client
  customerEmail?: string;
  customerName?: string;
}

export interface OrangeMoneyPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  payToken?: string;
  transactionId?: string;
  message?: string;
  errorCode?: string;
}

export interface OrangeMoneyWebhookPayload {
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  txnid: string;
  orderId: string;
  amount: number;
  message?: string;
  payToken?: string;
}

@Injectable()
export class OrangeMoneyProvider {
  private readonly logger = new Logger(OrangeMoneyProvider.name);
  private config: OrangeMoneyConfig;
  private baseUrl: string;
  private accessToken = '';
  private tokenExpiry = 0;

  constructor(private configService: ConfigService) {
    this.config = {
      merchantKey: this.configService.get('ORANGE_MONEY_MERCHANT_KEY') || '',
      apiUser: this.configService.get('ORANGE_MONEY_API_USER') || '',
      apiKey: this.configService.get('ORANGE_MONEY_API_KEY') || '',
      webhookSecret: this.configService.get('ORANGE_MONEY_WEBHOOK_SECRET') || '',
      environment: (this.configService.get('ORANGE_MONEY_ENV') as 'sandbox' | 'production') || 'sandbox',
    };

    // URLs selon l'environnement
    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.orange.com/orange-money-webpay/cm/v1'
      : 'https://api.orange.com/orange-money-webpay/cm/v1'; // Sandbox utilise la même URL avec credentials différents
  }

  /**
   * Vérifie si le provider est configuré
   */
  isConfigured(): boolean {
    return !!(this.config.merchantKey && this.config.apiUser && this.config.apiKey);
  }

  /**
   * Obtient un token d'accès OAuth2
   */
  private async getAccessToken(): Promise<string> {
    // Vérifier si le token est encore valide
    if (this.accessToken !== '' && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const authUrl = 'https://api.orange.com/oauth/v3/token';
    const credentials = Buffer.from(`${this.config.apiUser}:${this.config.apiKey}`).toString('base64');

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OAuth error: ${error}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Expire 1 min avant

      return this.accessToken;
    } catch (error) {
      this.logger.error('Erreur obtention token Orange Money:', error);
      throw error;
    }
  }

  /**
   * Initie un paiement Orange Money
   */
  async initiatePayment(request: OrangeMoneyPaymentRequest): Promise<OrangeMoneyPaymentResponse> {
    if (!this.isConfigured()) {
      this.logger.warn('Orange Money non configuré - Mode simulation');
      return this.simulatePayment(request);
    }

    try {
      const token = await this.getAccessToken();

      // Étape 1: Obtenir un pay token
      const payTokenResponse = await fetch(`${this.baseUrl}/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Merchant-Key': this.config.merchantKey,
        },
        body: JSON.stringify({
          merchant_key: this.config.merchantKey,
          currency: request.currency || 'XAF',
          order_id: request.orderId,
          amount: request.amount,
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
          notif_url: request.notifyUrl,
          lang: 'fr',
          reference: request.description,
        }),
      });

      if (!payTokenResponse.ok) {
        const errorText = await payTokenResponse.text();
        this.logger.error('Erreur Orange Money initiation:', errorText);
        return {
          success: false,
          message: 'Erreur lors de l\'initiation du paiement',
          errorCode: payTokenResponse.status.toString(),
        };
      }

      const payTokenData = await payTokenResponse.json();

      if (payTokenData.status !== 201 && !payTokenData.pay_token) {
        return {
          success: false,
          message: payTokenData.message || 'Erreur inconnue',
          errorCode: payTokenData.status?.toString(),
        };
      }

      // Construire l'URL de paiement
      const paymentUrl = `${this.baseUrl}/webpayment?payToken=${payTokenData.pay_token}`;

      return {
        success: true,
        paymentUrl,
        payToken: payTokenData.pay_token,
        transactionId: payTokenData.txnid || request.orderId,
      };
    } catch (error) {
      this.logger.error('Erreur Orange Money:', error);
      return {
        success: false,
        message: error.message || 'Erreur technique',
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async checkPaymentStatus(payToken: string): Promise<OrangeMoneyWebhookPayload | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/webpayment/${payToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Merchant-Key': this.config.merchantKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        status: data.status,
        txnid: data.txnid,
        orderId: data.order_id,
        amount: data.amount,
        message: data.message,
        payToken: data.pay_token,
      };
    } catch (error) {
      this.logger.error('Erreur vérification statut:', error);
      return null;
    }
  }

  /**
   * Vérifie la signature d'un webhook
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) {
      this.logger.warn('Webhook secret non configuré');
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
  private async simulatePayment(request: OrangeMoneyPaymentRequest): Promise<OrangeMoneyPaymentResponse> {
    this.logger.log(`[SIMULATION] Paiement Orange Money: ${request.amount} ${request.currency}`);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // En mode simulation, on renvoie une réponse simulée
    return {
      success: true,
      paymentUrl: `${request.returnUrl}?simulated=true&orderId=${request.orderId}`,
      payToken: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: `OM_SIM_${request.orderId}`,
      message: 'Paiement simulé (Orange Money non configuré)',
    };
  }
}

