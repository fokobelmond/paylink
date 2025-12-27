import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);

    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async verifyUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async getUserStats(userId: string) {
    const [pages, transactions] = await Promise.all([
      this.prisma.page.count({
        where: { userId },
      }),
      this.prisma.transaction.count({
        where: {
          page: { userId },
          status: 'SUCCESS',
        },
      }),
    ]);

    const revenue = await this.prisma.transaction.aggregate({
      where: {
        page: { userId },
        status: 'SUCCESS',
      },
      _sum: {
        grossAmount: true,
      },
    });

    return {
      totalPages: pages,
      totalTransactions: transactions,
      totalRevenue: revenue._sum?.grossAmount || 0,
    };
  }
}


