import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider, PricingMode } from '@prisma/client';

/**
 * Résultat d'un calcul de prix
 * Contient tous les détails pour la traçabilité financière
 */
export interface PriceCalculation {
  // Montants principaux
  grossAmount: number;      // Ce que le client paie
  netAmount: number;        // Ce que le vendeur reçoit
  providerFee: number;      // Frais du provider (Orange/MTN)
  platformFee: number;      // Marge PayLink
  totalFees: number;        // Total des frais
  
  // Métadonnées
  provider: PaymentProvider;
  currency: string;
  
  // Snapshot pour audit (stocké dans la transaction)
  feeSnapshot: FeeSnapshot;
}

/**
 * Snapshot des frais appliqués
 * Stocké dans chaque transaction pour traçabilité
 */
export interface FeeSnapshot {
  provider: PaymentProvider;
  providerFixedFee: number;
  providerPercentage: number;
  platformFixedFee: number;
  platformPercentage: number;
  feeVersion: number;
  calculatedAt: string;
}

/**
 * Configuration des frais par défaut
 * Utilisée si aucune config n'existe en base
 */
const DEFAULT_FEES = {
  ORANGE_MONEY: {
    fixedFee: 0,
    percentageFee: 0.015,        // 1.5% frais Orange
    platformFixedFee: 0,
    platformPercentage: 0.02,    // 2% marge PayLink
  },
  MTN_MOMO: {
    fixedFee: 0,
    percentageFee: 0.015,        // 1.5% frais MTN
    platformFixedFee: 0,
    platformPercentage: 0.02,    // 2% marge PayLink
  },
};

/**
 * Service de calcul des prix
 * 
 * RÈGLES CRITIQUES:
 * - Tous les montants sont en FCFA (entiers)
 * - Pas de centimes (arrondi supérieur)
 * - Calculs déterministes et reproductibles
 * - Tests unitaires obligatoires
 */
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule le prix final à partir du montant net souhaité par le vendeur
   * 
   * MODE: NET_AMOUNT (par défaut)
   * Le vendeur dit: "Je veux recevoir 10 000 FCFA"
   * Le système calcule le montant à payer par le client
   * 
   * @param netAmount - Montant net souhaité par le vendeur (FCFA)
   * @param provider - Provider de paiement
   * @returns Calcul complet avec tous les détails
   */
  async calculateFromNetAmount(
    netAmount: number,
    provider: PaymentProvider,
  ): Promise<PriceCalculation> {
    this.validateAmount(netAmount);
    
    const fees = await this.getFeesForProvider(provider, netAmount);
    
    // Calcul inversé: trouver le montant brut qui donne le montant net souhaité
    // netAmount = grossAmount - providerFee - platformFee
    // netAmount = grossAmount - (grossAmount * providerPct + providerFixed) - (grossAmount * platformPct + platformFixed)
    // netAmount = grossAmount * (1 - providerPct - platformPct) - providerFixed - platformFixed
    // grossAmount = (netAmount + providerFixed + platformFixed) / (1 - providerPct - platformPct)
    
    const totalPercentage = fees.percentageFee + fees.platformPercentage;
    const totalFixed = fees.fixedFee + fees.platformFixedFee;
    
    if (totalPercentage >= 1) {
      throw new BadRequestException('Configuration de frais invalide: pourcentage total >= 100%');
    }
    
    const grossAmount = Math.ceil((netAmount + totalFixed) / (1 - totalPercentage));
    
    // Recalculer les frais exacts avec le montant brut arrondi
    const providerFee = Math.ceil(grossAmount * fees.percentageFee + fees.fixedFee);
    const platformFee = Math.ceil(grossAmount * fees.platformPercentage + fees.platformFixedFee);
    const actualNetAmount = grossAmount - providerFee - platformFee;
    
    // Vérification: le vendeur doit recevoir AU MOINS ce qu'il a demandé
    // En cas d'arrondi, il peut recevoir légèrement plus
    if (actualNetAmount < netAmount) {
      // Ajuster le grossAmount pour garantir le minimum
      const adjustedGrossAmount = grossAmount + 1;
      return this.calculateFromGrossAmount(adjustedGrossAmount, provider);
    }
    
    const feeSnapshot: FeeSnapshot = {
      provider,
      providerFixedFee: fees.fixedFee,
      providerPercentage: fees.percentageFee,
      platformFixedFee: fees.platformFixedFee,
      platformPercentage: fees.platformPercentage,
      feeVersion: fees.version,
      calculatedAt: new Date().toISOString(),
    };
    
    this.logger.debug(
      `Prix calculé: Net=${netAmount} -> Brut=${grossAmount} (Frais provider: ${providerFee}, Marge: ${platformFee})`,
    );
    
    return {
      grossAmount,
      netAmount: actualNetAmount,
      providerFee,
      platformFee,
      totalFees: providerFee + platformFee,
      provider,
      currency: 'XAF',
      feeSnapshot,
    };
  }

  /**
   * Calcule les frais à partir d'un prix fixé par le vendeur
   * 
   * MODE: FIXED_PRICE
   * Le vendeur dit: "Le prix est 10 000 FCFA"
   * Le système calcule ce que le vendeur recevra après frais
   * 
   * @param grossAmount - Prix fixé par le vendeur (FCFA)
   * @param provider - Provider de paiement
   * @returns Calcul complet avec tous les détails
   */
  async calculateFromGrossAmount(
    grossAmount: number,
    provider: PaymentProvider,
  ): Promise<PriceCalculation> {
    this.validateAmount(grossAmount);
    
    const fees = await this.getFeesForProvider(provider, grossAmount);
    
    // Calcul direct des frais
    const providerFee = Math.ceil(grossAmount * fees.percentageFee + fees.fixedFee);
    const platformFee = Math.ceil(grossAmount * fees.platformPercentage + fees.platformFixedFee);
    const netAmount = grossAmount - providerFee - platformFee;
    
    if (netAmount <= 0) {
      throw new BadRequestException(
        `Montant trop faible: le vendeur recevrait ${netAmount} FCFA après frais`,
      );
    }
    
    const feeSnapshot: FeeSnapshot = {
      provider,
      providerFixedFee: fees.fixedFee,
      providerPercentage: fees.percentageFee,
      platformFixedFee: fees.platformFixedFee,
      platformPercentage: fees.platformPercentage,
      feeVersion: fees.version,
      calculatedAt: new Date().toISOString(),
    };
    
    this.logger.debug(
      `Prix calculé: Brut=${grossAmount} -> Net=${netAmount} (Frais provider: ${providerFee}, Marge: ${platformFee})`,
    );
    
    return {
      grossAmount,
      netAmount,
      providerFee,
      platformFee,
      totalFees: providerFee + platformFee,
      provider,
      currency: 'XAF',
      feeSnapshot,
    };
  }

  /**
   * Calcule le prix pour un panier (plusieurs services)
   * 
   * @param items - Liste des items du panier
   * @param provider - Provider de paiement
   * @returns Calcul complet pour le panier
   */
  async calculateCart(
    items: Array<{ serviceId: string; quantity: number }>,
    provider: PaymentProvider,
  ): Promise<PriceCalculation & { cartDetails: Array<{ serviceId: string; quantity: number; unitPrice: number; subtotal: number }> }> {
    // Récupérer les services
    const serviceIds = items.map(item => item.serviceId);
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });
    
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Un ou plusieurs services sont invalides ou inactifs');
    }
    
    // Calculer le total net souhaité
    let totalNetAmount = 0;
    const cartDetails = items.map(item => {
      const service = services.find(s => s.id === item.serviceId)!;
      const subtotal = service.netPrice * item.quantity;
      totalNetAmount += subtotal;
      
      return {
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: service.netPrice,
        subtotal,
      };
    });
    
    // Calculer les frais pour le total
    const calculation = await this.calculateFromNetAmount(totalNetAmount, provider);
    
    return {
      ...calculation,
      cartDetails,
    };
  }

  /**
   * Obtient les frais configurés pour un provider et un montant donné
   */
  private async getFeesForProvider(
    provider: PaymentProvider,
    amount: number,
  ): Promise<{
    fixedFee: number;
    percentageFee: number;
    platformFixedFee: number;
    platformPercentage: number;
    version: number;
  }> {
    // Chercher la configuration en base
    const fee = await this.prisma.paymentFee.findFirst({
      where: {
        provider,
        isActive: true,
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { version: 'desc' },
    });
    
    if (fee) {
      return {
        fixedFee: fee.fixedFee,
        percentageFee: fee.percentageFee,
        platformFixedFee: fee.platformFixedFee,
        platformPercentage: fee.platformPercentage,
        version: fee.version,
      };
    }
    
    // Fallback sur les valeurs par défaut
    this.logger.warn(
      `Aucune config de frais trouvée pour ${provider} et montant ${amount}, utilisation des valeurs par défaut`,
    );
    
    const defaultFee = DEFAULT_FEES[provider];
    return {
      ...defaultFee,
      version: 0,
    };
  }

  /**
   * Valide qu'un montant est correct
   */
  private validateAmount(amount: number): void {
    if (!Number.isInteger(amount)) {
      throw new BadRequestException('Le montant doit être un entier (FCFA)');
    }
    
    if (amount < 100) {
      throw new BadRequestException('Le montant minimum est 100 FCFA');
    }
    
    if (amount > 10_000_000) {
      throw new BadRequestException('Le montant maximum est 10 000 000 FCFA');
    }
  }

  /**
   * Crée ou met à jour la configuration des frais pour un provider
   * (Admin uniquement)
   */
  async upsertFeeConfiguration(
    provider: PaymentProvider,
    config: {
      minAmount: number;
      maxAmount: number;
      fixedFee?: number;
      percentageFee?: number;
      platformFixedFee?: number;
      platformPercentage?: number;
      label?: string;
    },
  ) {
    // Trouver la dernière version
    const lastVersion = await this.prisma.paymentFee.findFirst({
      where: { provider, minAmount: config.minAmount, maxAmount: config.maxAmount },
      orderBy: { version: 'desc' },
    });
    
    const newVersion = (lastVersion?.version ?? 0) + 1;
    
    // Désactiver l'ancienne version
    if (lastVersion) {
      await this.prisma.paymentFee.update({
        where: { id: lastVersion.id },
        data: { 
          isActive: false,
          validUntil: new Date(),
        },
      });
    }
    
    // Créer la nouvelle version
    return this.prisma.paymentFee.create({
      data: {
        provider,
        minAmount: config.minAmount,
        maxAmount: config.maxAmount,
        fixedFee: config.fixedFee ?? 0,
        percentageFee: config.percentageFee ?? DEFAULT_FEES[provider].percentageFee,
        platformFixedFee: config.platformFixedFee ?? 0,
        platformPercentage: config.platformPercentage ?? DEFAULT_FEES[provider].platformPercentage,
        label: config.label,
        version: newVersion,
      },
    });
  }

  /**
   * Récupère toutes les configurations de frais actives
   */
  async getAllActiveFees() {
    return this.prisma.paymentFee.findMany({
      where: { isActive: true },
      orderBy: [{ provider: 'asc' }, { minAmount: 'asc' }],
    });
  }

  /**
   * Seed les frais par défaut (pour l'initialisation)
   */
  async seedDefaultFees() {
    const providers: PaymentProvider[] = ['ORANGE_MONEY', 'MTN_MOMO'];
    
    for (const provider of providers) {
      const existing = await this.prisma.paymentFee.findFirst({
        where: { provider, isActive: true },
      });
      
      if (!existing) {
        await this.upsertFeeConfiguration(provider, {
          minAmount: 100,
          maxAmount: 10_000_000,
          ...DEFAULT_FEES[provider],
          label: 'Frais standard',
        });
        
        this.logger.log(`Frais par défaut créés pour ${provider}`);
      }
    }
  }
}

