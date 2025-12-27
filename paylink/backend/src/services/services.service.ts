import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vérifier que l'utilisateur possède la page
   */
  private async verifyPageOwnership(pageId: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cette page");
    }

    return page;
  }

  /**
   * Créer un nouveau service
   */
  async create(pageId: string, userId: string, dto: CreateServiceDto) {
    await this.verifyPageOwnership(pageId, userId);

    // Obtenir le prochain sortOrder
    const lastService = await this.prisma.service.findFirst({
      where: { pageId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = dto.sortOrder ?? (lastService?.sortOrder ?? 0) + 1;

    return this.prisma.service.create({
      data: {
        pageId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        sortOrder,
      },
    });
  }

  /**
   * Lister les services d'une page
   */
  async findAllByPage(pageId: string) {
    return this.prisma.service.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Mettre à jour un service
   */
  async update(
    pageId: string,
    serviceId: string,
    userId: string,
    dto: UpdateServiceDto,
  ) {
    await this.verifyPageOwnership(pageId, userId);

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.pageId !== pageId) {
      throw new NotFoundException('Service non trouvé');
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: dto,
    });
  }

  /**
   * Supprimer un service
   */
  async delete(pageId: string, serviceId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.pageId !== pageId) {
      throw new NotFoundException('Service non trouvé');
    }

    await this.prisma.service.delete({
      where: { id: serviceId },
    });
  }

  /**
   * Réordonner les services
   */
  async reorder(pageId: string, userId: string, serviceIds: string[]) {
    await this.verifyPageOwnership(pageId, userId);

    // Mettre à jour l'ordre de chaque service
    await Promise.all(
      serviceIds.map((id, index) =>
        this.prisma.service.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.findAllByPage(pageId);
  }
}

