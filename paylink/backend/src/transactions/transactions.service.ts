import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lister les transactions d'un utilisateur
   */
  async findAllByUser(
    userId: string,
    page = 1,
    limit = 10,
    status?: TransactionStatus,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      page: { userId },
      ...(status && { status }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          page: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtenir une transaction par ID
   */
  async findById(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true,
            userId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    // Vérifier que l'utilisateur est le propriétaire de la page
    if (transaction.page.userId !== userId) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return transaction;
  }

  /**
   * Obtenir une transaction par référence
   */
  async findByReference(reference: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true,
            userId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    if (transaction.page.userId !== userId) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return transaction;
  }

  /**
   * Obtenir les statistiques de transactions
   */
  async getStats(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }

    const [successCount, pendingCount, failedCount, totalRevenue] =
      await Promise.all([
        this.prisma.transaction.count({
          where: {
            page: { userId },
            status: 'SUCCESS',
            createdAt: { gte: startDate },
          },
        }),
        this.prisma.transaction.count({
          where: {
            page: { userId },
            status: 'PENDING',
            createdAt: { gte: startDate },
          },
        }),
        this.prisma.transaction.count({
          where: {
            page: { userId },
            status: 'FAILED',
            createdAt: { gte: startDate },
          },
        }),
        this.prisma.transaction.aggregate({
          where: {
            page: { userId },
            status: 'SUCCESS',
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
      ]);

    return {
      period,
      successCount,
      pendingCount,
      failedCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  /**
   * Exporter les transactions (CSV)
   */
  async exportTransactions(userId: string, startDate?: Date, endDate?: Date) {
    const where = {
      page: { userId },
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        page: { select: { title: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Générer le CSV
    const headers = [
      'Référence',
      'Date',
      'Page',
      'Service',
      'Montant',
      'Payeur',
      'Téléphone',
      'Provider',
      'Statut',
    ];

    const rows = transactions.map((tx) => [
      tx.reference,
      tx.createdAt.toISOString(),
      tx.page.title,
      tx.service?.name || '-',
      tx.amount,
      tx.payerName || '-',
      tx.payerPhone,
      tx.provider,
      tx.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return csv;
  }
}

