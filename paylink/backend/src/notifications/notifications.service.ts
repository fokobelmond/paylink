import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface SmsProvider {
  send(phone: string, message: string): Promise<boolean>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  /**
   * Envoyer un SMS
   * En production, intégrer avec un provider SMS camerounais
   * (ex: Orange SMS API, CM.com, Africa's Talking)
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      // Normaliser le numéro
      const normalizedPhone = this.normalizePhone(phone);

      this.logger.log(`[SMS] Envoi à ${normalizedPhone}: ${message}`);

      // En développement, logger seulement
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.debug(`[SMS SIMULÉ] ${normalizedPhone}: ${message}`);
        return true;
      }

      // En production, appeler l'API SMS
      // Exemple avec un provider hypothétique:
      /*
      const response = await fetch('https://sms-provider.cm/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.configService.get('SMS_API_KEY')}`,
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: message,
          sender: 'PayLink',
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.status}`);
      }
      */

      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi SMS: ${error.message}`);
      return false;
    }
  }

  /**
   * Envoyer un email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`[EMAIL] Envoi à ${to}: ${subject}`);

      // En développement sans clé API, logger seulement
      if (!this.resend) {
        this.logger.debug(`[EMAIL SIMULÉ] ${to}: ${subject}`);
        return true;
      }

      await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM') || 'PayLink <noreply@paylink.cm>',
        to,
        subject,
        html,
      });

      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi email: ${error.message}`);
      return false;
    }
  }

  /**
   * Notification de paiement réussi au vendeur
   */
  async notifyPaymentReceived(
    sellerPhone: string,
    sellerEmail: string | null,
    amount: number,
    payerName: string | null,
    reference: string,
  ): Promise<void> {
    const payerInfo = payerName || 'un client';

    // SMS prioritaire
    await this.sendSms(
      sellerPhone,
      `PayLink: Vous avez reçu ${amount} FCFA de ${payerInfo}. Réf: ${reference}`,
    );

    // Email si disponible
    if (sellerEmail) {
      await this.sendEmail(
        sellerEmail,
        `Nouveau paiement reçu - ${amount} FCFA`,
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">💰 Nouveau paiement reçu !</h2>
            <p>Vous avez reçu un paiement de <strong>${amount} FCFA</strong> de ${payerInfo}.</p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Référence:</strong> ${reference}</p>
              <p style="margin: 8px 0 0;"><strong>Montant:</strong> ${amount} FCFA</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Connectez-vous à votre dashboard PayLink pour plus de détails.
            </p>
          </div>
        `,
      );
    }
  }

  /**
   * Notification de paiement réussi au payeur
   */
  async notifyPaymentConfirmed(
    payerPhone: string,
    payerEmail: string | null,
    amount: number,
    reference: string,
    pageName: string,
  ): Promise<void> {
    // SMS
    await this.sendSms(
      payerPhone,
      `PayLink: Votre paiement de ${amount} FCFA pour "${pageName}" est confirmé. Réf: ${reference}`,
    );

    // Email si disponible
    if (payerEmail) {
      await this.sendEmail(
        payerEmail,
        `Confirmation de paiement - ${reference}`,
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">✅ Paiement confirmé</h2>
            <p>Votre paiement a été reçu avec succès.</p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Pour:</strong> ${pageName}</p>
              <p style="margin: 8px 0;"><strong>Montant:</strong> ${amount} FCFA</p>
              <p style="margin: 0;"><strong>Référence:</strong> ${reference}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Conservez ce reçu pour vos records.
            </p>
          </div>
        `,
      );
    }
  }

  /**
   * Normaliser un numéro de téléphone camerounais
   */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '').replace('+', '');

    if (cleaned.startsWith('237')) {
      return `+${cleaned}`;
    }

    return `+237${cleaned}`;
  }
}

