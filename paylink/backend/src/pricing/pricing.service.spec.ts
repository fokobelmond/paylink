import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

/**
 * Tests unitaires pour le service de calcul des prix
 * 
 * RÈGLES CRITIQUES TESTÉES:
 * - Tous les montants sont en FCFA (entiers)
 * - Calculs déterministes et reproductibles
 * - Le vendeur reçoit AU MINIMUM ce qu'il a demandé
 * - Gestion des cas limites
 */
describe('PricingService', () => {
  let service: PricingService;
  let prisma: PrismaService;

  // Mock des frais standards
  const mockFees = {
    ORANGE_MONEY: {
      fixedFee: 0,
      percentageFee: 0.015,        // 1.5%
      platformFixedFee: 0,
      platformPercentage: 0.02,    // 2%
      version: 1,
    },
    MTN_MOMO: {
      fixedFee: 100,               // 100 FCFA fixe
      percentageFee: 0.01,         // 1%
      platformFixedFee: 0,
      platformPercentage: 0.02,    // 2%
      version: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: {
            paymentFee: {
              findFirst: jest.fn().mockImplementation(({ where }) => {
                const provider = where.provider as PaymentProvider;
                return Promise.resolve({
                  id: 'fee-1',
                  provider,
                  minAmount: 100,
                  maxAmount: 10_000_000,
                  ...mockFees[provider],
                  isActive: true,
                  validFrom: new Date(),
                  validUntil: null,
                });
              }),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            service: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Validation des montants', () => {
    it('doit rejeter les montants non entiers', async () => {
      await expect(
        service.calculateFromNetAmount(1000.5, 'ORANGE_MONEY'),
      ).rejects.toThrow(BadRequestException);
    });

    it('doit rejeter les montants < 100 FCFA', async () => {
      await expect(
        service.calculateFromNetAmount(99, 'ORANGE_MONEY'),
      ).rejects.toThrow('Le montant minimum est 100 FCFA');
    });

    it('doit rejeter les montants > 10 000 000 FCFA', async () => {
      await expect(
        service.calculateFromNetAmount(10_000_001, 'ORANGE_MONEY'),
      ).rejects.toThrow('Le montant maximum est 10 000 000 FCFA');
    });

    it('doit accepter le montant minimum (100 FCFA)', async () => {
      const result = await service.calculateFromNetAmount(100, 'ORANGE_MONEY');
      expect(result.netAmount).toBeGreaterThanOrEqual(100);
    });

    it('doit accepter le montant maximum (10 000 000 FCFA)', async () => {
      const result = await service.calculateFromNetAmount(10_000_000, 'ORANGE_MONEY');
      expect(result.netAmount).toBeGreaterThanOrEqual(10_000_000);
    });
  });

  describe('Calcul depuis montant net (MODE NET_AMOUNT)', () => {
    it('doit calculer correctement pour 10 000 FCFA net avec Orange Money', async () => {
      // Frais: 1.5% Orange + 2% PayLink = 3.5%
      // grossAmount = 10000 / (1 - 0.035) = 10363 FCFA (arrondi)
      const result = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      
      expect(result.netAmount).toBeGreaterThanOrEqual(10_000);
      expect(result.grossAmount).toBeGreaterThan(result.netAmount);
      expect(result.providerFee).toBeGreaterThan(0);
      expect(result.platformFee).toBeGreaterThan(0);
      expect(result.grossAmount).toBe(result.netAmount + result.providerFee + result.platformFee);
    });

    it('doit calculer correctement pour 50 000 FCFA net avec MTN MoMo', async () => {
      // Frais: 100 FCFA fixe + 1% MTN + 2% PayLink = 3%
      const result = await service.calculateFromNetAmount(50_000, 'MTN_MOMO');
      
      expect(result.netAmount).toBeGreaterThanOrEqual(50_000);
      expect(result.providerFee).toBeGreaterThanOrEqual(100); // Au moins les frais fixes
      expect(result.currency).toBe('XAF');
    });

    it('doit garantir que le vendeur reçoit AU MOINS le montant demandé', async () => {
      // Test avec plusieurs montants
      const amounts = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000, 500000];
      
      for (const amount of amounts) {
        const result = await service.calculateFromNetAmount(amount, 'ORANGE_MONEY');
        expect(result.netAmount).toBeGreaterThanOrEqual(amount);
      }
    });

    it('doit produire des résultats déterministes', async () => {
      // Le même calcul doit toujours donner le même résultat
      const result1 = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      const result2 = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      
      expect(result1.grossAmount).toBe(result2.grossAmount);
      expect(result1.netAmount).toBe(result2.netAmount);
      expect(result1.providerFee).toBe(result2.providerFee);
      expect(result1.platformFee).toBe(result2.platformFee);
    });
  });

  describe('Calcul depuis montant brut (MODE FIXED_PRICE)', () => {
    it('doit calculer correctement pour 10 000 FCFA brut avec Orange Money', async () => {
      // Frais: 1.5% Orange + 2% PayLink = 3.5%
      // netAmount = 10000 - (10000 * 0.035) = 9650 FCFA
      const result = await service.calculateFromGrossAmount(10_000, 'ORANGE_MONEY');
      
      expect(result.grossAmount).toBe(10_000);
      expect(result.netAmount).toBeLessThan(result.grossAmount);
      expect(result.netAmount).toBeGreaterThan(0);
    });

    it('doit inclure les frais fixes pour MTN MoMo', async () => {
      const result = await service.calculateFromGrossAmount(10_000, 'MTN_MOMO');
      
      // Frais MTN: 100 fixe + 1% = 100 + 100 = 200
      // Frais PayLink: 2% = 200
      // Net = 10000 - 200 - 200 = 9600
      expect(result.providerFee).toBeGreaterThanOrEqual(100);
      expect(result.grossAmount).toBe(10_000);
    });

    it('doit rejeter si le montant net devient <= 0', async () => {
      // Montant trop faible pour couvrir les frais
      jest.spyOn(prisma.paymentFee, 'findFirst').mockResolvedValueOnce({
        id: 'fee-extreme',
        provider: 'ORANGE_MONEY',
        minAmount: 100,
        maxAmount: 10_000_000,
        fixedFee: 500,
        percentageFee: 0.5,         // 50%
        platformFixedFee: 500,
        platformPercentage: 0.4,    // 40%
        isActive: true,
        version: 1,
        validFrom: new Date(),
        validUntil: null,
        label: 'Test extreme',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.calculateFromGrossAmount(100, 'ORANGE_MONEY'),
      ).rejects.toThrow('Montant trop faible');
    });
  });

  describe('Cohérence des calculs', () => {
    it('grossAmount = netAmount + providerFee + platformFee', async () => {
      const amounts = [1000, 5000, 10000, 50000, 100000];
      
      for (const amount of amounts) {
        const result = await service.calculateFromNetAmount(amount, 'ORANGE_MONEY');
        expect(result.grossAmount).toBe(
          result.netAmount + result.providerFee + result.platformFee
        );
      }
    });

    it('totalFees = providerFee + platformFee', async () => {
      const result = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      expect(result.totalFees).toBe(result.providerFee + result.platformFee);
    });

    it('tous les montants sont des entiers positifs', async () => {
      const result = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      
      expect(Number.isInteger(result.grossAmount)).toBe(true);
      expect(Number.isInteger(result.netAmount)).toBe(true);
      expect(Number.isInteger(result.providerFee)).toBe(true);
      expect(Number.isInteger(result.platformFee)).toBe(true);
      
      expect(result.grossAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.providerFee).toBeGreaterThanOrEqual(0);
      expect(result.platformFee).toBeGreaterThanOrEqual(0);
    });
  });

  describe('FeeSnapshot pour audit', () => {
    it('doit inclure un snapshot complet des frais', async () => {
      const result = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      
      expect(result.feeSnapshot).toBeDefined();
      expect(result.feeSnapshot.provider).toBe('ORANGE_MONEY');
      expect(result.feeSnapshot.providerFixedFee).toBeDefined();
      expect(result.feeSnapshot.providerPercentage).toBeDefined();
      expect(result.feeSnapshot.platformFixedFee).toBeDefined();
      expect(result.feeSnapshot.platformPercentage).toBeDefined();
      expect(result.feeSnapshot.feeVersion).toBeDefined();
      expect(result.feeSnapshot.calculatedAt).toBeDefined();
    });

    it('doit permettre de recalculer exactement le même résultat', async () => {
      const result = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      
      // Recalcul manuel avec le snapshot
      const totalPct = result.feeSnapshot.providerPercentage + result.feeSnapshot.platformPercentage;
      const totalFixed = result.feeSnapshot.providerFixedFee + result.feeSnapshot.platformFixedFee;
      const recalculatedGross = Math.ceil((10_000 + totalFixed) / (1 - totalPct));
      
      // Doit être égal ou très proche (différence d'arrondi possible de 1)
      expect(Math.abs(result.grossAmount - recalculatedGross)).toBeLessThanOrEqual(1);
    });
  });

  describe('Comparaison entre providers', () => {
    it('MTN avec frais fixes doit être plus cher pour petits montants', async () => {
      const orangeResult = await service.calculateFromNetAmount(1000, 'ORANGE_MONEY');
      const mtnResult = await service.calculateFromNetAmount(1000, 'MTN_MOMO');
      
      // MTN a des frais fixes de 100 FCFA, donc plus cher pour petits montants
      expect(mtnResult.grossAmount).toBeGreaterThan(orangeResult.grossAmount);
    });

    it('les deux providers doivent garantir le montant net', async () => {
      const orangeResult = await service.calculateFromNetAmount(10_000, 'ORANGE_MONEY');
      const mtnResult = await service.calculateFromNetAmount(10_000, 'MTN_MOMO');
      
      expect(orangeResult.netAmount).toBeGreaterThanOrEqual(10_000);
      expect(mtnResult.netAmount).toBeGreaterThanOrEqual(10_000);
    });
  });

  describe('Cas limites', () => {
    it('doit gérer les petits montants (100 FCFA)', async () => {
      const result = await service.calculateFromNetAmount(100, 'ORANGE_MONEY');
      expect(result.netAmount).toBeGreaterThanOrEqual(100);
      expect(result.grossAmount).toBeGreaterThan(100);
    });

    it('doit gérer les grands montants (1 000 000 FCFA)', async () => {
      const result = await service.calculateFromNetAmount(1_000_000, 'ORANGE_MONEY');
      expect(result.netAmount).toBeGreaterThanOrEqual(1_000_000);
      // Frais de 3.5% = 35 000 FCFA environ
      expect(result.totalFees).toBeGreaterThan(30_000);
    });

    it('doit gérer les montants ronds exactement', async () => {
      const roundAmounts = [1000, 2000, 5000, 10000, 25000, 50000, 100000];
      
      for (const amount of roundAmounts) {
        const result = await service.calculateFromNetAmount(amount, 'ORANGE_MONEY');
        expect(result.netAmount).toBeGreaterThanOrEqual(amount);
      }
    });
  });
});

