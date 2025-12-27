import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { TemplateType } from '@prisma/client';

export class CreatePageDto {
  @ApiProperty({
    example: 'ma-boutique',
    description: 'Slug unique pour l\'URL de la page',
  })
  @IsString()
  @MinLength(3, { message: 'Le slug doit contenir au moins 3 caractères' })
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
  })
  slug: string;

  @ApiProperty({
    enum: TemplateType,
    example: 'SERVICE_PROVIDER',
    description: 'Type de template',
  })
  @IsEnum(TemplateType, { message: 'Type de template invalide' })
  templateType: TemplateType;

  @ApiProperty({ example: 'Ma Boutique' })
  @IsString()
  @MinLength(2, { message: 'Le titre doit contenir au moins 2 caractères' })
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Description de ma boutique' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#2563eb' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Couleur invalide (format: #RRGGBB)',
  })
  primaryColor?: string;

  @ApiPropertyOptional({
    example: { profession: 'Coiffeuse', location: 'Douala' },
    description: 'Données spécifiques au template',
  })
  @IsOptional()
  @IsObject()
  templateData?: Record<string, unknown>;
}

