import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageStatus, Prisma } from '@prisma/client';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle page
   */
  async create(userId: string, dto: CreatePageDto) {
    // Vérifier les limites de l'abonnement
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new ForbiddenException('Abonnement non trouvé');
    }

    const existingPagesCount = await this.prisma.page.count({
      where: { userId },
    });

    if (existingPagesCount >= subscription.maxPages) {
      throw new ForbiddenException(
        `Vous avez atteint la limite de ${subscription.maxPages} page(s). Passez à un plan supérieur.`,
      );
    }

    // Vérifier que le slug est disponible
    const existingSlug = await this.prisma.page.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Ce slug est déjà utilisé');
    }

    // Créer la page
    return this.prisma.page.create({
      data: {
        slug: dto.slug,
        userId,
        templateType: dto.templateType,
        title: dto.title,
        description: dto.description,
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor || '#2563eb',
        templateData: dto.templateData || {},
        status: 'DRAFT',
      },
      include: {
        services: true,
      },
    });
  }

  /**
   * Lister les pages d'un utilisateur
   */
  async findAllByUser(
    userId: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where: { userId },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.page.count({ where: { userId } }),
    ]);

    return {
      data: pages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtenir une page par ID
   */
  async findById(id: string, userId?: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Si userId est fourni, vérifier que c'est le propriétaire
    if (userId && page.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à accéder à cette page");
    }

    return page;
  }

  /**
   * Obtenir une page par slug (public)
   */
  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          select: {
            firstName: true,
            phone: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Incrémenter le compteur de vues
    await this.prisma.page.update({
      where: { id: page.id },
      data: { viewCount: { increment: 1 } },
    });

    return page;
  }

  /**
   * Mettre à jour une page
   */
  async update(id: string, userId: string, dto: UpdatePageDto) {
    const page = await this.findById(id, userId);

    // Vérifier le slug si changé
    if (dto.slug && dto.slug !== page.slug) {
      const existingSlug = await this.prisma.page.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('Ce slug est déjà utilisé');
      }
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        ...dto,
        templateData: dto.templateData as Prisma.InputJsonValue,
      },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Supprimer une page
   */
  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    await this.prisma.page.delete({
      where: { id },
    });
  }

  /**
   * Publier une page
   */
  async publish(id: string, userId: string) {
    const page = await this.findById(id, userId);

    // Vérifier qu'il y a au moins un service actif (sauf pour les dons)
    if (page.templateType !== 'DONATION') {
      const activeServices = await this.prisma.service.count({
        where: { pageId: id, isActive: true },
      });

      if (activeServices === 0) {
        throw new ForbiddenException(
          'Ajoutez au moins un service avant de publier',
        );
      }
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Dépublier une page
   */
  async unpublish(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'PAUSED',
      },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Vérifier la disponibilité d'un slug
   */
  async checkSlugAvailability(slug: string) {
    const existing = await this.prisma.page.findUnique({
      where: { slug },
    });

    return { available: !existing };
  }
}

