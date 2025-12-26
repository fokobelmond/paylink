import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PricingService, PriceCalculation } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentProvider } from '@prisma/client';

/**
 * DTO pour le calcul de prix
 */
class CalculatePriceDto {
  amount: number;
  mode: 'net' | 'gross';
  provider: PaymentProvider;
}

/**
 * DTO pour le calcul d'un panier
 */
class CalculateCartDto {
  items: Array<{ serviceId: string; quantity: number }>;
  provider: PaymentProvider;
}

/**
 * Réponse publique du calcul (sans détails sensibles)
 */
interface PublicPriceResponse {
  displayAmount: number;      // Montant affiché au client
  currency: string;
  message: string;            // "Montant final – frais inclus"
}

/**
 * Réponse complète pour le vendeur
 */
interface VendorPriceResponse extends PriceCalculation {
  displayMessage: string;     // Message explicatif pour le vendeur
}

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * Calcul de prix pour le vendeur (dashboard)
   * Retourne tous les détails des frais
   * 
   * POST /pricing/calculate
   */
  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async calculatePrice(@Body() dto: CalculatePriceDto): Promise<VendorPriceResponse> {
    let calculation: PriceCalculation;
    
    if (dto.mode === 'net') {
      // Mode par défaut: le vendeur indique ce qu'il veut recevoir
      calculation = await this.pricingService.calculateFromNetAmount(
        dto.amount,
        dto.provider,
      );
    } else {
      // Mode avancé: le vendeur fixe le prix public
      calculation = await this.pricingService.calculateFromGrossAmount(
        dto.amount,
        dto.provider,
      );
    }
    
    const displayMessage = dto.mode === 'net'
      ? `Pour recevoir ${calculation.netAmount.toLocaleString()} FCFA, le client paiera ${calculation.grossAmount.toLocaleString()} FCFA (frais inclus).`
      : `Avec un prix de ${calculation.grossAmount.toLocaleString()} FCFA, vous recevrez ${calculation.netAmount.toLocaleString()} FCFA après frais.`;
    
    return {
      ...calculation,
      displayMessage,
    };
  }

  /**
   * Calcul de prix pour le panier (vendeur)
   * 
   * POST /pricing/calculate-cart
   */
  @Post('calculate-cart')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async calculateCart(@Body() dto: CalculateCartDto) {
    return this.pricingService.calculateCart(dto.items, dto.provider);
  }

  /**
   * Estimation rapide côté client (sans auth)
   * Retourne uniquement le montant final sans détails
   * 
   * GET /pricing/estimate?netAmount=10000&provider=ORANGE_MONEY
   */
  @Get('estimate')
  @HttpCode(HttpStatus.OK)
  async estimatePrice(
    @Query('netAmount') netAmount: string,
    @Query('provider') provider: PaymentProvider,
  ): Promise<PublicPriceResponse> {
    const amount = parseInt(netAmount, 10);
    
    if (isNaN(amount) || amount < 100) {
      return {
        displayAmount: 0,
        currency: 'XAF',
        message: 'Montant invalide',
      };
    }
    
    const calculation = await this.pricingService.calculateFromNetAmount(
      amount,
      provider,
    );
    
    return {
      displayAmount: calculation.grossAmount,
      currency: calculation.currency,
      message: 'Montant final – frais inclus',
    };
  }

  /**
   * Récupère les frais actifs (admin/debug)
   * 
   * GET /pricing/fees
   */
  @Get('fees')
  @UseGuards(JwtAuthGuard)
  async getActiveFees() {
    return this.pricingService.getAllActiveFees();
  }

  /**
   * Initialise les frais par défaut
   * 
   * POST /pricing/seed
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedFees() {
    await this.pricingService.seedDefaultFees();
    return { message: 'Frais par défaut initialisés' };
  }
}


