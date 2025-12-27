import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtenir les statistiques du dashboard
   */
  async getStats(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Requêtes en parallèle pour la performance
    const [
      totalPages,
      totalTransactions,
      pendingTransactions,
      totalRevenueResult,
      recentTransactions,
      revenueByDay,
    ] = await Promise.all([
      // Nombre total de pages
      this.prisma.page.count({
        where: { userId },
      }),

      // Nombre total de transactions réussies
      this.prisma.transaction.count({
        where: {
          page: { userId },
          status: 'SUCCESS',
        },
      }),

      // Transactions en attente
      this.prisma.transaction.count({
        where: {
          page: { userId },
          status: 'PENDING',
        },
      }),

      // Revenu total
      this.prisma.transaction.aggregate({
        where: {
          page: { userId },
          status: 'SUCCESS',
        },
        _sum: { amount: true },
      }),

      // Transactions récentes
      this.prisma.transaction.findMany({
        where: {
          page: { userId },
        },
        include: {
          page: { select: { title: true, slug: true } },
          service: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Revenu par jour (30 derniers jours)
      this.getRevenueByDay(userId, thirtyDaysAgo),
    ]);

    return {
      totalPages,
      totalTransactions,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      pendingTransactions,
      recentTransactions,
      revenueByDay,
    };
  }

  /**
   * Calculer le revenu par jour
   */
  private async getRevenueByDay(userId: string, startDate: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        page: { userId },
        status: 'SUCCESS',
        paidAt: { gte: startDate },
      },
      select: {
        amount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    // Grouper par jour
    const revenueMap = new Map<string, number>();

    transactions.forEach((tx) => {
      if (tx.paidAt) {
        const dateKey = tx.paidAt.toISOString().split('T')[0];
        revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + tx.amount);
      }
    });

    // Convertir en tableau
    return Array.from(revenueMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  /**
   * Obtenir les pages les plus performantes
   */
  async getTopPages(userId: string, limit = 5) {
    const pages = await this.prisma.page.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: {
        transactions: { _count: 'desc' },
      },
      take: limit,
    });

    // Calculer le revenu pour chaque page
    const pagesWithRevenue = await Promise.all(
      pages.map(async (page) => {
        const revenue = await this.prisma.transaction.aggregate({
          where: {
            pageId: page.id,
            status: 'SUCCESS',
          },
          _sum: { amount: true },
        });

        return {
          ...page,
          totalRevenue: revenue._sum.amount || 0,
        };
      }),
    );

    return pagesWithRevenue;
  }
}

