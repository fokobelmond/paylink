import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier si le téléphone existe déjà
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: this.normalizePhone(dto.phone) },
    });

    if (existingPhone) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: this.normalizePhone(dto.phone),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        subscription: {
          create: {
            plan: 'FREE',
            maxPages: 1,
            transactionFee: 0.03,
          },
        },
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Sauvegarder le refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      ...tokens,
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé');
    }

    // Mettre à jour la date de dernière connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Sauvegarder le refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      },
      ...tokens,
    };
  }

  /**
   * Déconnexion - Invalider le refresh token
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Rafraîchir les tokens
   */
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Trouver le refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Token invalide');
    }

    // Vérifier l'expiration
    if (new Date() > tokenRecord.expiresAt) {
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new UnauthorizedException('Token expiré');
    }

    // Supprimer l'ancien token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Générer de nouveaux tokens
    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
    );

    // Sauvegarder le nouveau refresh token
    await this.saveRefreshToken(tokenRecord.user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Obtenir l'utilisateur courant
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Générer les tokens JWT
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Sauvegarder le refresh token
   */
  private async saveRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Normaliser un numéro de téléphone camerounais
   */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '').replace('+', '');

    if (cleaned.startsWith('237')) {
      return cleaned;
    }

    return `237${cleaned}`;
  }
}

